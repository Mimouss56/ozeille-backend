import { type INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import bcrypt from "bcrypt";
import Redis from "ioredis";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import request from "supertest";

describe("POST /api/auth/2fa/validate (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let redis: Redis;

  const testUser = {
    email: "validate-2fa-test@example.com",
    password: "Password123!",
    firstName: "Validate2FA",
    lastName: "Test",
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: Redis,
          useFactory: () => {
            return new Redis({
              host: process.env.REDIS_HOST || "localhost",
              port: parseInt(process.env.REDIS_PORT || "6379", 10),
              maxRetriesPerRequest: 3,
              retryStrategy: (times: number) => {
                if (times > 3) return null;
                return Math.min(times * 50, 2000);
              },
            });
          },
        },
      ],
    })
      .overrideProvider(Redis)
      .useFactory({
        factory: () => {
          return new Redis({
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT || "6379", 10),
            maxRetriesPerRequest: 3,
            retryStrategy: (times: number) => {
              if (times > 3) return null;
              return Math.min(times * 50, 2000);
            },
          });
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    redis = moduleFixture.get<Redis>(Redis);
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
    if (redis) await redis.quit();
    await app.close();
  }, 10000);

  beforeEach(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });

    const hashedPassword = await bcrypt.hash(testUser.password, 10);

    await prisma.user.create({
      data: {
        email: testUser.email,
        password: hashedPassword,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        confirmedAt: new Date(),
      },
    });
  });

  afterEach(async () => {
    const user = await prisma.user.findUnique({
      where: { email: testUser.email },
    });
    if (user) {
      try {
        await redis.del(`2fa:${user.id}`);
        const keys = await redis.keys(`temp-token:tmp_*`);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } catch (error) {
        console.warn("Failed to clean Redis:", error);
      }
    }
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  it("devrait valider le code 2FA avec le tempToken et retourner les tokens JWT", async () => {
    const loginResponse = await request(app.getHttpServer()).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(loginResponse.status).toBe(201);
    expect(loginResponse.body).toHaveProperty("tempToken");

    const tempToken = loginResponse.body.tempToken;

    const user = await prisma.user.findUnique({
      where: { email: testUser.email },
    });
    const code = await redis.get(`2fa:${user!.id}`);

    expect(code).not.toBeNull();

    const response = await request(app.getHttpServer())
      .post("/api/auth/2fa/validate")
      .send({
        tempToken: tempToken,
        code: code,
      })
      .expect(201);

    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");
    expect(typeof response.body.accessToken).toBe("string");
    expect(typeof response.body.refreshToken).toBe("string");

    const deletedCode = await redis.get(`2fa:${user!.id}`);
    expect(deletedCode).toBeNull();

    const deletedTempToken = await redis.get(`temp-token:${tempToken}`);
    expect(deletedTempToken).toBeNull();
  });

  it("devrait retourner 401 si le tempToken est invalide", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/2fa/validate")
      .send({
        tempToken: "tmp_invalid_token_1234567890abcdef",
        code: "12345678",
      })
      .expect(401);

    expect(response.body).toHaveProperty("message", "Token temporaire invalide ou expiré");
  });

  it("devrait retourner 401 si le code 2FA est invalide", async () => {
    const loginResponse = await request(app.getHttpServer()).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    const tempToken = loginResponse.body.tempToken;

    const response = await request(app.getHttpServer())
      .post("/api/auth/2fa/validate")
      .send({
        tempToken: tempToken,
        code: "99999999",
      })
      .expect(400);

    expect(response.body).toHaveProperty("message", "Validation failed");
  });

  it("devrait retourner 401 si le code 2FA a expiré ou n'existe pas", async () => {
    const loginResponse = await request(app.getHttpServer()).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    const tempToken = loginResponse.body.tempToken;

    const user = await prisma.user.findUnique({
      where: { email: testUser.email },
    });
    await redis.del(`2fa:${user!.id}`);

    const response = await request(app.getHttpServer())
      .post("/api/auth/2fa/validate")
      .send({
        tempToken: tempToken,
        code: "12345678",
      })
      .expect(400);

    expect(response.body).toHaveProperty("message", "Validation failed");
  });

  it("devrait retourner 400 si le tempToken est manquant", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/2fa/validate")
      .send({
        code: "12345678",
      })
      .expect(400);

    expect(response.body).toHaveProperty("message");
  });

  it("devrait retourner 400 si le code est manquant", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/2fa/validate")
      .send({
        tempToken: "tmp_1234567890abcdef",
      })
      .expect(400);

    expect(response.body).toHaveProperty("message");
  });

  it("devrait retourner 400 si le code n'a pas le bon format", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/2fa/validate")
      .send({
        tempToken: "tmp_1234567890abcdef",
        code: "123",
      })
      .expect(400);

    expect(response.body).toHaveProperty("message");
  });

  it("devrait retourner 400 si le code contient des caractères non numériques", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/2fa/validate")
      .send({
        tempToken: "tmp_1234567890abcdef",
        code: "1234abcd",
      })
      .expect(400);

    expect(response.body).toHaveProperty("message");
  });

  it("ne devrait pas permettre la réutilisation d'un tempToken", async () => {
    const loginResponse = await request(app.getHttpServer()).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    const tempToken = loginResponse.body.tempToken;

    const user = await prisma.user.findUnique({
      where: { email: testUser.email },
    });
    const code = await redis.get(`2fa:${user!.id}`);

    await request(app.getHttpServer())
      .post("/api/auth/2fa/validate")
      .send({
        tempToken: tempToken,
        code: code,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post("/api/auth/2fa/validate")
      .send({
        tempToken: tempToken,
        code: code,
      })
      .expect(400);

    expect(response.body).toHaveProperty("message", "Validation failed");
  });
});
