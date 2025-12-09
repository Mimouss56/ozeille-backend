import { Injectable } from "@nestjs/common";
import { Budget } from "src/generated/prisma/client";

import { BudgetsRepository } from "./repository/budgets.repository";
import { CreateBudgetRequest } from "./dto/create-budget.dto";
import { UpdateBudgetRequest } from "./dto/update-budget.dto";

@Injectable()
export class BudgetsService {
  constructor(private readonly repository: BudgetsRepository) {}

  async findAll(): Promise<Budget[]> {
    return this.repository.getAll();
  }

  async create(createBudgetRequest: CreateBudgetRequest): Promise<Budget> {
    return this.repository.create(createBudgetRequest);
  }

  findOne(id: string): Promise<Budget | null> {
    return this.repository.getById(id);
  }

  async update(id: string, updateBudgetRequest: UpdateBudgetRequest): Promise<Budget | null> {
    const budget = await this.repository.getById(id);

    if (!budget) {
      return null;
    }

    return this.repository.updateOne(id, updateBudgetRequest);
  }

  async remove(id: string): Promise<Budget | null> {
    const budget = await this.repository.getById(id);

    if (!budget) {
      return null;
    }

    return this.repository.remove(id);
  }
}