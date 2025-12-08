import { createZodDto } from "nestjs-zod";
import { z } from "zod";

// Définition du schéma de l'erreur
const errorSchema = z.object({
  statusCode: z.number().describe("The HTTP status code"),
  message: z.string().describe("Error message explaining what went wrong"),
  error: z.string("The type of error").optional(),
});

export type ErrorDto = z.infer<typeof errorSchema>;
export class ErrorResponse extends createZodDto(errorSchema) {}
