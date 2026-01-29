/**
 * Redis Client Wrapper
 * Handles connection pooling, fallback behavior, and utility operations
 * Used for: alert cooldown, cron locking, dashboard caching
 */

import { Redis } from '@upstash/redis'

const REDIS_URL = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_TOKEN || process.env.REDIS_TOKEN

let redisClient: Redis | null = null

function getRedisClient(): Redis | null {
  if (!REDIS_URL || !REDIS_TOKEN) {
    console.warn('Redis not configured. Caching and rate limiting may be degraded.')
    return null
  }

  if (!redisClient) {
    try {
      redisClient = new Redis({
        url: REDIS_URL,
        token: REDIS_TOKEN,
      })
    } catch (error) {
      console.error('Failed to initialize Redis client:', error)
      return null
    }
  }

  return redisClient
}

/**
 * Set a key with expiration (TTL in seconds)
 */
export async function redis_set(
  key: string,
  value: string,
  ttlSeconds: number = 300
): Promise<boolean> {
  try {
    const client = getRedisClient()
    if (!client) return false

    await client.setex(key, ttlSeconds, value)
    return true
  } catch (error) {
    console.error(`Redis SET error for key ${key}:`, error)
    return false
  }
}

/**
 * Get a value by key
 */
export async function redis_get(key: string): Promise<string | null> {
  try {
    const client = getRedisClient()
    if (!client) return null

    const value = await client.get(key)
    return (value as string) || null
  } catch (error) {
    console.error(`Redis GET error for key ${key}:`, error)
    return null
  }
}

/**
 * Delete a key
 */
export async function redis_del(key: string): Promise<boolean> {
  try {
    const client = getRedisClient()
    if (!client) return false

    await client.del(key)
    return true
  } catch (error) {
    console.error(`Redis DEL error for key ${key}:`, error)
    return false
  }
}

/**
 * Check if a key exists
 */
export async function redis_exists(key: string): Promise<boolean> {
  try {
    const client = getRedisClient()
    if (!client) return false

    const exists = await client.exists(key)
    return exists === 1
  } catch (error) {
    console.error(`Redis EXISTS error for key ${key}:`, error)
    return false
  }
}

/**
 * Acquire a lock with automatic expiration (for cron job)
 * Returns true if lock acquired, false if already locked
 */
export async function redis_acquireLock(
  lockKey: string,
  ttlSeconds: number = 120
): Promise<boolean> {
  try {
    const client = getRedisClient()
    if (!client) return true // Fail open if Redis unavailable

    const result = await client.set(lockKey, Date.now().toString(), {
      nx: true, // Only set if not exists
      ex: ttlSeconds,
    })

    return result === 'OK'
  } catch (error) {
    console.error(`Redis LOCK error for key ${lockKey}:`, error)
    return true // Fail open if Redis unavailable
  }
}

/**
 * Release a lock
 */
export async function redis_releaseLock(lockKey: string): Promise<boolean> {
  return redis_del(lockKey)
}

/**
 * Get alert cooldown key for a monitor
 */
export function getAlertCooldownKey(monitorId: string): string {
  return `alert:${monitorId}`
}

/**
 * Check if alert is in cooldown for a monitor (15 min cooldown)
 */
export async function isAlertInCooldown(monitorId: string): Promise<boolean> {
  const cooldownKey = getAlertCooldownKey(monitorId)
  return redis_exists(cooldownKey)
}

/**
 * Set alert cooldown (15 minutes = 900 seconds)
 */
export async function setAlertCooldown(monitorId: string): Promise<boolean> {
  const cooldownKey = getAlertCooldownKey(monitorId)
  return redis_set(cooldownKey, '1', 900)
}

/**
 * Get cron job lock key
 */
export function getCronLockKey(): string {
  return 'cron:monitor-health-check'
}

/**
 * Check if cron job is already running
 */
export async function isCronJobRunning(): Promise<boolean> {
  const lockKey = getCronLockKey()
  return redis_exists(lockKey)
}

/**
 * Acquire cron job lock (prevents concurrent runs, 2 min timeout)
 */
export async function acquireCronLock(): Promise<boolean> {
  const lockKey = getCronLockKey()
  return redis_acquireLock(lockKey, 120)
}

/**
 * Release cron job lock
 */
export async function releaseCronLock(): Promise<boolean> {
  const lockKey = getCronLockKey()
  return redis_releaseLock(lockKey)
}

/**
 * Cache dashboard KPIs (30 second TTL)
 */
export async function cacheDashboardKPIs(userId: string, data: any): Promise<boolean> {
  const cacheKey = `dashboard:${userId}`
  return redis_set(cacheKey, JSON.stringify(data), 30)
}

/**
 * Get cached dashboard KPIs
 */
export async function getCachedDashboardKPIs(userId: string): Promise<any | null> {
  const cacheKey = `dashboard:${userId}`
  const cached = await redis_get(cacheKey)
  if (!cached) return null

  try {
    return JSON.parse(cached)
  } catch {
    return null
  }
}

// Legacy export for backward compatibility
export async function withCooldown(
  key: string,
  ttlSeconds: number,
  action: () => Promise<void>
) {
  const client = getRedisClient()
  if (!client) {
    await action()
    return
  }

  const acquired = await client.set(key, '1', { nx: true, ex: ttlSeconds })
  if (acquired) {
    await action()
  }
}

export const redis = getRedisClient()
