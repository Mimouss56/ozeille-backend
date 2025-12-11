import { Module } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { BudgetsController } from "./controller/budgets.controller";
import { BudgetsRepository } from "./repository/budgets.repository";
import { BudgetsService } from "./services/budgets.service";

@Module({
  controllers: [BudgetsController],
  providers: [BudgetsService, BudgetsRepository, PrismaService],
})
export class BudgetsModule {}
