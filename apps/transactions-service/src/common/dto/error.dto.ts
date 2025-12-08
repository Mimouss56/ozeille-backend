// src/common/dto/error.dto.ts
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

// Définition du schéma de l'erreur
const BadRequestSchema = z.object({
  statusCode: z.number().describe("The HTTP status code"),
  message: z.string().describe("Error message explaining what went wrong"),
  error: z
    .array(
      z.object({
        property: z.string().describe("The property where the error occurred"),
        message: z.string().describe("The error message"),
      }),
    )
    .describe("A list of property"),
});

// Création de la classe DTO compatible Swagger
export class BadRequestDto extends createZodDto(BadRequestSchema) {}
