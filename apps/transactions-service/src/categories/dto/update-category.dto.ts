import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { categorySchema } from "./category.dto";

export const updateCategorySchema = categorySchema
  .pick({
    label: true,
    color: true,
    limitAmount: true,
  })
  .required();

export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;

export class UpdateCategoryRequest extends createZodDto(updateCategorySchema) {}
