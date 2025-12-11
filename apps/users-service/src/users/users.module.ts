import { Module } from "@nestjs/common";
import { MailerModule } from "src/mailer/mailer.module";

import { PrismaService } from "../prisma/prisma.service";
import { UserUsecaseCreate } from "./usecases/user.usecase.create";
import { UserUsecaseFind } from "./usecases/user.usecase.find-by";
import { UsersUsecaseRegister } from "./usecases/users.usecase.register";
import { UsersController } from "./users.controller";

@Module({
  controllers: [UsersController],
  imports: [MailerModule],
  providers: [UsersUsecaseRegister, UserUsecaseFind, UserUsecaseCreate, PrismaService],
  exports: [UserUsecaseFind, UsersUsecaseRegister],
})
export class UsersModule {}
