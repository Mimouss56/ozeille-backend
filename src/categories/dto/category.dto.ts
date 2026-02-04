import { createZodDto } from "nestjs-zod";
import { TransactionType } from "src/generated/prisma/enums";
import { z } from "zod";

import { hexColorSchema } from "../../common/schemas/fields.schema";

export const categorySchema = z.object({
  id: z.uuid(),
  budgetId: z.uuid().describe("Reference to the parent budget"),
  label: z.string("Label must be a string").min(1).max(30).describe("The label of the category"),
  color: hexColorSchema.nullable().optional().describe("The color of the budget in Hex format"),
  type: z.enum(TransactionType).describe("The type of transactions for this category"),
  userId: z.uuid().nullable().optional().describe("Owner ID (null for system categories)"),
  limitAmount: z.coerce
    .number("LimitAmount must be a positive number")
    .min(0)
    .default(0)
    .optional()
    .describe("Spending limit for this category"),
});

export type CategoryDto = z.infer<typeof categorySchema>;

export class CategoryResponse extends createZodDto(categorySchema) {}
