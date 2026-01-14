import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import request from "supertest";

describe("Categories E2E - Création sans budgetId", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    const { PrismaService } = await import("src/prisma/prisma.service");
    await app.get(PrismaService).$disconnect();
  });

  it("doit retourner 406 si budgetId est manquant", async () => {
    const res = await request(app.getHttpServer()).post("/api/categories").send({
      name: "Test Catégorie",
      // budgetId manquant volontairement
    });
    expect(res.status).toBe(400);
  });
});
