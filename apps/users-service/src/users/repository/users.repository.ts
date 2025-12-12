import { Injectable } from "@nestjs/common";
import { Prisma, User } from "src/generated/prisma/client";
import { UserWhereUniqueInput } from "src/generated/prisma/models/User";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userData: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data: userData });
  }

  async findOne(args: UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({ where: args });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, userData: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: userData,
    });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
