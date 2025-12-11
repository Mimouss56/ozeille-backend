import { Injectable } from "@nestjs/common";
import { randomBytes } from "crypto";
import Redis from "ioredis";

@Injectable()
export class AuthUsecaseTempToken {
  private readonly TTL = 600; // 10 minutes en secondes

  constructor(private readonly redis: Redis) {}

  async generateAndStoreTempToken(userId: string): Promise<string> {
    // Générer un token temporaire unique
    const tempToken = `tmp_${randomBytes(32).toString("hex")}`;
    const key = `temp-token:${tempToken}`;

    // Stocker le userId associé au tempToken avec expiration
    await this.redis.setex(key, this.TTL, userId);

    return tempToken;
  }

  async getUserIdFromTempToken(tempToken: string): Promise<string | null> {
    const key = `temp-token:${tempToken}`;
    const userId = await this.redis.get(key);
    return userId;
  }

  async deleteTempToken(tempToken: string): Promise<void> {
    const key = `temp-token:${tempToken}`;
    await this.redis.del(key);
  }
}
