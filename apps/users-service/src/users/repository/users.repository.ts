import { Injectable } from "@nestjs/common";
import { Prisma, User } from "src/generated/prisma/client";

import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findByConfirmationToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { confirmation_token: token } });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }
}
