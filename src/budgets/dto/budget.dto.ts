import { createZodDto } from "nestjs-zod";
import { hexColorSchema } from "src/common/schemas/fields.schema";
import { z } from "zod";

export const budgetSchema = z.object({
  id: z.uuid(),
  label: z.string("Label must be a string").min(1).max(30).describe("The label of the budget"),
  color: hexColorSchema.nullable().optional().describe("The color of the budget in Hex format"),
  userId: z.uuid().describe("The ID of the user who owns the budget"),
});

export type BudgetDto = z.infer<typeof budgetSchema>;
export class BudgetResponse extends createZodDto(budgetSchema) {}
