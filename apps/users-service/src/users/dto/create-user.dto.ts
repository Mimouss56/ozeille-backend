import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email().max(50),
  password: z.string().min(8).max(255),
  firstName: z.string().min(1).max(30),
  lastName: z.string().min(1).max(30),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
