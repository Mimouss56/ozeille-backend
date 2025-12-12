import { createZodDto } from "nestjs-zod";
import z from "zod";

import { frequencySchema } from "./frequency.dto";

export const createFrequencySchema = frequencySchema.pick({
  label: true,
  monthlyValue: true,
});

export type CreateFrequencyDto = z.infer<typeof createFrequencySchema>;
export class CreateFrequencyRequest extends createZodDto(createFrequencySchema) {}
