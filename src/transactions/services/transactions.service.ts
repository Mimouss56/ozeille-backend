import { Injectable, NotFoundException } from "@nestjs/common";
import { RequestContext } from "src/common/interfaces/request-context.interface";
import { Transaction } from "src/generated/prisma/client";

import { PaginatedDatabaseResponse } from "../../common/types";
import { CreateTransactionRequest } from "../dto/create-transaction.dto";
import { TransactionFilters } from "../dto/transaction-filter.dto";
import { UpdateTransactionRequest } from "../dto/update-transaction.dto";
import { TransactionsRepository } from "../repository/transactions.repository";

@Injectable()
export class TransactionsService {
  constructor(private readonly repository: TransactionsRepository) {}

  create(createTransactionRequest: CreateTransactionRequest, ctx: RequestContext<unknown>): Promise<Transaction> {
    return this.repository.create(createTransactionRequest, ctx.userId);
  }

  findAll(params: TransactionFilters, ctx: RequestContext<unknown>): Promise<PaginatedDatabaseResponse<Transaction>> {
    return this.repository.getAll(params, ctx.userId);
  }

  /**
   * Find a transaction by its ID. If the transaction is not found, a 404 error is thrown.
   * @param {string} id
   */
  async findOneById(id: string): Promise<Transaction> {
    const transaction = await this.repository.getById(id);

    if (!transaction) {
      throw new NotFoundException("The transaction with the given ID was not found.");
    }

    return transaction;
  }

  async update(id: string, updateTransactionRequest: UpdateTransactionRequest): Promise<Transaction> {
    await this.findOneById(id);

    return this.repository.updateOne(id, updateTransactionRequest);
  }

  async remove(id: string): Promise<Transaction> {
    await this.findOneById(id);

    return this.repository.remove(id);
  }
}
