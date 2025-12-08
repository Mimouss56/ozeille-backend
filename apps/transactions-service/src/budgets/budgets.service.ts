import { Injectable } from "@nestjs/common";
import { BudgetsRepository } from "./repository/budgets.repository";
import { Budget } from "./entities/budget.entity";
import { CreateBudgetDto } from "./dto/create-budget.dto";

@Injectable()
export class BudgetsService {
  constructor(private readonly repository: BudgetsRepository) {}

  async findAll(): Promise<Budget[]> {
    return this.repository.getAll();
  }

  async create(createBudgetDto: CreateBudgetDto): Promise<Budget> {
    return this.repository.create(createBudgetDto);
  }
}