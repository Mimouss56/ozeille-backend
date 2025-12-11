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

    // Récupération du token depuis Redis
    const email = await this.redis.get(redisKey);

    if (!email) {
      this.logger.warn(`Token not found or expired: ${token}`);
      return false;
    }
    try {
      await this.prisma.user.update({ where: { email }, data: { confirmedAt: new Date() } });
      await this.redis.del(redisKey);

      this.logger.log(`Email confirmed successfully for: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to confirm email for ${email}:`, error);
      return false;
    }
  }
}
