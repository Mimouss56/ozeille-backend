import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const LoginResponseSchema = z.object({
  message: z.string(),
  tempToken: z.string(),
});

export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}
