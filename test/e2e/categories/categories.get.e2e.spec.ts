import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import request from "supertest";

import type { CategoryDto } from "../../../src/categories/dto/category.dto";
import { CategoriesTestContext } from "./categories.dataset.context.e2e";

describe("Categories E2E - GET categories", () => {
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
    // Nettoyage des données de test
    if (testContext) await testContext.cleanup();
    if (prisma) await prisma.$disconnect();
    await app.close();
  }, 10000);

  it("doit retourner la liste paginée des catégories", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/categories?page=1&limit=5")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
  });

  it("doit filtrer par label existant", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/categories?label=${encodeURIComponent(testContext.existingCategoryLabel)}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    const data: CategoryDto[] = res.body.data;
    expect(Array.isArray(data)).toBe(true);
    expect(data.some((cat) => cat.label === testContext.existingCategoryLabel)).toBe(true);
  });

  it("doit retourner une catégorie par son id", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/categories/${testContext.existingCategoryId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    const cat: CategoryDto = res.body;
    expect(cat.id).toBe(testContext.existingCategoryId);
  });

  it("doit retourner 404 si l'id n'existe pas", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/categories/123e4567-e89b-12d3-a456-426614174000`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect([404, 400]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.message).toBe("Validation failed");
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.some((error: { path?: string[] }) => error.path?.includes("id"))).toBe(true);
    } else if (res.status === 404) {
      expect(res.body.message).toMatch(/not found/i);
    }
  });
});
