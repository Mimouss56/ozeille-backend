import { Injectable } from "@nestjs/common";

import { Transaction } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Transaction[]> {
    return this.prisma.transaction.findMany();
  }
}
