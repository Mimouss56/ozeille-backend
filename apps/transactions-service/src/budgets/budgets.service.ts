import { Injectable } from "@nestjs/common";
import { BudgetsRepository } from "./repository/budgets.repository";
import { Budget } from "./entities/budget.entity";

@Injectable()
export class BudgetsService {
  constructor(private readonly repository: BudgetsRepository) {}

  async findAll(): Promise<Budget[]> {
    return this.repository.getAll();
  }
}
