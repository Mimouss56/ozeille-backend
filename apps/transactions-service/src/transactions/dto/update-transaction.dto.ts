import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { TransactionSchema } from "./transaction.dto";

export const updateTransactionSchema = TransactionSchema.pick({
  amount: true,
  label: true,
  dueAt: true,
  pointedAt: true,
}).required();

export type UpdateTransactionDto = z.infer<typeof updateTransactionSchema>;

export class UpdateTransactionRequest extends createZodDto(updateTransactionSchema) {}
