import z from "zod";

export const updateFrequencySchema = z
  .object({
    label: z.string().max(30).optional(),
    monthlyValue: z
      .float32()
      .min(0.01)
      .max(24.0)
      .refine((val) => Number(val * 4) % 1 === 0, {
        message: "must be multiple of 0.25",
      })
      .optional(),
  })
  .partial()
  .required();

export type UpdateFrequencyDto = z.infer<typeof updateFrequencySchema>;
