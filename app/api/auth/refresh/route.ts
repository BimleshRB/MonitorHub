/**
 * Refresh Token API Endpoint
 * POST /api/auth/refresh
 * Uses refreshToken cookie to issue new accessToken
 * Implements token rotation for security
 */

import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import User from '@/models/User'
import {
  getRefreshTokenFromRequest,
  verifyRefreshToken,
  createTokenPair,
  setAuthCookies,
  clearAuthCookies,
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    // Get refresh token from cookie
    const refreshToken = getRefreshTokenFromRequest(request)
    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'No refresh token provided',
          code: 'NO_REFRESH_TOKEN',
        },
        { status: 401 }
      )
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken)
    if (!payload?.userId) {
      const response = NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired refresh token',
          code: 'INVALID_REFRESH_TOKEN',
        },
        { status: 401 }
      )
      clearAuthCookies(response)
      return response
    }

    // Get user and verify they haven't logged out
    const user = await User.findById(payload.userId)
    if (!user || !user.isActive) {
      const response = NextResponse.json(
        {
          success: false,
          message: 'User not found or inactive',
          code: 'USER_NOT_FOUND',
        },
        { status: 401 }
      )
      clearAuthCookies(response)
      return response
    }

    // Verify token matches stored refresh token (token rotation)
    if (user.lastRefreshToken !== refreshToken) {
      console.warn(`Refresh token mismatch for user ${user._id} - possible token reuse attack`)
      const response = NextResponse.json(
        {
          success: false,
          message: 'Refresh token has been revoked',
          code: 'TOKEN_REVOKED',
        },
        { status: 401 }
      )
      clearAuthCookies(response)
      return response
    }

    // Create new token pair
    const tokens = createTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    })

    // Update stored refresh token in DB
    await User.findByIdAndUpdate(user._id, {
      lastRefreshToken: tokens.refreshToken,
    })

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Token refreshed',
        accessToken: tokens.accessToken,
      },
      { status: 200 }
    )

    // Set new auth cookies
    setAuthCookies(response, tokens)

    return response
  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}
