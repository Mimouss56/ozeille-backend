import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const TransactionSchema = z.object({
  id: z.uuid(),
  amount: z.float32().refine((val) => val !== 0, {
    error: "Amount must not be equal to 0",
  }),
  label: z.string("Label must be a string").max(30, { error: "Label must be less than 30 characters" }),
  dueAt: z.iso.datetime("Due date must be a valid date with an ISO format (YYYY-MM-DDT00:00:00.000Z)"),
  pointedAt: z.iso.datetime().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type TransactionDto = z.infer<typeof TransactionSchema>;
export class TransactionResponse extends createZodDto(TransactionSchema) {}
