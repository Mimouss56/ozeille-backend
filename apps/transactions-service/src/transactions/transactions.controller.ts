import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "src/pipe/ZodValidationPipe";

import { Transaction } from "../generated/prisma/client";
import { CreateTransactionDto, createTransactionSchema } from "./dto/create-transaction.dto";
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
  @UsePipes(new ZodValidationPipe(createTransactionSchema))
  create(@Body() createTransactionDto: CreateTransactionDto): Promise<Transaction> {
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
