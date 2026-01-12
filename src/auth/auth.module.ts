import { Module } from "@nestjs/common";
import { MailerModule } from "src/mailer/mailer.module";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisModule } from "src/redis/redis.module";
import { UsersModule } from "src/users/users.module";

import { AuthController } from "./controller/auth.controller";
import { AuthService } from "./services/auth.service";

@Module({
  controllers: [AuthController],
  imports: [UsersModule, MailerModule, RedisModule],
  providers: [AuthService, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
