import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { transactionSchema } from "./transaction.dto";

export const updateTransactionSchema = transactionSchema
  .pick({
    amount: true,
    label: true,
    dueAt: true,
    pointedAt: true,
    categoryId: true,
    frequencyId: true,
  })
  .required();

export type UpdateTransactionDto = z.infer<typeof updateTransactionSchema>;

export class UpdateTransactionRequest extends createZodDto(updateTransactionSchema) {}
