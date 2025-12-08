import { Injectable } from "@nestjs/common";

import { Transaction } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateTransactionRequest } from "../dto/create-transaction.dto";
import { UpdateTransactionRequest } from "../dto/update-transaction.dto";

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Transaction[]> {
    return this.prisma.transaction.findMany();
  }

  getById(id: string): Promise<Transaction | null> {
    return this.prisma.transaction.findUnique({ where: { id } });
  }

  async create(transaction: CreateTransactionRequest): Promise<Transaction> {
    return this.prisma.transaction.create({ data: transaction });
  }

  updateOne(id: string, transaction: UpdateTransactionRequest): Promise<Transaction | null> {
    return this.prisma.transaction.update({ where: { id }, data: transaction });
  }

  remove(id: string): Promise<Transaction | null> {
    return this.prisma.transaction.delete({ where: { id } });
  }
}
