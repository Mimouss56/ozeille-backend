import { createZodDto } from "nestjs-zod";
import { TransactionType } from "src/generated/prisma/enums";
import { z } from "zod";

import { categorySchema } from "./category.dto";

export const createCategorySchema = categorySchema.pick({
  budgetId: true,
  label: true,
  color: true,
  limitAmount: true,
  type: true,
});

export const createCategoryRequestSchema = createCategorySchema.extend({
  limitAmount: z.number().min(0).optional().nullable(),
  type: z.enum(TransactionType).default(TransactionType.EXPENSE),
});

export type CreateCategoryDto = z.infer<typeof createCategoryRequestSchema>;

export class CreateCategoryRequest extends createZodDto(createCategoryRequestSchema) {}
