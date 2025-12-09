import { Module } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";
import { CategoriesRepository } from "./repository/categories.repository";

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository, PrismaService],
})
export class CategoriesModule {}
