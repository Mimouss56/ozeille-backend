import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ErrorResponse } from "src/common/dto/base-error.dto";
import { ValidationErrorResponse } from "src/common/dto/validation-error.dto";
import { Category } from "src/generated/prisma/client";

import { CategoryResponse } from "../dto/category.dto";
import { CreateCategoryRequest } from "../dto/create-category.dto";
import { UpdateCategoryRequest } from "../dto/update-category.dto";
import { CategoriesService } from "../services/categories.service";

@ApiTags("Categories")
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOkResponse({
    type: CategoryResponse,
    isArray: true,
    description: "List of all categories",
  })
  async findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Post()
  @ApiCreatedResponse({
    description: "The category has been successfully created",
    type: CategoryResponse,
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationErrorResponse,
  })
  @ApiConflictResponse({
    description: "A category with this label already exists for this budget",
    type: ErrorResponse,
  })
  async create(@Body() createCategoryRequest: CreateCategoryRequest): Promise<Category> {
    return this.categoriesService.create(createCategoryRequest);
  }

  @Get(":id")
  @ApiOkResponse({
    type: CategoryResponse,
    description: "The category found",
  })
  @ApiNotFoundResponse({
    description: "The category with the given ID was not found.",
    type: ErrorResponse,
  })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Category> {
    return this.categoriesService.findOneById(id);
  }

  @Put(":id")
  @ApiOkResponse({
    type: CategoryResponse,
    description: "The category has been successfully updated",
  })
  @ApiNotFoundResponse({
    description: "The category with the given ID was not found.",
    type: ErrorResponse,
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationErrorResponse,
  })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateCategoryRequest: UpdateCategoryRequest,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryRequest);
  }

  @Delete(":id")
  @ApiOkResponse({
    type: CategoryResponse,
    description: "The category has been successfully deleted",
  })
  @ApiNotFoundResponse({
    description: "The category with the given ID was not found.",
    type: ErrorResponse,
  })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<Category> {
    return this.categoriesService.remove(id);
  }
}
