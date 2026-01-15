import { type INestApplication } from "@nestjs/common";
import request from "supertest";

import { AuthTestContext } from "./auth.dataset.context.e2e";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.module";
import { CategoriesTestContext } from "../categories/categories.dataset.context.e2e";
import { TestingModule, Test } from "@nestjs/testing";
import { AppModule } from "src/app.module";

describe("POST /api/auth/register/confirm (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let redis: RedisService;
  let testContext: CategoriesTestContext;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    redis = moduleFixture.get<RedisService>(RedisService);

    testContext = new CategoriesTestContext(prisma);
    await testContext.init();
  }, 30000);

  afterAll(async () => {
    // --- NETTOYAGE DU DATASET ---
    if (testContext) await testContext.cleanup();

    if (redis) await redis.disconnect();
    if (prisma) await prisma.$disconnect();
    await app.close();
  }, 10000);

  it("devrait confirmer l'email avec un token valide", async () => {
    await redis.set(`confirm-email-token:${testToken}`, testEmail);

    const response = await request(app.getHttpServer())
      .post("/api/auth/register/confirm")
      .query({ token: testToken })
      .expect(204);

    expect(response.body).toEqual({});

    const user = await ctx.prisma.user.findUnique({
      where: { email: testEmail },
    });
    expect(user?.confirmedAt).not.toBeNull();

    const redisValue = await ctx.redis.get(`confirm-email-token:${testToken}`);
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
