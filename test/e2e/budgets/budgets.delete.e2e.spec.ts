import { type INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import request from "supertest";

import { BudgetsTestContext } from "./budgets.test.context.e2e";

describe("Budgets E2E - DELETE /api/budgets/:id", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let testContext: BudgetsTestContext;

  let budgetToDeleteId: string;

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

  beforeEach(async () => {
    const budget = await prisma.budget.create({
      data: { label: "A supprimer", color: "#000", userId: testContext.userId },
    });
    budgetToDeleteId = budget.id;
  });

  it("doit supprimer un budget existant", async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/budgets/${budgetToDeleteId}`)
      .set("Authorization", `Bearer ${testContext.accessToken}`)
      .expect(200);

    expect(res.body.id).toBe(budgetToDeleteId);

    const check = await prisma.budget.findUnique({ where: { id: budgetToDeleteId } });
    expect(check).toBeNull();
  });

  it("doit retourner 404 si le budget à supprimer n'existe pas", async () => {
    await request(app.getHttpServer())
      .delete(`/api/budgets/123e4567-e89b-12d3-a456-426614174000`)
      .set("Authorization", `Bearer ${testContext.accessToken}`)
      .expect(404);
  });
});
