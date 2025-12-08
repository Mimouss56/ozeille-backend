import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ZodSerializerInterceptor } from "nestjs-zod";

import { PrismaService } from "./prisma/prisma.service";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [UsersModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    PrismaService,
  ],
})
export class AppModule {}
