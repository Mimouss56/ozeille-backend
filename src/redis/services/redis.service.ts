import { Injectable } from "@nestjs/common";
import Redis from "ioredis";

import { RedisKey } from "../entities/redis-key.entity";

@Injectable()
export class RedisService {
  constructor(private readonly redis: Redis) {}

  // ========== Low-level methods ==========

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.setex(key, ttl, value);
    } else {
      await this.redis.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  async expire(key: string, ttl: number): Promise<void> {
    await this.redis.expire(key, ttl);
  }

  async ttl(key: string): Promise<number> {
    return this.redis.ttl(key);
  }

  // ========== High-level methods with prefix ==========

  private buildKey(prefix: RedisKey, identifier: string): string {
    return `${prefix}:${identifier}`;
  }

  async setWithPrefix(prefix: RedisKey, identifier: string, value: string, ttl?: number): Promise<void> {
    const key = this.buildKey(prefix, identifier);
    await this.set(key, value, ttl);
  }

  async getWithPrefix(prefix: RedisKey, identifier: string): Promise<string | null> {
    const key = this.buildKey(prefix, identifier);
    return this.get(key);
  }

  async delWithPrefix(prefix: RedisKey, identifier: string): Promise<void> {
    const key = this.buildKey(prefix, identifier);
    await this.del(key);
  }

  async existsWithPrefix(prefix: RedisKey, identifier: string): Promise<boolean> {
    const key = this.buildKey(prefix, identifier);
    return this.exists(key);
  }
}
