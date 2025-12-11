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
    const redisKey = `confirm-email-token:${token}`;
    const resultRedis = await this.redis.get(redisKey);

    if (!resultRedis) return false;

    try {
      await this.prisma.user.update({ where: { email: resultRedis }, data: { confirmedAt: new Date() } });
      await this.redis.del(redisKey);
    } catch (error) {
      throw new Error("Error updating user confirmation status" + error);
    }

    return true;
  }
}
