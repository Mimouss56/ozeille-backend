import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { categorySchema } from "./category.dto";

export const createCategorySchema = categorySchema
  .pick({
    budgetId: true,
    label: true,
    color: true,
    userId: true,
    limitAmount: true,
  })
  .required();

export const createCategoryRequestSchema = createCategorySchema.extend({
    limitAmount: z.number().min(0).optional().default(0)
});

export type CreateCategoryDto = z.infer<typeof createCategoryRequestSchema>;

export class CreateCategoryRequest extends createZodDto(createCategoryRequestSchema) {}
