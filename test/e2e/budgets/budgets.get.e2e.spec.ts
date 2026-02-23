import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import request from "supertest";

import { BudgetsTestContext } from "./budgets.dataset.context.e2e";

describe("Budgets E2E - GET budgets", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let testContext: BudgetsTestContext;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    testContext = new BudgetsTestContext(prisma);
    await testContext.init();

    accessToken = await jwtService.signAsync({ sub: testContext.userId });
  }, 30000);

  afterAll(async () => {
    if (testContext) await testContext.cleanup();
    if (prisma) await prisma.$disconnect();
    await app.close();
  }, 10000);

  it("doit retourner 400 si from n'est pas une date ISO valide", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/budgets?from=invalid-date")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.some((error: { path?: string[] }) => error.path?.includes("from"))).toBe(true);
  });

  it("doit retourner 400 si to n'est pas une date ISO valide sur /summary", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/budgets/summary?to=31-12-2026")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.some((error: { path?: string[] }) => error.path?.includes("to"))).toBe(true);
  });

  it("doit retourner les catégories et filtrer les transactions par période quand expand=categories", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/budgets?expand=categories&from=2026-02-01&to=2026-02-28")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const budget = res.body.find((item: { id: string }) => item.id === testContext.budgetId);
    expect(budget).toBeDefined();
    expect(Array.isArray(budget.categories)).toBe(true);
    expect(budget.categories.length).toBeGreaterThan(0);

    const transactions = budget.categories.flatMap(
      (category: { transactions?: Array<{ dueAt: string }> }) => category.transactions || [],
    );
    expect(transactions.length).toBe(1);
    expect(transactions[0].dueAt.startsWith("2026-02")).toBe(true);
  });

  it("doit ignorer un expand inconnu et retourner la liste des budgets", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/budgets?expand=unknown")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((item: { id: string }) => item.id === testContext.budgetId)).toBe(true);
  });
});
