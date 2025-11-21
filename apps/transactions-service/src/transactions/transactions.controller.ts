import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";

import { Transaction } from "../generated/prisma/client";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { TransactionsRepository } from "./repository/transactions.repository";
import { TransactionsService } from "./transactions.service";

@Controller("transactions")
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    // Constructor body can be empty or used for additional setup
  }

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto): string {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  async findAll(): Promise<Transaction[]> {
    return this.transactionsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string): string {
    return this.transactionsService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateTransactionDto: UpdateTransactionDto): string {
    return this.transactionsService.update(+id, updateTransactionDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string): string {
    return this.transactionsService.remove(+id);
  }
}
