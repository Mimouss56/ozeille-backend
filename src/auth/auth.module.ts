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

@Module({
  controllers: [AuthController],
  imports: [
    PassportModule,
    JwtModule.register({
      // TODO: Mettre la clé secrète dans une variable d'environnement
      secret: "test-secret-key",
      signOptions: { expiresIn: "1d" },
    }),
    UsersModule,
    MailerModule,
    RedisModule,
  ],
  providers: [AuthService, PrismaService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
