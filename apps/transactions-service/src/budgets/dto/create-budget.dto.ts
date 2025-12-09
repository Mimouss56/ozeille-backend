import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { budgetSchema } from "./budget.dto";

export const createBudgetSchema = budgetSchema
  .pick({
    label: true,
    color: true,
  })
  .required();

export type CreateBudgetDto = z.infer<typeof createBudgetSchema>;

export class CreateBudgetRequest extends createZodDto(createBudgetSchema) {}
