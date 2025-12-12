import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const verify2FASchema = z.object({
  email: z.email("L'email doit être valide"),
  code: z.string().regex(/^\d{8}$/, "Le code doit contenir exactement 8 chiffres"),
});

export class Verify2FADto extends createZodDto(verify2FASchema) {}
