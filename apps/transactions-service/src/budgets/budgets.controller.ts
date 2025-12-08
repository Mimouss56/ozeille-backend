import { Body, Controller, Get, Post, UsePipes } from "@nestjs/common";
import { BudgetsService } from "./budgets.service";
import { Budget } from "./entities/budget.entity";
import { CreateBudgetDto, createBudgetSchema } from "./dto/create-budget.dto";
import { ZodValidationPipe } from "nestjs-zod";

@Controller("budgets")
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get("/")
  async findAll(): Promise<Budget[]> {
    return this.budgetsService.findAll();
  }

  @Post()
  @UsePipes(ZodValidationPipe)
  async create(@Body() createBudgetDto: CreateBudgetDto): Promise<Budget> {
    return this.budgetsService.create(createBudgetDto);
  }
}
