import { Injectable, NotFoundException } from "@nestjs/common";
import { Budget } from "src/generated/prisma/client";

import { CreateBudgetRequest } from "../dto/create-budget.dto";
import { UpdateBudgetRequest } from "../dto/update-budget.dto";
import { BudgetsRepository } from "../repository/budgets.repository";

@Injectable()
export class BudgetsService {
  constructor(private readonly repository: BudgetsRepository) {}

  async findAll(): Promise<Budget[]> {
    return this.repository.getAll();
  }

  async create(createBudgetRequest: CreateBudgetRequest): Promise<Budget> {
    return this.repository.create(createBudgetRequest);
  }

  async findOne(id: string): Promise<Budget> {
    const budget = await this.repository.getById(id);

    if (!budget) {
      throw new NotFoundException("The budget with the given ID was not found.");
    }

    return budget;
  }

  async update(id: string, updateBudgetRequest: UpdateBudgetRequest): Promise<Budget> {
    await this.findOne(id);

    return this.repository.updateOne(id, updateBudgetRequest);
  }

  async remove(id: string): Promise<Budget> {
    await this.findOne(id);

    return this.repository.remove(id);
  }
}
