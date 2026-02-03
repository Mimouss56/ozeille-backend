import { Injectable, NotFoundException } from "@nestjs/common";
import { RequestContext } from "src/common/interfaces/request-context.interface";
import { Budget } from "src/generated/prisma/client";

import { BudgetFilters } from "../dto/buget-filter.dto";
import { CreateBudgetDto } from "../dto/create-budget.dto";
import { UpdateBudgetDto } from "../dto/update-budget.dto";
import { BudgetsRepository } from "../repository/budgets.repository";

@Injectable()
export class BudgetsService {
  constructor(private readonly repository: BudgetsRepository) {}

  async findAll(ctx: RequestContext<unknown>, params: BudgetFilters): Promise<Budget[]> {
    return this.repository.getAll(ctx.userId, params);
  }

  async create(ctx: RequestContext<CreateBudgetDto>): Promise<Budget> {
    return this.repository.create(ctx.userId, ctx.input);
  }

  async findOne(ctx: RequestContext<unknown>, id: string): Promise<Budget> {
    const budget = await this.repository.getById(ctx.userId, id);

    if (!budget || budget.userId !== ctx.userId) {
      throw new NotFoundException("The budget with the given ID was not found.");
    }
    return budget;
  }

  async update(ctx: RequestContext<UpdateBudgetDto>, id: string): Promise<Budget> {
    return this.repository.updateOne(ctx.userId, id, ctx.input);
  }

  async remove(ctx: RequestContext<unknown>, id: string): Promise<Budget> {
    return this.repository.remove(ctx.userId, id);
  }
}
