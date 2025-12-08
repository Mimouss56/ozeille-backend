import { Injectable } from "@nestjs/common";
import { Prisma, User } from "src/generated/prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserUsecaseCreate {
  constructor(private readonly prisma: PrismaService) {}

  async create(userData: Prisma.UserCreateInput): Promise<User> {
    let userCreated: User;

    try {
      userCreated = await this.prisma.user.create({ data: userData });
    } catch {
      throw new Error("Error creating user");
    }
    return userCreated;
  }
}
