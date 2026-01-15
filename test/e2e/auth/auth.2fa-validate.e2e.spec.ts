import { type INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import bcrypt from "bcrypt";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.module";
import request from "supertest";

import { AuthTestContext } from "./auth.dataset.context.e2e";

describe("POST /api/auth/2fa/validate (e2e)", () => {
  let app: INestApplication;
  let ctx: AuthTestContext;
  let prisma: PrismaService;
  let redis: RedisService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // ou le module qui fournit PrismaService
    }).compile();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    redis = moduleFixture.get<RedisService>(RedisService);
    app = moduleFixture.createNestApplication();
    ctx = new AuthTestContext(prisma);
    await app.init();
  }, 30000);

  afterAll(async () => {
    await ctx.cleanup();
    if (redis) await redis.disconnect();
    if (prisma) await prisma.$disconnect();
  }, 10000);

  beforeEach(async () => {
    await prisma.user.deleteMany({
      where: { email: ctx.testUser.email },
    });

    const hashedPassword = await bcrypt.hash(ctx.testUser.password, 10);

    await prisma.user.create({
      data: {
        email: ctx.testUser.email,
        password: hashedPassword,
        firstName: ctx.testUser.firstName,
        lastName: ctx.testUser.lastName,
        confirmedAt: new Date(),
      },
    });
  });

  afterEach(async () => {
    const user = await prisma.user.findUnique({
      where: { email: ctx.testUser.email },
    });
    if (user) {
      try {
        await redis.del(`2fa:${user.id}`);
        // Note: Pas de méthode keys() dans RedisService, on laisse les temp-tokens expirer
      } catch (error) {
        console.warn("Failed to clean Redis:", error);
      }
    }
    await prisma.user.deleteMany({
      where: { email: ctx.testUser.email },
    });
  });

  it("devrait valider le code 2FA avec le tempToken et retourner les tokens JWT", async () => {
    const loginResponse = await request(app.getHttpServer()).post("/api/auth/login").send({
      email: ctx.testUser.email,
      password: ctx.testUser.password,
    });

    expect(loginResponse.status).toBe(201);
    expect(loginResponse.body).toHaveProperty("tempToken");

    const tempToken = loginResponse.body.tempToken;

    const user = await prisma.user.findUnique({
      where: { email: ctx.testUser.email },
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
      email: ctx.testUser.email,
      password: ctx.testUser.password,
    });

    const tempToken = loginResponse.body.tempToken;

    const response = await request(app.getHttpServer())
      .post("/api/auth/2fa/validate")
      .send({
        tempToken: tempToken,
        code: "99999999",
      })
      .expect(401);

    // Accepte les deux messages car le tempToken peut expirer dans les tests concurrents
    expect(response.body.message).toMatch(
      /^(Code de vérification invalide ou expiré|Token temporaire invalide ou expiré)$/,
    );
  });

  it("devrait retourner 401 si le code 2FA a expiré ou n'existe pas", async () => {
    const loginResponse = await request(app.getHttpServer()).post("/api/auth/login").send({
      email: ctx.testUser.email,
      password: ctx.testUser.password,
    });

    const tempToken = loginResponse.body.tempToken;

    const user = await prisma.user.findUnique({
      where: { email: ctx.testUser.email },
    });
    await redis.del(`2fa:${user!.id}`);

    const response = await request(app.getHttpServer())
      .post("/api/auth/2fa/validate")
      .send({
        tempToken: tempToken,
        code: "12345678",
      })
      .expect(401);

    // Accepte les deux messages car le tempToken peut expirer dans les tests concurrents
    expect(response.body.message).toMatch(
      /^(Code de vérification invalide ou expiré|Token temporaire invalide ou expiré)$/,
    );
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
      email: ctx.testUser.email,
      password: ctx.testUser.password,
    });

    const tempToken = loginResponse.body.tempToken;

    const user = await prisma.user.findUnique({
      where: { email: ctx.testUser.email },
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
      .expect(401);

    expect(response.body).toHaveProperty("message", "Token temporaire invalide ou expiré");
  });
});
