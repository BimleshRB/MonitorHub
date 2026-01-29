/**
 * Authentication Service
 * JWT-based auth with access + refresh tokens
 * Tokens stored in HttpOnly, Secure, SameSite=Strict cookies
 */

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key'

// Validate required secrets on startup
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required but not set in environment variables')
}

export type Role = 'USER' | 'ADMIN'

export interface AuthTokenPayload {
  userId: string
  email: string
  role: Role
  name?: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

/**
 * Hash password using bcrypt (12 salt rounds for production)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

/**
 * Compare password with hash
 */
export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash)
}

/**
 * Sign access token (15 minute expiry)
 */
export function signAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET!, {
    expiresIn: '15m',
    algorithm: 'HS256',
  })
}

/**
 * Sign refresh token (7 day expiry)
 */
export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
    algorithm: 'HS256',
  })
}

/**
 * Create token pair (access + refresh)
 */
export function createTokenPair(payload: AuthTokenPayload): TokenPair {
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload.userId),
  }
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): AuthTokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET!) as AuthTokenPayload
    return payload
  } catch (error) {
    return null
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string }
    return payload
  } catch (error) {
    return null
  }
}

/**
 * Extract token from Authorization header or cookie
 */
export function getTokenFromRequest(req: NextRequest): string | null {
  // Try Authorization header first (Bearer token)
  const authHeader = req.headers.get('authorization') || ''
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // Fall back to cookie
  const cookie = req.cookies.get('accessToken')?.value
  return cookie || null
}

/**
 * Extract refresh token from cookie
 */
export function getRefreshTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get('refreshToken')?.value || null
}

/**
 * Require authentication middleware
 * Throws error if not authenticated
 */
export function requireAuth(req: NextRequest): AuthTokenPayload {
  const token = getTokenFromRequest(req)
  if (!token) {
    throw new Error('Unauthorized: No token provided')
  }

  const payload = verifyAccessToken(token)
  if (!payload?.userId) {
    throw new Error('Unauthorized: Invalid token')
  }

  return payload
}

/**
 * Require admin role
 */
export function requireAdmin(payload: AuthTokenPayload): void {
  if (payload.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin role required')
  }
}

/**
 * Set auth cookies on response
 * HttpOnly, Secure (production), SameSite=Strict
 */
export function setAuthCookies(
  response: NextResponse,
  tokens: TokenPair,
  isSecureContext: boolean = false
): void {
  const isProduction = process.env.NODE_ENV === 'production'
  const secure = isProduction || isSecureContext

  response.cookies.set('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
    maxAge: 15 * 60, // 15 minutes
  })

  response.cookies.set('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })
}

/**
 * Clear auth cookies
 */
export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set('accessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })

  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
}
