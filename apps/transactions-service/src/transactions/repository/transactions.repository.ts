import { Injectable } from "@nestjs/common";
import { PaginationFilters } from "src/common/dto/pagination.dto";
import { Transaction } from "src/generated/prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

import { PaginatedDatabaseResponse } from "../../common/types";
import { CreateTransactionRequest } from "../dto/create-transaction.dto";
import { UpdateTransactionRequest } from "../dto/update-transaction.dto";

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll({ limit, page }: PaginationFilters): Promise<PaginatedDatabaseResponse<Transaction>> {
    const skip = (page - 1) * limit;
    const take = limit;

    const [transactions, count] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({ skip, take }),
      this.prisma.transaction.count(),
    ]);

    return {
      data: transactions,
      meta: {
        total: count,
        page: page,
        limit: limit,
        totalPages: Math.ceil(count / limit),
      },
    };
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
