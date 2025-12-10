import { Injectable, NotFoundException } from "@nestjs/common";
import { Category } from "src/generated/prisma/client";

import { CreateCategoryRequest } from "../dto/create-category.dto";
import { UpdateCategoryRequest } from "../dto/update-category.dto";
import { CategoriesRepository } from "../repository/categories.repository";

@Injectable()
export class CategoriesService {
  constructor(private readonly repository: CategoriesRepository) {}

  async findAll(): Promise<Category[]> {
    return this.repository.getAll();
  }

  async create(createCategoryRequest: CreateCategoryRequest): Promise<Category> {
    return await this.repository.create(createCategoryRequest);
  }

  async findOneById(id: string): Promise<Category> {
    const category = await this.repository.getById(id);

    if (!category) {
      throw new NotFoundException("The category with the given ID was not found.");
    }

    return category;
  }

  async update(id: string, updateCategoryRequest: UpdateCategoryRequest): Promise<Category> {
    await this.findOneById(id);

    return this.repository.updateOne(id, updateCategoryRequest);
  }

  async remove(id: string): Promise<Category> {
    await this.findOneById(id);

    return this.repository.remove(id);
  }
}
