import { type INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.module";
import request from "supertest";

import { AuthTestContext } from "./auth.dataset.context.e2e";

describe("POST /api/auth/register/confirm (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let redis: RedisService;
  let testContext: AuthTestContext;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    redis = moduleFixture.get<RedisService>(RedisService);

    testContext = new AuthTestContext(prisma);
    await testContext.init();
  }, 30000);

  afterAll(async () => {
    if (redis) await redis.disconnect();
    if (prisma) await prisma.$disconnect();
  }, 10000);

  it("devrait confirmer l'email avec un token valide", async () => {
    await redis.set(`confirm-email-token:${testContext.testToken}`, testContext.testUser.email);

    const response = await request(app.getHttpServer())
      .post("/api/auth/register/confirm")
      .query({ token: testContext.testToken })
      .expect(204);

    expect(response.body).toEqual({});

    const user = await prisma.user.findUnique({
      where: { email: testContext.testUser.email },
    });
    expect(user?.confirmedAt).not.toBeNull();

    const redisValue = await redis.get(`confirm-email-token:${testContext.testToken}`);
    expect(redisValue).toBeNull();
  });

  it("devrait retourner 400 si le token est manquant", async () => {
    const response = await request(app.getHttpServer()).post("/api/auth/register/confirm").expect(400);

    expect(response.body).toHaveProperty("message", "token is required");
  });

  it("devrait retourner ok: false si le token est invalide", async () => {
    const requete = await request(app.getHttpServer())
      .post("/api/auth/register/confirm")
      .query({ token: "invalid-token" });

    expect(requete.badRequest).toBe(true);
  });

  it("devrait retourner ok: false si le token a expiré", async () => {
    const requete = await request(app.getHttpServer())
      .post("/api/auth/register/confirm")
      .query({ token: "expired-token" });

    expect(requete.badRequest).toBe(true);
  });
});
