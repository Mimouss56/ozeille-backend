import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { MailerModule } from "src/mailer/mailer.module";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisModule } from "src/redis/redis.module";
import { UsersModule } from "src/users/users.module";

import { AuthController } from "./controller/auth.controller";
import { AuthService } from "./services/auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  controllers: [AuthController],
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config) => ({
        secret: config.get("JWT_SECRET", "test-secret-key"),
        signOptions: {
          expiresIn: config.get("JWT_EXPIRATION", "3600"),
        },
      }),
    }),
    UsersModule,
    MailerModule,
    RedisModule,
  ],
  providers: [AuthService, PrismaService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
