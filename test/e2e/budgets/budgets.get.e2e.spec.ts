import { type INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import request from "supertest";

import { BudgetsTestContext } from "./budgets.test.context.e2e";

describe("Budgets E2E - GET /api/budgets", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let testContext: BudgetsTestContext;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    testContext = new BudgetsTestContext(prisma, jwtService);
    await testContext.init();
  }, 30000);

  afterAll(async () => {
    if (testContext) await testContext.cleanup();
    if (prisma) await prisma.$disconnect();
    await app.close();
  }, 10000);

  it("doit retourner la liste des budgets", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/budgets")
      .set("Authorization", `Bearer ${testContext.accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((b) => b.id === testContext.existingBudgetId)).toBe(true);
  });

  it("doit retourner un budget spécifique par son id", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/budgets/${testContext.existingBudgetId}`)
      .set("Authorization", `Bearer ${testContext.accessToken}`)
      .expect(200);

    expect(res.body.id).toBe(testContext.existingBudgetId);
  });

  it("doit retourner le summary des budgets", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/budgets/summary?to=2026-03-31")
      .set("Authorization", `Bearer ${testContext.accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty("balance");
    expect(res.body).toHaveProperty("monthlySummaries");
  });

  it("doit inclure les catégories quand expand=categories est demandé", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/budgets?expand=categories&from=2026-02-01&to=2026-02-28")
      .set("Authorization", `Bearer ${testContext.accessToken}`)
      .expect(200);

    const budget = res.body.find((item) => item.id === testContext.existingBudgetId);
    expect(budget.categories).toBeDefined();
    expect(budget.categories.length).toBeGreaterThan(0);
  });
});
