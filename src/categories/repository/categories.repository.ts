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

  async getAll(userId: string, { limit, page }: CategoryFilters): Promise<PaginatedDatabaseResponse<Category>> {
    const skip = (page - 1) * limit;
    const take = limit;
    const [categories, count] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where: { userId },
        skip,
        take,
        orderBy: {
          label: "asc",
        },
        include: { budget: true },
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
      },
    });
  }

  async getById(userId: string, id: string): Promise<Category | null> {
    return this.prisma.category.findFirst({
      where: { id, userId },
    });
  }

  async updateOne(userId: string, id: string, data: UpdateCategoryRequest): Promise<Category> {
    const existingCategory = await this.getById(userId, id);

    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.prisma.category.update({
      where: { id },
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
}
