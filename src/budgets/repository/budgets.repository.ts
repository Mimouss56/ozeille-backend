import { Injectable, NotFoundException } from "@nestjs/common";
import { Budget } from "src/generated/prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

import { BudgetFilters } from "../dto/buget-filter.dto";
import { CreateBudgetRequest } from "../dto/create-budget.dto";
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
    return this.prisma.budget.findMany({
      where: { userId },
      include: {
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
      orderBy: { label: "asc" },
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

  getById(userId: string, id: string): Promise<Budget | null> {
    return this.prisma.budget.findUnique({
      where: { id, userId },
      include: { categories: true },
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
}
