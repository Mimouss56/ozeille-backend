import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const UpdateUserSchema = z.object({
  email: z.email().max(50).optional(),
  password: z.string().min(12).max(255).optional(),
  confirmedPassword: z.string().min(12).max(255).optional(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
