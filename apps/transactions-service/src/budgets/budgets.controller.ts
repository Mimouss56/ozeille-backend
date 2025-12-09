import { Body, Controller, Delete, Get, NotFoundException, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse } from "@nestjs/swagger";
import { ValidationErrorResponse } from "src/common/dto/validation-error.dto";
import { Budget } from "src/generated/prisma/client";

import { BudgetsService } from "./budgets.service";
import { BudgetResponse } from "./dto/budget.dto";
import { CreateBudgetRequest } from "./dto/create-budget.dto";
import { ErrorResponse } from "src/common/dto/base-error.dto";

@Controller("budgets")
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  @ApiOkResponse({
    type: BudgetResponse,
    isArray: true,
    description: "List of all budgets",
  })
  async findAll(): Promise<Budget[]> {
    return this.budgetsService.findAll();
  }

  @Post()
  @ApiCreatedResponse({
    description: "The budget has been successfully created",
    type: BudgetResponse,
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationErrorResponse,
  })
  async create(@Body() createBudgetRequest: CreateBudgetRequest): Promise<Budget> {
    return this.budgetsService.create(createBudgetRequest);
  }

  @Get(":id")
  @ApiOkResponse({
    type: BudgetResponse,
    description: "The budget found",
  })
  @ApiNotFoundResponse({
    description: "The budget with the given ID was not found.",
    type: ErrorResponse,
  })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Budget> {
    const budget = await this.budgetsService.findOne(id);

    if (!budget) {
      throw new NotFoundException("The budget with the given ID was not found.");
    }

    return budget;
  }

}
