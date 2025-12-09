import { Module } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { UsersRepository } from "./repository/users.repository";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, PrismaService],
})
export class UsersModule {}
