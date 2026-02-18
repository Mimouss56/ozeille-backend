import { createZodDto } from "nestjs-zod";
import { booleanEnumSchema, paginationFilterSchema } from "src/common/dto/filter.dto";
import { directionEnumSchema } from "src/common/dto/filter.dto";
import { z } from "zod";

const transactionFilterSchema = paginationFilterSchema.extend({
  label: z.string().optional(),
  categoryId: z.uuid().optional(),
  "order[dueAt]": directionEnumSchema.default("desc"),
  "exists[pointedAt]": booleanEnumSchema.optional(),
  from: z.iso.date().optional().describe("Minimum date inclusive for transaction filter"),
  to: z.iso.date().optional().describe("Maximum date inclusive for transaction filter"),
});

export type TransactionFilterDto = z.infer<typeof transactionFilterSchema>;
export class TransactionFilters extends createZodDto(transactionFilterSchema) {}
