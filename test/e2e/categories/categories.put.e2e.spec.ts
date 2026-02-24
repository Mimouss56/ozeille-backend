import { type INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import request from "supertest";

import { CategoriesTestContext } from "./categories.test.context.e2e";

describe("Categories E2E - PUT /api/categories/:id", () => {
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
  }, 30000);

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

  it("doit mettre à jour une catégorie existante", async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/categories/${testContext.existingCategoryId}`)
      .set("Authorization", `Bearer ${testContext.accessToken}`)
      .set("Authorization", `Bearer ${testContext.accessToken}`)
      .set("Authorization", `Bearer ${testContext.accessToken}`)
      .set("Authorization", `Bearer ${testContext.accessToken}`)
      .send({
        label: "Label Modifié",
        color: "#00FF00",
      })
      .expect(200);

    expect(res.body.label).toBe("Label Modifié");
    expect(res.body.color).toBe("#00FF00");

    // On remet le label d'origine pour ne pas casser les autres tests si l'ordre change
    await prisma.category.update({
      where: { id: testContext.existingCategoryId },
      data: { label: testContext.existingCategoryLabel },
    });
  });

  it("doit retourner 404 si la catégorie à modifier n'existe pas", async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/categories/123e4567-e89b-12d3-a456-426614174000`)
      .set("Authorization", `Bearer ${testContext.accessToken}`)
      .send({
        label: "Ghost Category",
      })
      .expect(404);

    expect(res.body.message).toMatch(/not found/i);
  });

  it("doit retourner 400 si on envoie une couleur au mauvais format", async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/categories/${testContext.existingCategoryId}`)
      .set("Authorization", `Bearer ${testContext.accessToken}`)
      .send({
        color: "pas-une-couleur",
      })
      .expect(400);

    expect(res.body.errors.some((error: any) => error.path?.includes("color"))).toBe(true);
  });
});
