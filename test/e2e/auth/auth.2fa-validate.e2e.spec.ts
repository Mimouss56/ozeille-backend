import { type INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.module";
import request from "supertest";

import { AuthTestContext } from "./auth.test.context.e2e";
import { AuthDataset } from "./auth.dataset.e2e";

describe("POST /api/auth/2fa/validate (e2e)", () => {
  let app: INestApplication;
  let ctx: AuthTestContext;
  let prisma: PrismaService;
  let redis: RedisService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    redis = moduleFixture.get<RedisService>(RedisService);
    app = moduleFixture.createNestApplication();
    ctx = new AuthTestContext(prisma);
    await ctx.init();
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (redis) await redis.disconnect();
    await ctx.cleanup();
    if (prisma) await prisma.$disconnect();
    await app.close();
  }, 10000);

  afterEach(async () => {
    try {
      await redis.del(`2fa:${ctx.confirmedUserId}`);
    } catch (error) {
      console.warn("Failed to clean Redis:", error);
    }
  });

  it("devrait valider le code 2FA avec le tempToken et retourner les tokens JWT", async () => {
    const loginResponse = await request(app.getHttpServer()).post("/api/auth/login").send({
      email: AuthDataset.confirmedUser.email,
      password: AuthDataset.confirmedUser.password,
    });

    const tempToken = loginResponse.body.tempToken;
    const code = await redis.get(`2fa:${ctx.confirmedUserId}`);

    const response = await request(app.getHttpServer())
      .post("/api/auth/2fa/validate")
      .send({
        tempToken: tempToken,
        code: code,
      })
      .expect(201);

    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");

    const deletedCode = await redis.get(`2fa:${ctx.confirmedUserId}`);
    expect(deletedCode).toBeNull();
  });

  it("devrait retourner 401 si le code 2FA est invalide", async () => {
    const loginResponse = await request(app.getHttpServer()).post("/api/auth/login").send({
      email: AuthDataset.confirmedUser.email,
      password: AuthDataset.confirmedUser.password,
    });

    const response = await request(app.getHttpServer())
      .post("/api/auth/2fa/validate")
      .send({
        tempToken: loginResponse.body.tempToken,
        code: "99999999",
      })
      .expect(401);

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
