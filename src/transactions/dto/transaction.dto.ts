import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const transactionSchema = z.object({
  id: z.uuid(),
  amount: z.float32().refine((val) => val !== 0, {
    error: "Amount must not be equal to 0",
  }),
  label: z.string("Label must be a string").max(30, { error: "Label must be less than 30 characters" }),
  dueAt: z.iso.datetime("Due date must be a valid date with an ISO format (YYYY-MM-DDT00:00:00.000Z)"),
  pointedAt: z.iso.datetime().optional().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  categoryId: z.uuid().nullable().optional().describe("Category ID linked to this transaction"),
  frequencyId: z.uuid().nullable().optional().describe("Frequency ID linked to this transaction"),
});

export type TransactionDto = z.infer<typeof transactionSchema>;
export class TransactionResponse extends createZodDto(transactionSchema) {}
