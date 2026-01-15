import { INestApplication } from "@nestjs/common";
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

  it("doit retourner 400 si budgetId est manquant", async () => {
    const res = await request(app.getHttpServer()).post("/api/categories").send({
      label: "Test Catégorie",
      color: "#ffffff",
      userId: "test-user-id",
      // budgetId manquant
    });
    expect(res.status).toBe(400);
  });

  it("doit retourner 400 si budgetId n'est pas un uuid", async () => {
    const res = await request(app.getHttpServer()).post("/api/categories").send({
      label: "Test Catégorie",
      budgetId: "not-a-uuid",
      color: "#ffffff",
      userId: "test-user-id",
    });
    expect(res.status).toBe(400);
  });

  it("doit retourner 400 si label est manquant", async () => {
    const res = await request(app.getHttpServer()).post("/api/categories").send({
      budgetId: "new-uuid-value-1234-5678-9012-345678901234",
      color: "#ffffff",
      userId: "test-user-id",
      // label manquant
    });
    expect(res.status).toBe(400);
  });

  it("doit retourner 404 (ou 406) si budgetId n'existe pas en base", async () => {
    const res = await request(app.getHttpServer()).post("/api/categories").send({
      label: "Catégorie Inexistante",
      budgetId: "123e4567-e89b-12d3-a456-426614174000",
      color: "#ffffff",
      userId: testContext.userId,
    });
    expect([404, 406]).toContain(res.status);
  });

  it("doit créer une catégorie (succès)", async () => {
    const res = await request(app.getHttpServer()).post("/api/categories").send({
      label: "Catégorie Succès",
      budgetId: testContext.budgetId,
      userId: testContext.userId,
      color: "#FF5733",
      limitAmount: 100,
    });

    expect(res.status).toBe(201);
    expect(res.body.label).toBe("Catégorie Succès");
    expect(res.body.budgetId).toBe(testContext.budgetId);
  });

  it("doit retourner 409 si label existe déjà pour ce budget", async () => {
    const res = await request(app.getHttpServer()).post("/api/categories").send({
      label: testContext.existingCategoryLabel,
      budgetId: testContext.budgetId,
      color: "#000000",
      userId: testContext.userId,
    });

    // 4. Assertions
    expect(res.status).toBe(409);
  });
});
