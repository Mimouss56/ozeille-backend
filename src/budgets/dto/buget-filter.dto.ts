import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const budgetFilterSchema = z.object({
  from: z.iso.date().optional().describe("Minimum date inclusive for budget filter"),
  to: z.iso.date().optional().describe("Maximum date inclusive for budget filter"),
});

const budgetFromFilterSchema = z.object({
  to: z.iso.date().optional().describe("Actual date for budget summary"),
});

export class SummaryBudgetFilters extends createZodDto(budgetFromFilterSchema) {}

export class BudgetFilters extends createZodDto(budgetFilterSchema) {}
