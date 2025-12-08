import { z } from "zod";
import { createZodDto } from 'nestjs-zod';

export const createBudgetSchema = z
  .object({
    label: z.string().min(1).max(30).describe("The label of the budget"),
    // Le regex pour les couleurs Hex, par exemple #FFF ou #FFFFFF
    color: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
        message: "Color must be a valid Hex code (ex : #FFFFFF or #FFF)"
      })
      .nullable()
      .optional()
      .describe("The color of the budget in Hex format"),
  })
  .required();

export class CreateBudgetDto extends createZodDto(createBudgetSchema) {}