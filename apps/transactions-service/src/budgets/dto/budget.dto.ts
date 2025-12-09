import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const budgetSchema = z.object({
  id: z.uuid(),
  label: z.string("Label must be a string").min(1).max(30).describe("The label of the budget"),
  // Le regex pour les couleurs Hex, par exemple #FFF ou #FFFFFF
  color: z
    .string("Color must be a string")
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: "Color must be a valid Hex code (ex : #FFFFFF or #FFF)",
    })
    .nullable()
    .optional()
    .describe("The color of the budget in Hex format"),
});

export type BudgetDto = z.infer<typeof budgetSchema>;
export class BudgetResponse extends createZodDto(budgetSchema) {}
