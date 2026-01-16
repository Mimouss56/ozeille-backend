import { createZodDto } from "nestjs-zod";
import z from "zod";

export const ForgotPasswordResponseSchema = z.object({
  message: z.string("Si le compte existe, un email de réinitialisation a été envoyé"),
});
export class ForgotPasswordResponseDto extends createZodDto(ForgotPasswordResponseSchema) {}
