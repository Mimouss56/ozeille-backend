import { Injectable } from "@nestjs/common";
import { Budget } from "src/generated/prisma/client";

import { BudgetsRepository } from "./repository/budgets.repository";
import { CreateBudgetRequest } from "./dto/create-budget.dto";

@Injectable()
export class BudgetsService {
  constructor(private readonly repository: BudgetsRepository) {}

  async findAll(): Promise<Budget[]> {
    return this.repository.getAll();
  }

  async create(createBudgetRequest: CreateBudgetRequest): Promise<Budget> {
    return this.repository.create(createBudgetRequest);
  }
}