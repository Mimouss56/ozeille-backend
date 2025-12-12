import { type INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import bcrypt from "bcrypt";
import Redis from "ioredis";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import request from "supertest";

describe("POST /api/auth/login (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let redis: Redis;

  const testUser = {
    email: "login-test@example.com",
    password: "Password123!",
    firstName: "Login",
    lastName: "Test",
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
  });

  it.skip("devrait se connecter avec des credentials valides et envoyer un code 2FA avec un tempToken", async () => {
    const response = await request(app.getHttpServer()).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("tempToken");
    expect(response.body.tempToken).toMatch(/^tmp_[a-f0-9]{64}$/);

    const user = await prisma.user.findUnique({
      where: { email: testUser.email },
    });
    const code = await redis.get(`2fa:${user!.id}`);
    expect(code).not.toBeNull();
    expect(code).toMatch(/^\d{8}$/);

    const tempToken = response.body.tempToken;
    const userIdFromToken = await redis.get(`temp-token:${tempToken}`);
    expect(userIdFromToken).toBe(user!.id);
  });

  it("devrait retourner 401 si l'email n'existe pas", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        email: "nonexistent@example.com",
        password: "SomePassword123!",
      })
      .expect(401);

    expect(response.body).toHaveProperty("message", "Email ou mot de passe incorrect");
  });

  it("devrait retourner 401 si le mot de passe est incorrect", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: "WrongPassword123!",
      })
      .expect(401);

    expect(response.body).toHaveProperty("message", "Email ou mot de passe incorrect");
  });

  it("devrait retourner 400 si l'email est manquant", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        password: testUser.password,
      })
      .expect(400);

    expect(response.body).toHaveProperty("message");
  });

  it("devrait retourner 400 si le mot de passe est manquant", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        email: testUser.email,
      })
      .expect(400);

    expect(response.body).toHaveProperty("message");
  });

  it("devrait retourner 400 si l'email est invalide", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        email: "invalid-email",
        password: testUser.password,
      })
      .expect(400);

    expect(response.body).toHaveProperty("message");
  });
});
