import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ErrorResponse } from "src/common/dto/base-error.dto";
import { ValidationErrorResponse } from "src/common/dto/validation-error.dto";
import { Category } from "src/generated/prisma/client";

import { CategoriesService } from "./categories.service";
import { CategoryResponse } from "./dto/category.dto";
import { CreateCategoryRequest } from "./dto/create-category.dto";
import { UpdateCategoryRequest } from "./dto/update-category.dto";

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
    const category = await this.categoriesService.findOne(id);

    if (!category) {
      throw new NotFoundException("The category with the given ID was not found.");
    }

    return category;
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
    const category = await this.categoriesService.update(id, updateCategoryRequest);

    if (!category) {
      throw new NotFoundException("The category with the given ID was not found.");
    }

    return category;
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
    const category = await this.categoriesService.remove(id);

    if (!category) {
      throw new NotFoundException("The category with the given ID was not found.");
    }

    return category;
  }
}
