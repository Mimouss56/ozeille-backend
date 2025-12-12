import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const CredentialsSchema = z.object({
  email: z.email().max(50),
  password: z.string().min(8).max(255),
  confirmedPassword: z.string().min(8).max(255),
  firstName: z.string().min(1).max(30),
  lastName: z.string().min(1).max(30),
});

export class CreateUserDto extends createZodDto(CredentialsSchema) {}
