import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { advancedPaginatedSchema, normalPaginatedSchema } from "../../common/dto/pagination.dto";
import { transactionSchema } from "./transaction.dto";

const transactionPaginatedDto = normalPaginatedSchema(transactionSchema);
const advancedTransactionPaginatedDto = advancedPaginatedSchema(transactionSchema.omit({ id: true }));

export type PaginatedTransactionDto = z.infer<typeof transactionPaginatedDto>;
export type AdvancedPaginatedTransactionDto = z.infer<typeof advancedTransactionPaginatedDto>;

export class PaginatedTransactionResponse extends createZodDto(transactionPaginatedDto) {}
export class AdvancedPaginatedTransactionResponse extends createZodDto(advancedTransactionPaginatedDto) {}
