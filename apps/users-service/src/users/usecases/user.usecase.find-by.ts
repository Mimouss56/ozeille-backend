import { Injectable } from "@nestjs/common";
import { User } from "src/generated/prisma/client";
import { UserWhereUniqueInput } from "src/generated/prisma/models/User";
import { PrismaService } from "src/prisma/prisma.service";

import { UserEntity } from "../entities/user.entity";

@Injectable()
export class UserUsecaseFind {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(args: UserWhereUniqueInput): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: args });
    if (!user) {
      return null;
    }
    // mapper de user pour omettre le password
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOne({ email });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
