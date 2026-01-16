import { Module } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { TransactionsController } from "./controller/transactions.controller";
import { TransactionsRepository } from "./repository/transactions.repository";
import { TransactionsService } from "./services/transactions.service";

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsRepository, PrismaService],
})
export class TransactionsModule {}
