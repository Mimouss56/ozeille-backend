import { createZodDto } from "nestjs-zod";
import { directionEnumSchema, paginationFilterSchema } from "src/common/dto/filter.dto";
import { z } from "zod";

export enum CategoryExpand {
  BUDGET = "budget",
  TRANSACTIONS = "transactions",
}

const categoryFilterSchema = paginationFilterSchema.extend({
  label: z.string().min(1).max(30).optional().describe("Recherche par label de catégorie"),
  "order[label]": directionEnumSchema.default("desc"),
  expand: z.string().optional().describe("Comma-separated list of relations to expand (e.g. 'budget,transactions')"),
});

export type CategoryFilterDto = z.infer<typeof categoryFilterSchema>;
export class CategoryFilters extends createZodDto(categoryFilterSchema) {}
