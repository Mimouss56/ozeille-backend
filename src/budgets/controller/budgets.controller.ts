import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Ctx } from "src/common/decorators/ctx.decorator";
import { ErrorResponse } from "src/common/dto/base-error.dto";
import { ValidationErrorResponse } from "src/common/dto/validation-error.dto";
import { RequestContext } from "src/common/interfaces/request-context.interface";
import { Budget } from "src/generated/prisma/client";

import { BudgetResponse } from "../dto/budget.dto";
import { BudgetFilters } from "../dto/buget-filter.dto";
import { CreateBudgetDto, CreateBudgetRequest } from "../dto/create-budget.dto";
import { UpdateBudgetDto, UpdateBudgetRequest } from "../dto/update-budget.dto";
import { BudgetsService } from "../services/budgets.service";

@ApiTags("Budgets")
@Controller("api/budgets")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  @ApiOkResponse({
    type: BudgetResponse,
    isArray: true,
    description: "List of all budgets",
  })
  async findAll(@Query() params: BudgetFilters, @Ctx() ctx: RequestContext<unknown>): Promise<Budget[]> {
    return this.budgetsService.findAll(ctx, params);
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
  async create(
    @Body() createBudgetRequest: CreateBudgetRequest, // On le garde pour la validation Zod automatique
    @Ctx() ctx: RequestContext<CreateBudgetDto>,
  ): Promise<Budget> {
    // Correction : On passe uniquement le contexte, car ctx.input contient déjà les données
    return this.budgetsService.create(ctx);
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
  async findOne(@Param("id", ParseUUIDPipe) id: string, @Ctx() ctx: RequestContext<unknown>): Promise<Budget> {
    return this.budgetsService.findOne(ctx, id);
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
    @Ctx() ctx: RequestContext<UpdateBudgetDto>,
  ): Promise<Budget> {
    // Correction : On passe ctx et id. ctx.input contient l'updateRequest.
    return this.budgetsService.update(ctx, id);
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
  async remove(@Param("id", ParseUUIDPipe) id: string, @Ctx() ctx: RequestContext<unknown>): Promise<Budget> {
    return this.budgetsService.remove(ctx, id);
  }
}
