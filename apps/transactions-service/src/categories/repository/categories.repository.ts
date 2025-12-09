import { Injectable } from "@nestjs/common";
import { Category } from "src/generated/prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

import { CreateCategoryRequest } from "../dto/create-category.dto";
import { UpdateCategoryRequest } from "../dto/update-category.dto";

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Category[]> {
    return this.prisma.category.findMany();
  }

  async create(data: CreateCategoryRequest): Promise<Category> {
    const { budgetId, ...rest } = data;

    return this.prisma.category.create({ 
        data: {
            ...rest,
            budget: {
                connect: { id: data.budgetId },
            }, 
        }, 
    });
  }

  getById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }

  updateOne(id: string, data: UpdateCategoryRequest): Promise<Category | null> {
    return this.prisma.category.update({ 
        where: { id }, 
        data: data
    });
  }

  remove(id: string): Promise<Category> {
    return this.prisma.category.delete({ where: { id } });
  }
}
