import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  getSchemaPath,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Ctx } from "src/common/decorators/ctx.decorator";
import { ErrorResponse } from "src/common/dto/base-error.dto";
import { ValidationErrorResponse } from "src/common/dto/validation-error.dto";
import { PaginatedResponseInterceptor } from "src/common/interceptors/paginated-response.interceptor";
import { RequestContext } from "src/common/interfaces/request-context.interface";
import { PaginatedDatabaseResponse } from "src/common/types";
import { type Transaction } from "src/generated/prisma/client";

import { CreateTransactionRequest } from "../dto/create-transaction.dto";
import { TransactionFilters } from "../dto/transaction-filter.dto";
import { AdvancedPaginatedTransactionResponse, PaginatedTransactionResponse } from "../dto/transaction-paginated.dto";
import { TransactionResponse } from "../dto/transaction.dto";
import { UpdateTransactionRequest } from "../dto/update-transaction.dto";
import { TransactionsService } from "../services/transactions.service";

@Controller("api/transactions")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
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
    type: ValidationErrorResponse,
  })
  create(
    @Body() createTransactionDto: CreateTransactionRequest,
    @Ctx() ctx: RequestContext<unknown>,
  ): Promise<Transaction> {
    return this.transactionsService.create(createTransactionDto, ctx);
  }

  @Get()
  @UseInterceptors(PaginatedResponseInterceptor<Transaction>)
  @ApiExtraModels(PaginatedTransactionResponse, AdvancedPaginatedTransactionResponse)
  @ApiOkResponse({
    content: {
      "application/json": {
        schema: { $ref: getSchemaPath(PaginatedTransactionResponse) },
      },
      "application/vnd.api+json": {
        schema: { $ref: getSchemaPath(AdvancedPaginatedTransactionResponse) },
      },
    },
  })
  async findAll(
    @Query() params: TransactionFilters,
    @Ctx() ctx: RequestContext<unknown>,
  ): Promise<PaginatedDatabaseResponse<Transaction>> {
    return this.transactionsService.findAll(params, ctx);
  }

  @Get(":id")
  @ApiOkResponse({
    type: TransactionResponse,
  })
  @ApiNotFoundResponse({
    description: "The transaction with the given ID was not found.",
    type: ErrorResponse,
  })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Transaction> {
    return this.transactionsService.findOneById(id);
  }

  @Put(":id")
  @ApiOkResponse({
    type: TransactionResponse,
  })
  @ApiNotFoundResponse({
    description: "The transaction with the given ID was not found.",
    type: ErrorResponse,
  })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateTransactionRequest: UpdateTransactionRequest,
  ): Promise<Transaction> {
    return this.transactionsService.update(id, updateTransactionRequest);
  }

  @Delete(":id")
  @ApiOkResponse({
    type: TransactionResponse,
  })
  @ApiNotFoundResponse({
    description: "The transaction with the given ID was not found.",
    type: ErrorResponse,
  })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<Transaction> {
    return this.transactionsService.remove(id);
  }
}
