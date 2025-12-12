import { Module } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { CategoriesController } from "./controller/categories.controller";
import { CategoriesRepository } from "./repository/categories.repository";
import { CategoriesService } from "./services/categories.service";

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository, PrismaService],
})
export class CategoriesModule {}
