import { Injectable } from "@nestjs/common";
import { Category } from "src/generated/prisma/client";

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
    return this.repository.create(createCategoryRequest);
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