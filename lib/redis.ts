import { Redis } from '@upstash/redis'

const { UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN } = process.env

export const redis =
  UPSTASH_REDIS_URL && UPSTASH_REDIS_TOKEN
    ? new Redis({ url: UPSTASH_REDIS_URL, token: UPSTASH_REDIS_TOKEN })
    : null

export async function withCooldown(key: string, ttlSeconds: number, action: () => Promise<void>) {
  if (!redis) {
    await action()
    return
  }

  const acquired = await redis.set(key, '1', { nx: true, ex: ttlSeconds })
  if (acquired) {
    await action()
  }
}
