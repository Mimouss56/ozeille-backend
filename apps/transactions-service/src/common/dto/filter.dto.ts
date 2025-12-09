import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const paginationFilterSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const directionEnumSchema = z.enum(["asc", "desc"]);
export const booleanEnumSchema = z.enum(["true", "false"]).transform((val) => val === "true");

export class PaginationFilters extends createZodDto(paginationFilterSchema) {}
