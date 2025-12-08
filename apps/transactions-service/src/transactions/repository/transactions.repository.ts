import { Injectable } from "@nestjs/common";

import { Transaction } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateTransactionDto } from "../dto/create-transaction.dto";

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Transaction[]> {
    return this.prisma.transaction.findMany();
  }

  async create(transaction: CreateTransactionDto): Promise<Transaction> {
    return this.prisma.transaction.create({ data: transaction });
  }
}
