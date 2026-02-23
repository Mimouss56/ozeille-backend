import { Injectable, NotFoundException } from "@nestjs/common";
import { PaginatedDatabaseResponse } from "src/common/types";
import { Category } from "src/generated/prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

import { CategoryFilters } from "../dto/category-filter.dto";
import { CreateCategoryRequest } from "../dto/create-category.dto";
import { UpdateCategoryRequest } from "../dto/update-category.dto";

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(userId: string, params: CategoryFilters): Promise<PaginatedDatabaseResponse<Category>> {
    const { limit, page, expand, } = params;
    const skip = (page - 1) * limit;
    const take = limit;

    // Gestion du paramètre expand (transactions, budget, etc.)
    const expandMap: Record<string, any> = {
      transactions: { transactions: true },
      budget: { budget: true },
    };
    const expands = expand ? expand.split(",") : [];
    const include =
      expands.length > 0
        ? expands.reduce((acc, currentExpand) => {
            if (expandMap[currentExpand]) {
              return { ...acc, ...expandMap[currentExpand] };
            }
            return acc;
          }, {})
        : undefined;

    const [categories, count] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where: { userId },
        skip,
        take,
        orderBy: {
          label: "asc",
        },
        include,
      }),
      this.prisma.category.count({
        where: { userId },
      }),
    ]);

    return {
      data: categories,
      meta: {
        total: count,
        page: page,
        limit: limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async create(userId: string, category: CreateCategoryRequest): Promise<Category> {
    return this.prisma.category.create({
      data: {
        ...category,
        userId,
        limitAmount: category.limitAmount === null ? 0 : category.limitAmount,
      },
    });
  }

  async getById(userId: string, id: string, expand?: string): Promise<Category | null> {
    const expandMap: Record<string, any> = {
      transactions: { transactions: true },
      budget: { budget: true },
    };
    const expands = expand ? expand.split(",") : [];
    const include =
      expands.length > 0
        ? expands.reduce((acc, currentExpand) => {
            if (expandMap[currentExpand]) {
              return { ...acc, ...expandMap[currentExpand] };
            }
            return acc;
          }, {})
        : undefined;
    return this.prisma.category.findFirst({
      where: { id, userId },
      include,
    });
  }

  async updateOne(userId: string, id: string, data: UpdateCategoryRequest, expand?: string): Promise<Category> {
    const existingCategory = await this.getById(userId, id, expand);
    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    const expandMap: Record<string, any> = {
      transactions: { transactions: true },
      budget: { budget: true },
    };
    const expands = expand ? expand.split(",") : [];
    const include =
      expands.length > 0
        ? expands.reduce((acc, currentExpand) => {
            if (expandMap[currentExpand]) {
              return { ...acc, ...expandMap[currentExpand] };
            }
            return acc;
          }, {})
        : undefined;
    return this.prisma.category.update({
      where: { id },
      include,
      data,
    });
  }

  async remove(userId: string, id: string): Promise<Category> {
    const existingCategory = await this.getById(userId, id);

    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }

  async findByLabelAndUserIdAndBudgetId(label: string, userId: string, budgetId: string): Promise<Category | null> {
    return this.prisma.category.findFirst({
      where: { label, userId, budgetId },
    });
  }
}
