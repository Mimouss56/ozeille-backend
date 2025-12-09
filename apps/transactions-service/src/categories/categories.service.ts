import { ConflictException, Injectable } from "@nestjs/common";
import { Category, Prisma } from "src/generated/prisma/client";

import { CreateCategoryRequest } from "./dto/create-category.dto";
import { UpdateCategoryRequest } from "./dto/update-category.dto";
import { CategoriesRepository } from "./repository/categories.repository";

@Injectable()
export class CategoriesService {
  constructor(private readonly repository: CategoriesRepository) {}

  async findAll(): Promise<Category[]> {
    return this.repository.getAll();
  }

  async create(createCategoryRequest: CreateCategoryRequest): Promise<Category> {
    try {
      return await this.repository.create(createCategoryRequest);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') { // contrainte unique violée
          throw new ConflictException(
            `A category with the label '${createCategoryRequest.label}' already exists in this budget.`
          );
        }
      }
      
      throw error; 
    }
  }

  findOne(id: string): Promise<Category | null> {
    return this.repository.getById(id);
  }

  async update(id: string, updateCategoryRequest: UpdateCategoryRequest): Promise<Category | null> {
    const category = await this.repository.getById(id);

    if (!category) {
      return null;
    }

    return this.repository.updateOne(id, updateCategoryRequest);
  }

  async remove(id: string): Promise<Category | null> {
    const category = await this.repository.getById(id);

    if (!category) {
      return null;
    }

    return this.repository.remove(id);
  }
}