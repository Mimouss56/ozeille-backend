import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { ResetPasswordSchema } from "./reset-password.dto";

export const CredentialsSchema = z
  .object({
    email: z.email().max(50),
    firstName: z.string().min(1).max(30),
    lastName: z.string().min(1).max(30),
  })
  .extend(ResetPasswordSchema.shape);
export class CreateUserDto extends createZodDto(CredentialsSchema) {}
