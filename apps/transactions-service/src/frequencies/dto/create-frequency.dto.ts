import { z } from "zod";

export const createFrequencySchema = z
  .object({
    label: z.string().max(30),
    monthlyValue: z.number().min(1),
  })
  .required();

export type CreateFrequencyDto = z.infer<typeof createFrequencySchema>;
