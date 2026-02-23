import { Injectable, NotFoundException } from "@nestjs/common";
import { PaginatedDatabaseResponse } from "src/common/types";
import { Category, Prisma } from "src/generated/prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

import { CategoryExpand, CategoryFilters } from "../dto/category-filter.dto";
import { CreateCategoryRequest } from "../dto/create-category.dto";
import { UpdateCategoryRequest } from "../dto/update-category.dto";

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildInclude(expand?: string): Prisma.CategoryInclude | undefined {
    const expandMap: Record<string, Prisma.CategoryInclude> = {
      [CategoryExpand.BUDGET]: { budget: true },
      [CategoryExpand.TRANSACTIONS]: {
        transactions: { orderBy: { dueAt: "desc" } },
      },
    };

    const expands = expand ? expand.split(",") : [];

    return expands.length > 0
      ? expands.reduce<Prisma.CategoryInclude>((acc, currentExpand) => {
          if (expandMap[currentExpand]) {
            return { ...acc, ...expandMap[currentExpand] };
          }
          return acc;
        }, {})
      : undefined;
  }
  async getAll(userId: string, params: CategoryFilters): Promise<PaginatedDatabaseResponse<Category>> {
    const { page, limit, expand } = params;
    const skip = (page - 1) * limit;
    const take = limit;
    const include = this.buildInclude(expand);
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
    const include = this.buildInclude(expand);
    return this.prisma.category.findFirst({
      where: { id, userId },
      include,
    });
  }

  async updateOne(userId: string, id: string, data: UpdateCategoryRequest, expand?: string): Promise<Category> {
    const existingCategory = await this.getById(userId, id);

    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const include = this.buildInclude(expand);
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

  async findByLabelAndUserId(label: string, userId: string): Promise<Category | null> {
    return this.prisma.category.findFirst({
      where: { label, userId },
    });
  }
}
