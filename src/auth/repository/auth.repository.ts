import { Injectable } from "@nestjs/common";
import { randomBytes } from "crypto";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisKey, RedisService } from "src/redis/redis.module";

import { REDIS_TTL } from "../constants/redis.constants";

@Injectable()
export class AuthRepository {
  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  // ========== 2FA Code Management ==========

  async store2FACode(userId: string, code: string): Promise<void> {
    await this.redisService.setWithPrefix(RedisKey.TWO_FA, userId, code, REDIS_TTL.CODE_2FA);
  }

  async get2FACode(userId: string): Promise<string | null> {
    return this.redisService.getWithPrefix(RedisKey.TWO_FA, userId);
  }

  async delete2FACode(userId: string): Promise<void> {
    await this.redisService.delWithPrefix(RedisKey.TWO_FA, userId);
  }

  // ========== Temp Token Management ==========

  async storeTempToken(userId: string): Promise<string> {
    const tempToken = `tmp_${randomBytes(32).toString("hex")}`;
    await this.redisService.setWithPrefix(RedisKey.TEMP_TOKEN, tempToken, userId, REDIS_TTL.TEMP_TOKEN);
    return tempToken;
  }

  async getUserIdFromTempToken(tempToken: string): Promise<string | null> {
    return this.redisService.getWithPrefix(RedisKey.TEMP_TOKEN, tempToken);
  }

  async deleteTempToken(tempToken: string): Promise<void> {
    await this.redisService.delWithPrefix(RedisKey.TEMP_TOKEN, tempToken);
  }

  // ========== Email Confirmation Token Management ==========

  async getEmailFromConfirmToken(token: string): Promise<string | null> {
    return this.redisService.getWithPrefix(RedisKey.CONFIRM_EMAIL_TOKEN, token);
  }

  async deleteConfirmToken(token: string): Promise<void> {
    await this.redisService.delWithPrefix(RedisKey.CONFIRM_EMAIL_TOKEN, token);
  }

  async confirmUserEmail(email: string): Promise<void> {
    await this.prisma.user.update({
      where: { email },
      data: { confirmedAt: new Date() },
    });
  }
}
