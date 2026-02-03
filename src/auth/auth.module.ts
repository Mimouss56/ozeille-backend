import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { MailerModule } from "src/mailer/mailer.module";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisModule } from "src/redis/redis.module";
import { UsersModule } from "src/users/users.module";

import { AuthController } from "./controller/auth.controller";
import { AuthService } from "./services/auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";

const JWT_EXPIRATION = process.env.JWT_EXPIRATION ?? "3600";
console.log("jwt", JWT_EXPIRATION);

@Module({
  controllers: [AuthController],
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? "test-secret-key",
      signOptions: {
        expiresIn: Number(JWT_EXPIRATION),
      },
    }),
    UsersModule,
    MailerModule,
    RedisModule,
  ],
  providers: [AuthService, PrismaService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
