/**
 * Rate Limiting Utility
 * Simple in-memory rate limiter with Redis fallback
 * Limits: 100 requests per 15 minutes per IP
 */

import { NextRequest } from 'next/server'
import { redis_get, redis_set } from './redis'

const DEFAULT_LIMIT = 100
const DEFAULT_WINDOW = 15 * 60 // 15 minutes in seconds
const MEMORY_STORE = new Map<string, { count: number; resetAt: number }>()

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetAt: number
}

/**
 * Get client IP from request
 */
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown'
  )
}

/**
 * Check rate limit for a request
 * Returns result with remaining requests and reset time
 */
export async function checkRateLimit(
  request: NextRequest,
  limit: number = DEFAULT_LIMIT,
  windowSeconds: number = DEFAULT_WINDOW
): Promise<RateLimitResult> {
  const clientIP = getClientIP(request)
  const key = `ratelimit:${clientIP}`
  const now = Date.now()

  // Try Redis first
  const redisResult = await getRateLimitFromRedis(
    key,
    limit,
    windowSeconds,
    now
  )
  if (redisResult) {
    return redisResult
  }

  // Fall back to memory store
  return getRateLimitFromMemory(clientIP, limit, windowSeconds, now)
}

/**
 * Rate limit from Redis
 */
async function getRateLimitFromRedis(
  key: string,
  limit: number,
  windowSeconds: number,
  now: number
): Promise<RateLimitResult | null> {
  try {
    const stored = await redis_get(key)

    if (!stored) {
      // First request in this window
      await redis_set(key, '1', windowSeconds)
      return {
        success: true,
        limit,
        remaining: limit - 1,
        resetAt: now + windowSeconds * 1000,
      }
    }

    const count = parseInt(stored, 10)

    if (count >= limit) {
      // Rate limit exceeded
      return {
        success: false,
        limit,
        remaining: 0,
        resetAt: now + windowSeconds * 1000,
      }
    }

    // Increment counter
    await redis_set(key, (count + 1).toString(), windowSeconds)

    return {
      success: true,
      limit,
      remaining: limit - count - 1,
      resetAt: now + windowSeconds * 1000,
    }
  } catch (error) {
    // Redis failed, use memory fallback
    return null
  }
}

/**
 * Rate limit from in-memory store
 */
function getRateLimitFromMemory(
  clientIP: string,
  limit: number,
  windowSeconds: number,
  now: number
): RateLimitResult {
  const key = clientIP
  const resetWindow = windowSeconds * 1000

  // Get or create entry
  let entry = MEMORY_STORE.get(key)

  if (!entry || now > entry.resetAt) {
    // New window
    entry = { count: 1, resetAt: now + resetWindow }
    MEMORY_STORE.set(key, entry)

    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetAt: entry.resetAt,
    }
  }

  // Existing window
  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  entry.count++

  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  }
}

/**
 * Clean up old entries from memory store (runs periodically)
 */
export function cleanupMemoryStore(): void {
  const now = Date.now()
  let cleaned = 0

  for (const [key, entry] of MEMORY_STORE.entries()) {
    if (now > entry.resetAt) {
      MEMORY_STORE.delete(key)
      cleaned++
    }
  }

  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} rate limit entries`)
  }
}

// Clean up every 5 minutes
if (typeof globalThis !== 'undefined' && !globalThis._cleanupInterval) {
  ;(globalThis as any)._cleanupInterval = setInterval(cleanupMemoryStore, 5 * 60 * 1000)
}
