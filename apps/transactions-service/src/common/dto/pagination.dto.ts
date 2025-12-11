import { z } from "zod";

const metaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const normalPaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) => {
  return z.object({
    data: z.array(itemSchema),
    meta: metaSchema,
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const advancedPaginatedSchema = <T extends z.ZodTypeAny>(attributesSchema: T) => {
  return z.object({
    meta: metaSchema,
    links: z.object({
      self: z.url(),
      first: z.url(),
      last: z.url(),
      prev: z.url().optional(),
      next: z.url().optional(),
    }),
    data: z.array(
      z.object({
        type: z.string(),
        id: z.string(),
        attributes: attributesSchema, // ID is moved out, only attributes here
      }),
    ),
  });
};
