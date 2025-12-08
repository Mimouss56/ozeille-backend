import { Injectable } from "@nestjs/common";
import { Transaction } from "src/generated/prisma/client";

import { CreateTransactionRequest } from "./dto/create-transaction.dto";
import { UpdateTransactionRequest } from "./dto/update-transaction.dto";
import { TransactionsRepository } from "./repository/transactions.repository";

@Injectable()
export class TransactionsService {
  constructor(private readonly repository: TransactionsRepository) {}

  create(createTransactionRequest: CreateTransactionRequest): Promise<Transaction> {
    return this.repository.create(createTransactionRequest);
  }

  findAll(): Promise<Transaction[]> {
    return this.repository.getAll();
  }

  findOne(id: string): Promise<Transaction | null> {
    return this.repository.getById(id);
  }

  async update(id: string, updateTransactionRequest: UpdateTransactionRequest): Promise<Transaction | null> {
    const transaction = await this.repository.getById(id);

    if (!transaction) {
      return null;
    }

    return this.repository.updateOne(id, updateTransactionRequest);
  }

  async remove(id: string): Promise<Transaction | null> {
    const transaction = await this.repository.getById(id);

    if (!transaction) {
      return null;
    }

    return this.repository.remove(id);
  }
}
