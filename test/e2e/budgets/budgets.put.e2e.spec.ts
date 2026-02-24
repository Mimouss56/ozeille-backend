import { type INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import request from "supertest";

import { BudgetsDataset } from "./budgets.dataset.e2e";
import { BudgetsTestContext } from "./budgets.test.context.e2e";

describe("Budgets E2E - PUT /api/budgets/:id", () => {
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

  it("doit mettre à jour un budget existant", async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/budgets/${testContext.existingBudgetId}`)
      .set("Authorization", `Bearer ${testContext.accessToken}`)
      .send({ label: "Budget Modifié", color: "#FFFFFF" })
      .expect(200);

    expect(res.body.label).toBe("Budget Modifié");

    // Restauration pour les autres tests
    await prisma.budget.update({
      where: { id: testContext.existingBudgetId },
      data: { label: BudgetsDataset.existingBudget.label },
    });
  });

  it("doit retourner 404 si le budget à modifier n'existe pas", async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/budgets/123e4567-e89b-12d3-a456-426614174000`)
      .set("Authorization", `Bearer ${testContext.accessToken}`)
      .send({ label: "Ghost Budget", color: "#FFF" })
      .expect(404);

    expect(res.body.message).toMatch(/not found/i);
  });
});
