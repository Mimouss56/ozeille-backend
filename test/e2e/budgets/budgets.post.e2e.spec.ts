import { type INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import request from "supertest";

import { BudgetsDataset } from "./budgets.dataset.e2e";
import { BudgetsTestContext } from "./budgets.test.context.e2e";

describe("Budgets E2E - POST /api/budgets", () => {
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

  beforeEach(async () => {
    await prisma.budget.deleteMany({
      where: { label: BudgetsDataset.newBudget.label, userId: testContext.userId },
    });
  });

  it("doit créer un nouveau budget avec succès", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/budgets")
      .set("Authorization", `Bearer ${testContext.accessToken}`)
      .send(BudgetsDataset.newBudget)
      .expect(201);

    expect(res.body.label).toBe(BudgetsDataset.newBudget.label);
    expect(res.body.userId).toBe(testContext.userId);
  });

  it("doit retourner 400 si le label est manquant", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/budgets")
      .set("Authorization", `Bearer ${testContext.accessToken}`)
      .send({ color: "#FFF" })
      .expect(400);

    expect(res.body.errors.some((error) => error.path?.includes("label"))).toBe(true);
  });
});
