import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const CredentialsSchema = z.object({
  email: z.email().max(50),
});

export class EmailDto extends createZodDto(CredentialsSchema) {}
