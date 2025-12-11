import { Injectable } from "@nestjs/common";
import { Budget } from "src/generated/prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

import { CreateBudgetRequest } from "../dto/create-budget.dto";
import { UpdateBudgetRequest } from "../dto/update-budget.dto";

@Injectable()
export class BudgetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Budget[]> {
    return this.prisma.budget.findMany({
      include: { categories: true },
      orderBy: { label: 'asc' } // Trier par label par ordre alphabétique
    });
  }

  async create(budget: CreateBudgetRequest): Promise<Budget> {
    return this.prisma.budget.create({ data: budget });
  }

  getById(id: string): Promise<Budget | null> {
    return this.prisma.budget.findUnique({ 
      where: { id },
      include: { categories: true } 
    });
  }

  updateOne(id: string, budget: UpdateBudgetRequest): Promise<Budget> {
    return this.prisma.budget.update({ where: { id }, data: budget });
  }

  remove(id: string): Promise<Budget> {
    return this.prisma.budget.delete({ where: { id } });
  }
}
