import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { TransactionSchema } from "./transaction.dto";

export const createTransactionSchema = TransactionSchema.pick({
  amount: true,
  label: true,
  dueAt: true,
}).required();

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;

export class CreateTransactionRequest extends createZodDto(createTransactionSchema) {}
