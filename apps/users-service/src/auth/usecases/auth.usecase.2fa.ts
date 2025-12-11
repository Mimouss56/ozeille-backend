import { Injectable } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class AuthUsecase2FA {
  private readonly TTL = 600; // 10 minutes en secondes

  constructor(private readonly redis: Redis) {}

  async generateAndStore2FACode(userId: string): Promise<string> {
    // Générer un code à 8 chiffres
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    const key = `2fa:${userId}`;

    // Stocker dans Redis avec expiration
    await this.redis.setex(key, this.TTL, code);

    return code;
  }

  async verify2FACode(userId: string, code: string): Promise<boolean> {
    const key = `2fa:${userId}`;
    const storedCode = await this.redis.get(key);

    if (!storedCode || storedCode !== code) {
      return false;
    }

    // Supprimer le code après validation
    await this.redis.del(key);

    return true;
  }

  async delete2FACode(userId: string): Promise<void> {
    const key = `2fa:${userId}`;
    await this.redis.del(key);
  }
}
