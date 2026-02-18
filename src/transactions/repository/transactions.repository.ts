import { Injectable } from "@nestjs/common";
import { PaginatedDatabaseResponse } from "src/common/types";
import { Transaction } from "src/generated/prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

import { CreateTransactionRequest } from "../dto/create-transaction.dto";
import { TransactionFilters } from "../dto/transaction-filter.dto";
import { UpdateTransactionRequest } from "../dto/update-transaction.dto";

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(params: TransactionFilters, userId: string): Promise<PaginatedDatabaseResponse<Transaction>> {
    const { page, limit } = params;
    const { "order[dueAt]": orderDueAt, categoryId, from, to } = params;
    const skip = (page - 1) * limit;
    const take = limit;
    // const isPointedAt = pointedAt ? { not: null } : null;
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    const where = {
      userId,
      categoryId: categoryId || undefined,
      dueAt: {
        ...(fromDate && { gte: fromDate }),
        ...(toDate && { lte: toDate }),
      },
    };

    const [transactions, count] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        skip,
        take,
        where,
        orderBy: {
          dueAt: orderDueAt,
        },
        include: { category: true },
      }),
      this.prisma.transaction.count({
        where,
        orderBy: {
          dueAt: orderDueAt,
        },
        // where: { pointedAt: isPointedAt },
      }),
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
    return this.prisma.transaction.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async create(payload: CreateTransactionRequest, userId: string): Promise<Transaction> {
    const { categoryId, frequencyId, ...rest } = payload;

    return this.prisma.transaction.create({
      data: {
        ...rest,
        user: { connect: { id: userId } },
        ...(categoryId && { category: { connect: { id: categoryId } } }),
        ...(frequencyId && { frequency: { connect: { id: frequencyId } } }),
      },
      include: { category: true, frequency: true },
    });
  }

  updateOne(id: string, transaction: UpdateTransactionRequest): Promise<Transaction> {
    // eslint-disable-next-line unused-imports/no-unused-vars
    const { categoryId, frequencyId, ...rest } = transaction;

    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...rest,
        ...(categoryId !== undefined && {
          category: categoryId ? { connect: { id: categoryId } } : { disconnect: true },
        }),
      },
      include: { category: true },
    });
  }

  remove(id: string): Promise<Transaction> {
    return this.prisma.transaction.delete({ where: { id } });
  }
}
