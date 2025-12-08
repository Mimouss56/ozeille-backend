import { Injectable } from "@nestjs/common";
import { Transaction } from "src/generated/prisma/client";

import { CreateTransactionRequest } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
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

  findOne(id: number): string {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, _updateTransactionDto: UpdateTransactionDto): string {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number): string {
    return `This action removes a #${id} transaction`;
  }
}
