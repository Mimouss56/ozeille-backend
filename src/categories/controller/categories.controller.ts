import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Ctx } from "src/common/decorators/ctx.decorator";
import { ErrorResponse } from "src/common/dto/base-error.dto";
import { ValidationErrorResponse } from "src/common/dto/validation-error.dto";
import { RequestContext } from "src/common/interfaces/request-context.interface";
import { PaginatedDatabaseResponse } from "src/common/types";
import { Category } from "src/generated/prisma/client";

import { CategoryFilters } from "../dto/category-filter.dto";
import { CategoryResponse } from "../dto/category.dto";
import { CreateCategoryDto, CreateCategoryRequest } from "../dto/create-category.dto";
import { UpdateCategoryDto, UpdateCategoryRequest } from "../dto/update-category.dto";
import { CategoriesService } from "../services/categories.service";

@ApiTags("Categories")
@Controller("api/categories")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOkResponse({
    type: CategoryResponse,
    isArray: true,
    description: "List of all categories",
  })
  async findAll(
    @Ctx() ctx: RequestContext<unknown>,
    @Query() params: CategoryFilters,
  ): Promise<PaginatedDatabaseResponse<Category>> {
    return this.categoriesService.findAll(ctx, params);
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
  async create(
    @Body() _createCategoryRequest: CreateCategoryRequest,
    @Ctx() ctx: RequestContext<CreateCategoryDto>,
  ): Promise<Category> {
    return this.categoriesService.create(ctx);
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
  async findOne(@Param("id", ParseUUIDPipe) id: string, @Ctx() ctx: RequestContext<unknown>): Promise<Category> {
    return this.categoriesService.findOne(ctx, id);
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
    @Body() _updateCategoryRequest: UpdateCategoryRequest,
    @Ctx() ctx: RequestContext<UpdateCategoryDto>,
  ): Promise<Category> {
    return this.categoriesService.update(ctx, id);
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
  async remove(@Param("id", ParseUUIDPipe) id: string, @Ctx() ctx: RequestContext<unknown>): Promise<Category> {
    return this.categoriesService.remove(ctx, id);
  }
}
