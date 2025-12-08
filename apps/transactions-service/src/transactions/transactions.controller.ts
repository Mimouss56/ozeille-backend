import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse } from "@nestjs/swagger";
import { BadRequestDto } from "src/common/dto/error.dto";
import { type Transaction } from "src/generated/prisma/client";

import { ErrorResponse } from "../common/dto/base-error.dto";
import { CreateTransactionRequest } from "./dto/create-transaction.dto";
import { TransactionResponse } from "./dto/transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { TransactionsService } from "./transactions.service";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {
    // Constructor body can be empty or used for additional setup
  }

  @Post()
  @ApiCreatedResponse({
    description: "The transaction has been successfully created",
    type: TransactionResponse,
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: BadRequestDto,
  })
  create(@Body() createTransactionDto: CreateTransactionRequest): Promise<Transaction> {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  @ApiOkResponse({
    type: [TransactionResponse],
  })
  async findAll(): Promise<Transaction[]> {
    return this.transactionsService.findAll();
  }

  @Get(":id")
  @ApiOkResponse({
    type: TransactionResponse,
  })
  @ApiNotFoundResponse({
    description: "The transaction with the given ID was not found.",
    type: ErrorResponse,
  })
  async findOne(@Param("id") id: string): Promise<Transaction> {
    const transaction = await this.transactionsService.findOne(id);

    if (transaction === null) {
      throw new NotFoundException("The transaction with the given ID was not found.");
    }

    return transaction;
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
