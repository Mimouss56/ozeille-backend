import { Module } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { BudgetsController } from "./budgets.controller";
import { BudgetsService } from "./budgets.service";
import { BudgetsRepository } from "./repository/budgets.repository";

@Module({
  controllers: [BudgetsController],
  providers: [BudgetsService, BudgetsRepository, PrismaService],
})
export class BudgetsModule {}
