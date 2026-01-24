import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-not-for-production'

export type Role = 'USER' | 'ADMIN'

export interface AuthTokenPayload {
  userId: string
  email: string
  role: Role
  name?: string
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash)
}

export function signAccessToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload
}

export function getTokenFromRequest(req: NextRequest) {
  const header = req.headers.get('authorization') || ''
  if (header.startsWith('Bearer ')) {
    return header.slice(7)
  }

  const cookie = req.cookies.get('token')?.value
  return cookie || null
}

export function requireAuth(req: NextRequest): AuthTokenPayload {
  const token = getTokenFromRequest(req)
  if (!token) {
    throw new Error('Unauthorized')
  }

  const payload = verifyAccessToken(token)
  if (!payload?.userId) {
    throw new Error('Unauthorized')
  }

  return payload
}
