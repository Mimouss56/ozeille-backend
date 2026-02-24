import { type INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import type { CategoryDto } from "src/categories/dto/category.dto";
import { PrismaService } from "src/prisma/prisma.service";
import request from "supertest";

import { CategoriesTestContext } from "./categories.test.context.e2e";
import { CategoriesDataset } from "./categories.dataset.e2e";

describe("GET /api/categories (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
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
    jwtService = moduleFixture.get<JwtService>(JwtService);

    testContext = new CategoriesTestContext(prisma);
    await testContext.init();
    accessToken = await jwtService.signAsync({ sub: testContext.userId });
  }, 30000);

  afterAll(async () => {
    if (testContext) await testContext.cleanup();
    if (prisma) await prisma.$disconnect();
    await app.close();
  }, 10000);

  it("doit retourner la liste paginée des catégories", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/categories?page=1&limit=5")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
  });

  it("doit filtrer par label existant", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/categories?label=${encodeURIComponent(CategoriesDataset.existingCategory.label)}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const data: CategoryDto[] = res.body.data;
    expect(Array.isArray(data)).toBe(true);
    expect(data.some((cat) => cat.label === CategoriesDataset.existingCategory.label)).toBe(true);
  });

  it("doit retourner une catégorie par son id", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/categories/${testContext.existingCategoryId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const cat: CategoryDto = res.body;
    expect(cat.id).toBe(testContext.existingCategoryId);
  });

  it("doit retourner 404/400 si l'id n'existe pas ou est invalide", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/categories/123e4567-e89b-12d3-a456-426614174000`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect([404, 400]).toContain(res.status);
  });
});
