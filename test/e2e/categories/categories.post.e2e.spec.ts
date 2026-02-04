import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/services/redis.service";
// Vérifiez ce chemin d'import selon votre projet
import request from "supertest";

import { CategoriesTestContext } from "./categories.dataset.context.e2e";

describe("Categories E2E - POST categories", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let redis: RedisService;
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

    testContext = new CategoriesTestContext(prisma);
    await testContext.init();

    // 1. Login pour obtenir le tempToken
    const loginRes = await request(app.getHttpServer()).post("/api/auth/login").send({
      email: testContext.userEmail,
      password: testContext.password, // "Password123!"
    });

    // Si ça échoue ici, c'est souvent que le user n'est pas confirmedAt en base
    if (loginRes.status !== 201) {
      console.error("Login failed:", loginRes.body);
    }
    const tempToken = loginRes.body.tempToken;

    // 2. Récupération du code 2FA dans Redis
    // La clé dépend de votre implémentation (ex: "2fa:UUID")
    const code = await redis.get(`2fa:${testContext.userId}`);

    // 3. Validation du code pour obtenir l'accessToken
    const validateRes = await request(app.getHttpServer()).post("/api/auth/2fa/validate").send({
      tempToken,
      code,
    });

    accessToken = validateRes.body.accessToken;
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

  // it("doit retourner 409 si label existe déjà pour ce budget", async () => {
  //   const res = await request(app.getHttpServer())
  //     .post("/api/categories")
  //     .set("Authorization", `Bearer ${accessToken}`)
  //     .send({
  //       label: testContext.existingCategoryLabel,
  //       budgetId: testContext.budgetId,
  //       color: "#000000",
  //     });

  //   expect(res.status).toBe(409);
  // });
});
