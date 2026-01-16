import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const validate2FASchema = z.object({
  tempToken: z.string().min(1, "Le token temporaire est requis"),
  code: z.string().regex(/^\d{8}$/, "Le code doit contenir exactement 8 chiffres"),
});

export class Validate2FADto extends createZodDto(validate2FASchema) {}
