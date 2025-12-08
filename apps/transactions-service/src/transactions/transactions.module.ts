import { Module } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { TransactionsRepository } from "./repository/transactions.repository";
import { TransactionsController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsRepository, PrismaService],
})
export class TransactionsModule {}
