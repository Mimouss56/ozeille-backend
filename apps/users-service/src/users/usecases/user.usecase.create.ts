import { Injectable } from "@nestjs/common";
import { Prisma, User } from "src/generated/prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

import { UserEntity } from "../entities/user.entity";

@Injectable()
export class UserUsecaseCreate {
  constructor(private readonly prisma: PrismaService) {}

  async create(userData: Prisma.UserCreateInput): Promise<UserEntity> {
    let userCreated: User;

    try {
      userCreated = await this.prisma.user.create({ data: userData });
    } catch {
      throw new Error("Error creating user");
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    const { password, ...userWithoutPassword } = userCreated;

    return userWithoutPassword;
  }
}
