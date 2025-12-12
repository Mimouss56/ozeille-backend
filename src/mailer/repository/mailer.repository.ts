import { Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "crypto";
import Redis from "ioredis";

@Injectable()
export class MailerRepository {
  private readonly CONFIRM_EMAIL_TTL = 600; // 10 minutes

  constructor(private readonly redis: Redis) {}

  /**
   * Generate and store email confirmation token
   */
  async generateAndStoreConfirmToken(email: string): Promise<string> {
    // Generate a random token (32 bytes -> 64 hex chars)
    const token = randomBytes(32).toString("hex");

    // Hash the token before storing to Redis
    const tokenHash = createHash("sha256").update(token).digest("hex");

    // Store hash with expiration
    const redisKey = `confirm-email-token:${tokenHash}`;
    await this.redis.setex(redisKey, this.CONFIRM_EMAIL_TTL, email);

    return tokenHash;
  }

  /**
   * Get email from confirmation token
   */
  async getEmailFromConfirmToken(token: string): Promise<string | null> {
    const redisKey = `confirm-email-token:${token}`;
    return this.redis.get(redisKey);
  }

  /**
   * Delete confirmation token
   */
  async deleteConfirmToken(token: string): Promise<void> {
    const redisKey = `confirm-email-token:${token}`;
    await this.redis.del(redisKey);
  }
}
