import { Injectable } from '@nestjs/common';

interface RateLimitBucket {
  count: number;
  expiresAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

@Injectable()
export class RateLimiterService {
  private readonly buckets = new Map<string, RateLimitBucket>();

  consume(key: string, limit: number, ttlMs: number): RateLimitResult {
    this.clearExpired();

    if (limit <= 0) {
      return { allowed: true, remaining: Number.MAX_SAFE_INTEGER, retryAfter: 0 };
    }

    const now = Date.now();
    const existing = this.buckets.get(key);

    if (!existing || existing.expiresAt <= now) {
      this.buckets.set(key, { count: 1, expiresAt: now + ttlMs });
      return { allowed: true, remaining: Math.max(0, limit - 1), retryAfter: Math.ceil(ttlMs / 1000) };
    }

    if (existing.count >= limit) {
      return { allowed: false, remaining: 0, retryAfter: Math.ceil((existing.expiresAt - now) / 1000) };
    }

    existing.count += 1;
    return {
      allowed: true,
      remaining: Math.max(0, limit - existing.count),
      retryAfter: Math.ceil((existing.expiresAt - now) / 1000),
    };
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }

  resetByPrefix(prefix: string): void {
    if (!prefix) return;
    for (const key of Array.from(this.buckets.keys())) {
      if (key.startsWith(prefix)) {
        this.buckets.delete(key);
      }
    }
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, bucket] of this.buckets.entries()) {
      if (bucket.expiresAt <= now) {
        this.buckets.delete(key);
      }
    }
  }
}
