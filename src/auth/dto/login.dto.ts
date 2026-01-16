import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email().max(50),
  password: z.string().min(8).max(255),
});

export class LoginDto extends createZodDto(LoginSchema) {}
