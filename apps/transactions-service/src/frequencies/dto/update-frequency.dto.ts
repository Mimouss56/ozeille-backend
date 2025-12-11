import { createZodDto } from "nestjs-zod";
import z from "zod";

import { frequencySchema } from "./frequency.dto";

export const updateFrequencySchema = frequencySchema.pick({
  label: true,
  monthlyValue: true,
});

export type UpdateFrequencyDto = z.infer<typeof updateFrequencySchema>;
export class UpdateFrequencyRequest extends createZodDto(updateFrequencySchema) {}
