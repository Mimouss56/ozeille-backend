import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const Validate2FAResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export class Validate2FAResponseDto extends createZodDto(Validate2FAResponseSchema) {}
