import { createZodDto } from "nestjs-zod";
import { paginationFilterSchema } from "src/common/dto/filter.dto";
import { directionEnumSchema } from "src/common/dto/filter.dto";
import { z } from "zod";

const categoryFilterSchema = paginationFilterSchema.extend({
  label: z.string().min(1).max(30).optional().describe("Recherche par label de catégorie"),
  "order[label]": directionEnumSchema.default("desc"),
  // "exists[pointedAt]": booleanEnumSchema.optional(),
});

export type CategoryFilterDto = z.infer<typeof categoryFilterSchema>;
export class CategoryFilters extends createZodDto(categoryFilterSchema) {}
