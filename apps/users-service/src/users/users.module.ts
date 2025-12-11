import { Module } from "@nestjs/common";
import { MailerModule } from "src/mailer/mailer.module";

import { PrismaService } from "../prisma/prisma.service";
import { UserUsecaseCreate } from "./usecases/user.usecase.create";
import { UserUsecaseFind } from "./usecases/user.usecase.find-by";
import { UsersUsecaseRegister } from "./usecases/users.usecase.register";

@Module({
  controllers: [],
  imports: [MailerModule],
  providers: [UsersUsecaseRegister, UserUsecaseFind, UserUsecaseCreate, PrismaService],
  exports: [UserUsecaseFind, UsersUsecaseRegister],
})
export class UsersModule {}
