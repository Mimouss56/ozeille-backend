import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const baseErrorSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
});

const errorSchema = baseErrorSchema.extend({
  error: z.string("The type of error").optional(),
});

export type ErrorDto = z.infer<typeof errorSchema>;
export class ErrorResponse extends createZodDto(errorSchema) {}
