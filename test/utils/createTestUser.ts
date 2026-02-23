import * as bcrypt from "bcrypt";
import { User } from "src/generated/prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

export async function createTestUser(
  prisma: PrismaService,
  {
    email,
    password,
    firstName = "Test",
    lastName = "User",
    confirmedAt = new Date(),
  }: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    confirmedAt?: Date;
  },
): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10);
  let user = await prisma.user.findUnique({ where: { email } });
  user ??= await prisma.user.create({
    data: { email, password: hashedPassword, firstName, lastName, confirmedAt },
  });
  return user;
}
