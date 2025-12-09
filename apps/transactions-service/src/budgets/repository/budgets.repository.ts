import { Injectable } from "@nestjs/common";
import { Budget } from "src/generated/prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateBudgetRequest } from "../dto/create-budget.dto";

@Injectable()
export class BudgetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Budget[]> {
    return this.prisma.budget.findMany();
  }

  async create(budget: CreateBudgetRequest): Promise<Budget> {
    return this.prisma.budget.create({ data: budget });
  }
}