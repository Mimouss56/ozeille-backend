import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8).max(255),
    confirmedPassword: z.string().min(8).max(255),
  })
  .refine((data) => data.password === data.confirmedPassword, {
    message: "Passwords don't match",
    path: ["confirmedPassword"],
  });

export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}
