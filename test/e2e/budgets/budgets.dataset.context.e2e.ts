import { PrismaService } from "src/prisma/prisma.service";
import { createTestUser } from "test/utils/createTestUser";

export class BudgetsTestContext {
  public userId: string;
  public budgetId: string;
  public categoryId: string;

  public readonly userEmail = "test@example.com";
  public readonly password = "Password123!";

  constructor(private readonly prisma: PrismaService) {}

  async init(): Promise<void> {
    const user = await createTestUser(this.prisma, {
      email: this.userEmail,
      password: this.password,
      firstName: "Budget",
      lastName: "Tester",
      confirmedAt: new Date(),
    });
    this.userId = user.id;

    const budget = await this.prisma.budget.create({
      data: {
        label: "Budget E2E",
        color: "#3498db",
        userId: this.userId,
      },
    });
    this.budgetId = budget.id;

    const category = await this.prisma.category.create({
      data: {
        label: "Charges Fixes",
        color: "#ef4444",
        limitAmount: "800.00",
        type: "EXPENSE",
        userId: this.userId,
        budgetId: this.budgetId,
      },
    });
    this.categoryId = category.id;

    await this.prisma.transaction.createMany({
      data: [
        {
          label: "Loyer février",
          amount: -650,
          dueAt: new Date("2026-02-10T00:00:00.000Z"),
          userId: this.userId,
          categoryId: this.categoryId,
        },
        {
          label: "Loyer mars",
          amount: -650,
          dueAt: new Date("2026-03-10T00:00:00.000Z"),
          userId: this.userId,
          categoryId: this.categoryId,
        },
      ],
    });
  }

  async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
