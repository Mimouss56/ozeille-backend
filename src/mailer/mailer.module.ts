import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RedisModule } from "src/redis/redis.module";

import { MailerService } from "./services/mailer.service";

@Module({
  imports: [ConfigModule, RedisModule],
  providers: [MailerService],
  controllers: [],
  exports: [MailerService],
})
export class MailerModule {}
