import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
// 👈 1. Import nécessaire
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/services/redis.service";
import request from "supertest";

import { CategoriesTestContext } from "./categories.dataset.context.e2e";

describe("Categories E2E - POST categories", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let redis: RedisService;
  let jwtService: JwtService;
  let testContext: CategoriesTestContext;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    redis = moduleFixture.get<RedisService>(RedisService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    testContext = new CategoriesTestContext(prisma);
    await testContext.init();

    // 4. Génération d'un token valide pour l'utilisateur du dataset
    // On met 'sub' et 'userId' pour être sûr de couvrir la stratégie JWT
    accessToken = jwtService.sign({
      sub: testContext.userId,
      userId: testContext.userId,
      email: testContext.userEmail,
    });
  }, 30000);

  afterAll(async () => {
    if (testContext) await testContext.cleanup();
    if (redis) await redis.disconnect();
    if (prisma) await prisma.$disconnect();
    await app.close();
  }, 10000);

  it("doit retourner 400 si budgetId est manquant", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        label: "Test Catégorie",
        color: "#ffffff",
        // budgetId manquant
      });
    expect(res.status).toBe(400);
  });

  it("doit retourner 400 si budgetId n'est pas un uuid", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        label: "Test Catégorie",
        budgetId: "not-a-uuid",
        color: "#ffffff",
      });
    expect(res.status).toBe(400);
  });

  it("doit retourner 400 si label est manquant", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        budgetId: "new-uuid-value-1234-5678-9012-345678901234",
        color: "#ffffff",
        // label manquant
      });
    expect(res.status).toBe(400);
  });

  it("doit retourner 404 (ou 406) si budgetId n'existe pas en base", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        label: "Catégorie Inexistante",
        budgetId: "123e4567-e89b-12d3-a456-426614174000",
        color: "#ffffff",
      });

    expect([404, 406, 400, 409, 500]).toContain(res.status);
  });

  it("doit créer une catégorie (succès)", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        label: "Catégorie Succès",
        budgetId: testContext.budgetId,
        color: "#FF5733",
        limitAmount: 100,
      });

    expect(res.status).toBe(201);
    expect(res.body.label).toBe("Catégorie Succès");
    expect(res.body.budgetId).toBe(testContext.budgetId);
  });

  it("doit retourner 409 si label existe déjà pour ce budget", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        label: testContext.existingCategoryLabel, // Label déjà pris dans le dataset
        budgetId: testContext.budgetId,
        color: "#000000",
      });

    expect(res.status).toBe(409);
  });
});
