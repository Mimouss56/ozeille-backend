import { BudgetExpand } from "src/budgets/dto/buget-filter.dto";
import { BudgetsRepository } from "src/budgets/repository/budgets.repository";
import { PrismaService } from "src/prisma/prisma.service";

describe("BudgetsRepository (TI)", () => {
  let repository: BudgetsRepository;
  let mockPrisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    mockPrisma = {
      budget: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      category: {
        findMany: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    repository = new BudgetsRepository(mockPrisma);
  });

  describe("getAll", () => {
    it("doit appeler findMany sans include quand expand est absent", async () => {
      (mockPrisma.budget.findMany as jest.Mock).mockResolvedValue([]);

      await repository.getAll("user-1", {} as never);

      expect(mockPrisma.budget.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        include: undefined,
        orderBy: { label: "asc" },
      });
    });

    it("doit inclure categories.transactions filtrées par dates quand expand=categories", async () => {
      (mockPrisma.budget.findMany as jest.Mock).mockResolvedValue([]);

      await repository.getAll("user-1", {
        from: "2026-01-01",
        to: "2026-01-31",
        expand: BudgetExpand.CATEGORIES,
      });

      expect(mockPrisma.budget.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        include: {
          categories: {
            include: {
              transactions: {
                where: {
                  dueAt: {
                    gte: new Date("2026-01-01"),
                    lte: new Date("2026-01-31"),
                  },
                },
              },
            },
          },
        },
        orderBy: { label: "asc" },
      });
    });
  });

  describe("getById", () => {
    it("doit inclure categories.transactions si expand=categories", async () => {
      (mockPrisma.budget.findUnique as jest.Mock).mockResolvedValue(null);

      await repository.getById("user-1", "budget-1", BudgetExpand.CATEGORIES);

      expect(mockPrisma.budget.findUnique).toHaveBeenCalledWith({
        where: { id: "budget-1", userId: "user-1" },
        include: {
          categories: {
            include: { transactions: true },
          },
        },
      });
    });
  });

  describe("getSummaryBudget", () => {
    it("doit agréger les revenus/dépenses du mois cible et retourner les résumés mensuels triés", async () => {
      (mockPrisma.category.findMany as jest.Mock)
        .mockResolvedValueOnce([
          {
            id: "income-1",
            label: "Salaire",
            color: "#1f9d55",
            transactions: [
              {
                id: "tx-inc-jan",
                amount: 1000,
                dueAt: new Date("2026-01-10T00:00:00.000Z"),
              },
              {
                id: "tx-inc-feb",
                amount: 2000,
                dueAt: new Date("2026-02-10T00:00:00.000Z"),
              },
            ],
          },
        ])
        .mockResolvedValueOnce([
          {
            id: "expense-1",
            label: "Loyer",
            color: "#ef4444",
            budget: { label: "Budget Maison" },
            transactions: [
              {
                id: "tx-exp-feb",
                amount: -700,
                dueAt: new Date("2026-02-05T00:00:00.000Z"),
              },
              {
                id: "tx-exp-jan",
                amount: -300,
                dueAt: new Date("2026-01-03T00:00:00.000Z"),
              },
            ],
          },
        ]);

      const result = await repository.getSummaryBudget("user-1", { to: "2026-02-15" });

      expect(mockPrisma.category.findMany).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          where: expect.objectContaining({
            type: "INCOME",
            budget: { userId: "user-1" },
          }),
        }),
      );

      expect(mockPrisma.category.findMany).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          where: expect.objectContaining({
            type: { not: "INCOME" },
            budget: { userId: "user-1" },
          }),
        }),
      );

      expect(result).toEqual({
        incomes: [
          {
            id: "income-1",
            label: "Salaire",
            color: "#1f9d55",
            amount: 2000,
          },
        ],
        upCommingBills: [
          {
            id: "expense-1",
            label: "Loyer",
            color: "#ef4444",
            amount: 700,
            budgetName: "Budget Maison",
          },
        ],
        balance: {
          totalIncome: 2000,
          totalExpenses: 700,
        },
        monthlySummaries: [
          {
            month: "2026-01",
            totalIncome: 1000,
            totalExpenses: 300,
          },
          {
            month: "2026-02",
            totalIncome: 2000,
            totalExpenses: 700,
          },
        ],
      });
    });
  });
});
