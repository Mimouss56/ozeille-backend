import { Injectable } from "@nestjs/common";
import { Prisma } from "src/generated/prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { UserEntity } from "../entities/user.entity";

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getAll(): Promise<UserEntity[]> {
    return this.prisma.user.findMany();
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<UserEntity> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<UserEntity> {
    return this.prisma.user.delete({ where: { id } });
  }

  async create(data: Prisma.UserCreateInput): Promise<UserEntity> {
    return this.prisma.user.create({ data });
  }
}
