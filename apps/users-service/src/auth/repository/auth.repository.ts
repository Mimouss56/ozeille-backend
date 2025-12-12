import { Injectable } from "@nestjs/common";
import { randomBytes } from "crypto";
import Redis from "ioredis";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AuthRepository {
  private readonly CODE_2FA_TTL = 600; // 10 minutes
  private readonly TEMP_TOKEN_TTL = 600; // 10 minutes

  constructor(
    private readonly redis: Redis,
    private readonly prisma: PrismaService,
  ) {}

  // ========== 2FA Code Management ==========
  async store2FACode(userId: string, code: string): Promise<void> {
    const key = `2fa:${userId}`;
    await this.redis.setex(key, this.CODE_2FA_TTL, code);
  }

  async get2FACode(userId: string): Promise<string | null> {
    const key = `2fa:${userId}`;
    return this.redis.get(key);
  }

  async delete2FACode(userId: string): Promise<void> {
    const key = `2fa:${userId}`;
    await this.redis.del(key);
  }

  // ========== Temp Token Management ==========
  async storeTempToken(userId: string): Promise<string> {
    const tempToken = `tmp_${randomBytes(32).toString("hex")}`;
    const key = `temp-token:${tempToken}`;
    await this.redis.setex(key, this.TEMP_TOKEN_TTL, userId);
    return tempToken;
  }

  async getUserIdFromTempToken(tempToken: string): Promise<string | null> {
    const key = `temp-token:${tempToken}`;
    return this.redis.get(key);
  }

  async deleteTempToken(tempToken: string): Promise<void> {
    const key = `temp-token:${tempToken}`;
    await this.redis.del(key);
  }

  // ========== Email Confirmation Token Management ==========
  async getEmailFromConfirmToken(token: string): Promise<string | null> {
    const key = `confirm-email-token:${token}`;
    return this.redis.get(key);
  }

  async deleteConfirmToken(token: string): Promise<void> {
    const key = `confirm-email-token:${token}`;
    await this.redis.del(key);
  }

  async confirmUserEmail(email: string): Promise<void> {
    await this.prisma.user.update({
      where: { email },
      data: { confirmedAt: new Date() },
    });
  }
}
