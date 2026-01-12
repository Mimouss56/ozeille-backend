import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse } from "@nestjs/swagger";
import { ErrorResponse } from "src/common/dto/base-error.dto";
import { ValidationErrorResponse } from "src/common/dto/validation-error.dto";
import { Budget } from "src/generated/prisma/client";

import { BudgetResponse } from "../dto/budget.dto";
import { CreateBudgetRequest } from "../dto/create-budget.dto";
import { UpdateBudgetRequest } from "../dto/update-budget.dto";
import { BudgetsService } from "../services/budgets.service";

@Controller("api/budgets")
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
    return this.budgetsService.findOne(id);
  }

  @Put(":id")
  @ApiOkResponse({
    type: BudgetResponse,
    description: "The budget has been successfully updated",
  })
  @ApiNotFoundResponse({
    description: "The budget with the given ID was not found.",
    type: ErrorResponse,
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationErrorResponse,
  })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateBudgetRequest: UpdateBudgetRequest,
  ): Promise<Budget> {
    return this.budgetsService.update(id, updateBudgetRequest);
  }

  @Delete(":id")
  @ApiOkResponse({
    type: BudgetResponse,
    description: "The budget has been successfully deleted",
  })
  @ApiNotFoundResponse({
    description: "The budget with the given ID was not found.",
    type: ErrorResponse,
  })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<Budget> {
    return this.budgetsService.remove(id);
  }
}
