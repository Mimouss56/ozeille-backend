import { Injectable } from "@nestjs/common";
import { Budget } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateBudgetDto } from "../dto/create-budget.dto";

@Injectable()
export class BudgetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Budget[]> {
    return this.prisma.budget.findMany();
  }

  async create(budget: CreateBudgetDto): Promise<Budget> {
    return this.prisma.budget.create({ data: budget });
  }
}