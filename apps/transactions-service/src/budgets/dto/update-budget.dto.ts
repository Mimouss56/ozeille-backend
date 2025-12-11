import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { budgetSchema } from "./budget.dto";

export const updateBudgetSchema = budgetSchema
  .pick({
    label: true,
    color: true,
  })
  .required();

export type UpdateBudgetDto = z.infer<typeof updateBudgetSchema>;

export class UpdateBudgetRequest extends createZodDto(updateBudgetSchema) {}
