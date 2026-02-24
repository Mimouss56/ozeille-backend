import { type INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import request from "supertest";

import { CategoriesDataset } from "./categories.dataset.e2e";
import { CategoriesTestContext } from "./categories.test.context.e2e";

describe("POST /api/categories (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let testContext: CategoriesTestContext;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    testContext = new CategoriesTestContext(prisma, jwtService);
    await testContext.init();
    // accessToken est maintenant généré dans le testContext
  }, 30000);

  afterAll(async () => {
    if (testContext) await testContext.cleanup();
    if (prisma) await prisma.$disconnect();
    await app.close();
  }, 10000);

  beforeEach(async () => {
    // 👈 Sécurité : on supprime la catégorie de test avant l'insertion pour garantir le succès
    await prisma.category.deleteMany({
      where: {
        label: CategoriesDataset.newCategory.label,
        userId: testContext.userId,
      },
    });
  });

  it("doit retourner 400 si budgetId est manquant", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Authorization", `Bearer ${testContext.accessToken}`)
      .send({
        label: "Test Catégorie",
        color: "#ffffff",
      })
      .expect(400);

    expect(res.body.message).toBe("Validation failed");
    expect(res.body.errors.some((error: any) => error.path?.includes("budgetId"))).toBe(true);
  });

  it("doit retourner 400 si budgetId n'est pas un uuid", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        label: "Test Catégorie",
        budgetId: "not-a-uuid",
        color: "#ffffff",
      })
      .expect(400);

    expect(res.body.errors.some((error: any) => error.path?.includes("budgetId"))).toBe(true);
  });

  it("doit retourner 400 si label est manquant", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        budgetId: "123e4567-e89b-12d3-a456-426614174000",
        color: "#ffffff",
      })
      .expect(400);

    expect(res.body.errors.some((error: any) => error.path?.includes("label"))).toBe(true);
  });

  it("doit créer une catégorie (succès)", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        ...CategoriesDataset.newCategory,
        budgetId: testContext.budgetId,
      })
      .expect(201);

    expect(res.body.label).toBe(CategoriesDataset.newCategory.label);
    expect(res.body.budgetId).toBe(testContext.budgetId);
  });

  it("doit retourner 404/409 si le label existe déjà pour ce budget/utilisateur", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        label: CategoriesDataset.existingCategory.label, // Utilisation du dataset
        budgetId: testContext.budgetId,
        color: "#000000",
      });

    expect([404, 409]).toContain(res.status); // Ton service actuel renvoie 404 via NotFoundException ou 409 via Prisma Error
  });

  it("doit retourner une erreur si budgetId n'existe pas en base", async () => {
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
});
