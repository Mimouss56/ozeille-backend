import { Module } from "@nestjs/common";
import { MailerModule } from "src/mailer/mailer.module";

import { PrismaService } from "../prisma/prisma.service";
import { UsersController } from "./controller/users.controller";
import { UsersRepository } from "./repository/users.repository";
import { UsersService } from "./services/users.service";

@Module({
  controllers: [UsersController],
  imports: [MailerModule],
  providers: [UsersService, UsersRepository, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
