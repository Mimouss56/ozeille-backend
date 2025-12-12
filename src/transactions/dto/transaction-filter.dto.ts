import { createZodDto } from "nestjs-zod";
import { booleanEnumSchema, paginationFilterSchema } from "src/common/dto/filter.dto";
import { directionEnumSchema } from "src/common/dto/filter.dto";
import { z } from "zod";

const transactionFilterSchema = paginationFilterSchema.extend({
  "order[dueAt]": directionEnumSchema.default("desc"),
  "exists[pointedAt]": booleanEnumSchema.optional(),
});

export type TransactionFilterDto = z.infer<typeof transactionFilterSchema>;
export class TransactionFilters extends createZodDto(transactionFilterSchema) {}
