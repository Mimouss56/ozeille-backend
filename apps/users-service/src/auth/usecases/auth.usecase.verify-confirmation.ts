import { Injectable, Logger } from "@nestjs/common";
import { Redis } from "ioredis";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AuthUsecaseVerifyConfirmation {
  private readonly logger = new Logger(AuthUsecaseVerifyConfirmation.name);
  constructor(
    private readonly redis: Redis,
    private readonly prisma: PrismaService,
  ) {}

  async verify(token: string): Promise<boolean> {
    try {
      const redisKey = `confirm-email-token:${token}`;
      const resultRedis = await this.redis.get(redisKey);

      const userId = resultRedis;
      if (!userId) return false;

      // update user confirmedAt
      await this.prisma.user.update({ where: { email: userId }, data: { confirmedAt: new Date() } });

      // delete redis key
      await this.redis.del(redisKey);

      return true;
    } catch (err) {
      this.logger.error(`Error verifying confirmation token: ${err}`);
      return false;
    }
  }
}
