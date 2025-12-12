import { Global, Module } from "@nestjs/common";
import Redis from "ioredis";

import { RedisService } from "./services/redis.service";

@Global()
@Module({
  providers: [
    {
      provide: Redis,
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || "localhost",
          port: parseInt(process.env.REDIS_PORT || "6379", 10),
          maxRetriesPerRequest: 3,
          retryStrategy: (times: number) => {
            if (times > 3) {
              return null;
            }
            return Math.min(times * 50, 2000);
          },
        });
      },
    },
    RedisService,
  ],
  exports: [Redis, RedisService],
})
export class RedisModule {}
