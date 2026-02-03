import { Injectable, NotFoundException } from "@nestjs/common";
import { RequestContext } from "src/common/interfaces/request-context.interface";
import { PaginatedDatabaseResponse } from "src/common/types";
import { Category } from "src/generated/prisma/client";

import { CategoryFilters } from "../dto/category-filter.dto";
import { CreateCategoryDto } from "../dto/create-category.dto";
import { UpdateCategoryDto } from "../dto/update-category.dto";
import { CategoriesRepository } from "../repository/categories.repository";

@Injectable()
export class CategoriesService {
  constructor(private readonly repository: CategoriesRepository) {}

  async findAll(ctx: RequestContext<unknown>, params: CategoryFilters): Promise<PaginatedDatabaseResponse<Category>> {
    return this.repository.getAll(ctx.userId, params);
  }

  async create(ctx: RequestContext<CreateCategoryDto>): Promise<Category> {
    return this.repository.create(ctx.userId, ctx.input);
  }

  async findOne(ctx: RequestContext<unknown>, id: string): Promise<Category> {
    const category = await this.repository.getById(ctx.userId, id);

    // Sécurité : Si elle n'existe pas ou n'appartient pas au user
    if (!category) {
      throw new NotFoundException("The category with the given ID was not found.");
    }

    return category;
  }

  async update(ctx: RequestContext<UpdateCategoryDto>, id: string): Promise<Category> {
    return this.repository.updateOne(ctx.userId, id, ctx.input);
  }

  async remove(ctx: RequestContext<unknown>, id: string): Promise<Category> {
    return this.repository.remove(ctx.userId, id);
  }
}
