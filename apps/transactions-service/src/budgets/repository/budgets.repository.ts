import { Injectable } from "@nestjs/common";
import { Budget } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class BudgetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Budget[]> {
    return this.prisma.budget.findMany();
  }
}