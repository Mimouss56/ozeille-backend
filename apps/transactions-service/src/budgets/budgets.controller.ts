import { Controller, Get } from "@nestjs/common";
import { BudgetsService } from "./budgets.service";
import { Budget } from "./entities/budget.entity";

@Controller("budgets")
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get("/")
  async findAll(): Promise<Budget[]> {
    return this.budgetsService.findAll();
  }
}
