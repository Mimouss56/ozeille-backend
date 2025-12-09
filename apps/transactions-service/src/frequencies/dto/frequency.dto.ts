import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const frequencySchema = z
  .object({
    label: z.string().max(30),
    monthlyValue: z
      .float32()
      .min(0.01)
      .max(24.0)
      .refine((val) => Number(val * 4) % 1 === 0, {
        message: "must be multiple of 0.25",
      }),
  })
  .required();

export type FrequencyDto = z.infer<typeof frequencySchema>;
export class FrequencyResponse extends createZodDto(frequencySchema) {}
