import { Injectable } from "@nestjs/common";
import { randomBytes } from "crypto";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisKey } from "src/redis/entities/redis-key.entity";
import { RedisService } from "src/redis/services/redis.service";

@Injectable()
export class AuthRepository {
  private readonly CODE_2FA_TTL = 600; // 10 minutes
  private readonly TEMP_TOKEN_TTL = 600; // 10 minutes

  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  // ========== 2FA Code Management ==========

  async store2FACode(userId: string, code: string): Promise<void> {
    const key = `${RedisKey.TWO_FA}:${userId}`;
    await this.redisService.set(key, code, this.CODE_2FA_TTL);
  }

  async get2FACode(userId: string): Promise<string | null> {
    const key = `${RedisKey.TWO_FA}:${userId}`;
    return this.redisService.get(key);
  }

  async delete2FACode(userId: string): Promise<void> {
    const key = `${RedisKey.TWO_FA}:${userId}`;
    await this.redisService.del(key);
  }

  // ========== Temp Token Management ==========

  async storeTempToken(userId: string): Promise<string> {
    const tempToken = `tmp_${randomBytes(32).toString("hex")}`;
    const key = `${RedisKey.TEMP_TOKEN}:${tempToken}`;
    await this.redisService.set(key, userId, this.TEMP_TOKEN_TTL);
    return tempToken;
  }

  async getUserIdFromTempToken(tempToken: string): Promise<string | null> {
    const key = `${RedisKey.TEMP_TOKEN}:${tempToken}`;
    return this.redisService.get(key);
  }

  async deleteTempToken(tempToken: string): Promise<void> {
    const key = `${RedisKey.TEMP_TOKEN}:${tempToken}`;
    await this.redisService.del(key);
  }

  // ========== Email Confirmation Token Management ==========

  async getEmailFromConfirmToken(token: string): Promise<string | null> {
    const key = `${RedisKey.CONFIRM_EMAIL_TOKEN}:${token}`;
    return this.redisService.get(key);
  }

  async deleteConfirmToken(token: string): Promise<void> {
    const key = `${RedisKey.CONFIRM_EMAIL_TOKEN}:${token}`;
    await this.redisService.del(key);
  }

  async confirmUserEmail(email: string): Promise<void> {
    await this.prisma.user.update({
      where: { email },
      data: { confirmedAt: new Date() },
    });
  }
}
