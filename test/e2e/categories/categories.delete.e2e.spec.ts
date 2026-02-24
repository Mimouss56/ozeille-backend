import { type INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import request from "supertest";

import { CategoriesTestContext } from "./categories.test.context.e2e";

describe("Categories E2E - DELETE /api/categories/:id", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let testContext: CategoriesTestContext;

  let categoryToDeleteId: string;

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
  }, 30000);

  beforeEach(async () => {
    // Créer une catégorie fraîche avec un label unique avant chaque test de suppression
    const uniqueLabel = `À supprimer ${Date.now()}-${Math.random()}`;
    const cat = await prisma.category.create({
      data: {
        label: uniqueLabel,
        color: "#ffffff",
        userId: testContext.userId,
        budgetId: testContext.budgetId,
      },
    });
    categoryToDeleteId = cat.id;
  });

  afterAll(async () => {
    if (testContext) await testContext.cleanup();
    if (prisma) await prisma.$disconnect();
    await app.close();
  }, 10000);

  it("doit supprimer la catégorie existante avec succès", async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/categories/${categoryToDeleteId}`)
      .set("Authorization", `Bearer ${testContext.accessToken}`)
      .expect(200);

    expect(res.body.id).toBe(categoryToDeleteId);

    // Vérification en base de données
    const checkCat = await prisma.category.findUnique({ where: { id: categoryToDeleteId } });
    expect(checkCat).toBeNull();
  });

  it("doit retourner 404 si la catégorie à supprimer n'existe pas", async () => {
    // On utilise un UUID aléatoire
    const res = await request(app.getHttpServer())
      .delete(`/api/categories/123e4567-e89b-12d3-a456-426614174000`)
      .set("Authorization", `Bearer ${testContext.accessToken}`)
      .expect(404);

    expect(res.body.message).toMatch(/not found/i);
  });
});
