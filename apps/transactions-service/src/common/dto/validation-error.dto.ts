// src/common/dto/error.dto.ts
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { baseErrorSchema } from "./base-error.dto";

// Définition du schéma de l'erreur
const validationErrorSchema = baseErrorSchema.extend({
  error: z
    .array(
      z.object({
        property: z.string().describe("The property where the error occurred"),
        message: z.string().describe("The error message"),
      }),
    )
    .describe("A list of property"),
});

export type ValidationErrorDto = z.infer<typeof validationErrorSchema>;
export class ValidationErrorResponse extends createZodDto(validationErrorSchema) {}
