import { Module } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { UsersRepository } from "./repository/users.repository";
import { UserUsecaseCreate } from "./usecases/user.usecase.create";
import { UserUsecaseFind } from "./usecases/user.usecase.find-by";
import { UsersUsecaseRegister } from "./usecases/users.usecase.register";
import { UsersController } from "./users.controller";

@Module({
  controllers: [UsersController],
  imports: [],
  providers: [UsersUsecaseRegister, UserUsecaseFind, UserUsecaseCreate, UsersRepository, PrismaService],
  exports: [UserUsecaseFind, UsersUsecaseRegister, UsersRepository],
})
export class UsersModule {}
