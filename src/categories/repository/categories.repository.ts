import { Injectable, NotFoundException } from "@nestjs/common";
import { Category } from "src/generated/prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

import { CreateCategoryRequest } from "../dto/create-category.dto";
import { UpdateCategoryRequest } from "../dto/update-category.dto";

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(userId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { userId }, // 🔒 Filtre par utilisateur
      orderBy: { label: "asc" },
    });
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
