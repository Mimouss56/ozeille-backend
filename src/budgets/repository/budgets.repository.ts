import { Injectable, NotFoundException } from "@nestjs/common";
import dayjs from "dayjs";
import { SummaryCategoryResponseDto } from "src/categories/dto/get-summary-categories-response.dto";
import { Budget, Prisma } from "src/generated/prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

import { BudgetExpand, BudgetFilters, SummaryBudgetFilters } from "../dto/buget-filter.dto";
import { CreateBudgetRequest } from "../dto/create-budget.dto";
import { GetSummaryBudgetResponseDto } from "../dto/responses/get-summary-budget.response.dto";
import { SummaryUpComingBillsResponseDto } from "../dto/responses/up-coming-budget.response.dto";
import { UpdateBudgetRequest } from "../dto/update-budget.dto";

@Injectable()
export class BudgetsRepository {
  constructor(private readonly prisma: PrismaService) {}
  private connectUser(userId: string) {
    return { connect: { id: userId } };
  }
  async getAll(userId: string, params: BudgetFilters): Promise<Budget[]> {
    const fromDate = params.from ? new Date(params.from) : undefined;
    const toDate = params.to ? new Date(params.to) : undefined;

    const expandMap: Record<string, Prisma.BudgetInclude> = {
      [BudgetExpand.CATEGORIES]: {
        categories: {
          include: {
            transactions: {
              where: {
                dueAt: { gte: fromDate, lte: toDate },
              },
            },
          },
        },
      },
    };

    const expands = params.expand ? params.expand.split(",") : [];

    const include =
      expands.length > 0
        ? expands.reduce<Prisma.BudgetInclude>((acc, currentExpand) => {
            if (expandMap[currentExpand]) {
              return { ...acc, ...expandMap[currentExpand] };
            }
            return acc;
          }, {})
        : undefined;

    return this.prisma.budget.findMany({
      where: { userId },
      include,
      orderBy: { label: "asc" },
    });
  }

  async getById(userId: string, id: string, expand?: string): Promise<Budget | null> {
    const expandMap: Record<string, Prisma.BudgetInclude> = {
      [BudgetExpand.CATEGORIES]: {
        categories: {
          include: { transactions: true },
        },
      },
    };

    const expands = expand ? expand.split(",") : [];

    const include =
      expands.length > 0
        ? expands.reduce<Prisma.BudgetInclude>((acc, currentExpand) => {
            if (expandMap[currentExpand]) {
              return { ...acc, ...expandMap[currentExpand] };
            }
            return acc;
          }, {})
        : undefined;

    return this.prisma.budget.findUnique({
      where: { id, userId },
      include,
    });
  }

  async create(userId: string, budget: CreateBudgetRequest): Promise<Budget> {
    return this.prisma.budget.create({
      data: {
        ...budget,
        user: { connect: { id: userId } },
      },
    });
  }

  async updateOne(userId: string, id: string, budget: UpdateBudgetRequest): Promise<Budget> {
    const existingBudget = await this.getById(userId, id);
    if (!existingBudget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }
    return this.prisma.budget.update({ where: { id }, data: budget });
  }

  async remove(userId: string, id: string): Promise<Budget> {
    const existingBudget = await this.getById(userId, id);

    if (!existingBudget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }
    return this.prisma.budget.delete({ where: { id } });
  }

  async getSummaryBudget(userId: string, params: SummaryBudgetFilters): Promise<GetSummaryBudgetResponseDto> {
    const toDate = params.to ? dayjs(params.to) : dayjs();
    const fromDate = toDate.subtract(12, "months");
    const fromDateObj = fromDate.toDate();
    const toDateObj = toDate.toDate();

    // Mois cible pour la balance (format YYYY-MM)
    const targetMonth = toDate.format("YYYY-MM");

    // Optimisation : Charger séparément les catégories INCOME et EXPENSE avec leurs transactions
    const [incomeCategories, expenseCategories] = await Promise.all([
      // Catégories de revenus
      this.prisma.category.findMany({
        where: {
          budget: { userId },
          type: "INCOME",
          transactions: {
            some: {
              dueAt: { gte: fromDateObj, lte: toDateObj },
            },
          },
        },
        select: {
          id: true,
          label: true,
          color: true,
          transactions: {
            where: {
              dueAt: { gte: fromDateObj, lte: toDateObj },
            },
            select: {
              id: true,
              amount: true,
              dueAt: true,
            },
          },
        },
      }),
      // Catégories de dépenses avec budget
      this.prisma.category.findMany({
        where: {
          budget: { userId },
          type: { not: "INCOME" },
          transactions: {
            some: {
              dueAt: { gte: fromDateObj, lte: toDateObj },
              userId,
            },
          },
        },
        select: {
          id: true,
          label: true,
          color: true,
          budget: {
            select: { label: true },
          },
          transactions: {
            where: {
              dueAt: { gte: fromDateObj, lte: toDateObj },
              userId,
            },
            select: {
              id: true,
              amount: true,
              dueAt: true,
            },
          },
        },
      }),
    ]);

    // Agrégation des données
    const incomes: SummaryCategoryResponseDto[] = [];
    const upCommingBills: SummaryUpComingBillsResponseDto[] = [];
    let totalIncome = 0;
    let totalExpenses = 0;
    const monthlySummaries = new Map<string, { totalIncome: number; totalExpenses: number }>();

    // Traitement des revenus - Agrégé par catégorie
    incomeCategories.forEach((category) => {
      let categoryTotalForMonth = 0;

      category.transactions.forEach((t) => {
        const month = t.dueAt.toISOString().substring(0, 7);
        const amount = Math.abs(t.amount || 0);

        // Mise à jour des monthlySummaries
        if (!monthlySummaries.has(month)) {
          monthlySummaries.set(month, { totalIncome: 0, totalExpenses: 0 });
        }
        monthlySummaries.get(month)!.totalIncome += amount;

        // Calcul pour le mois cible (balance)
        if (month === targetMonth) {
          categoryTotalForMonth += amount;
        }
      });

      if (categoryTotalForMonth > 0) {
        totalIncome += categoryTotalForMonth;
        incomes.push({
          id: category.id,
          label: category.label,
          color: category.color,
          amount: categoryTotalForMonth,
        });
      }
    });

    // Traitement des dépenses - Agrégé par catégorie
    expenseCategories.forEach((category) => {
      let categoryTotalForMonth = 0;

      category.transactions.forEach((t) => {
        const month = t.dueAt.toISOString().substring(0, 7);
        const amount = Math.abs(t.amount || 0);

        // Mise à jour des monthlySummaries
        if (!monthlySummaries.has(month)) {
          monthlySummaries.set(month, { totalIncome: 0, totalExpenses: 0 });
        }
        monthlySummaries.get(month)!.totalExpenses += amount;

        // Calcul pour le mois cible (balance)
        if (month === targetMonth) {
          categoryTotalForMonth += amount;
        }
      });

      if (categoryTotalForMonth > 0) {
        totalExpenses += categoryTotalForMonth;
        upCommingBills.push({
          id: category.id,
          label: category.label,
          color: category.color,
          amount: categoryTotalForMonth,
          budgetName: category.budget?.label || null,
        });
      }
    });

    return {
      incomes,
      upCommingBills,
      balance: {
        totalIncome,
        totalExpenses,
      },
      monthlySummaries: Array.from(monthlySummaries.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({
          month,
          ...data,
        })),
    };
  }
}
