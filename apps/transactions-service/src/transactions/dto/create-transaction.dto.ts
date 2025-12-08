import { z } from "zod";

export const createTransactionSchema = z
  .object({
    amount: z.float32().refine((val) => val !== 0, {
      error: "amount must not be equal to 0",
    }),
    label: z.string().max(30),
    dueAt: z.iso.datetime(),
  })
  .required();

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;
