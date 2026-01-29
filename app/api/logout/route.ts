/**
 * Logout API Endpoint
 * POST /api/logout
 * Clears auth cookies and invalidates refresh token
 */

import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import User from '@/models/User'
import { requireAuth, clearAuthCookies } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const auth = requireAuth(request)

    await connectToDatabase()

    // Invalidate refresh token in DB
    await User.findByIdAndUpdate(auth.userId, {
      lastRefreshToken: null,
    })

    // Create response and clear cookies
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    )

    clearAuthCookies(response)

    return response
  } catch (error) {
    console.error('Logout error:', error)
    // Always clear cookies on logout
    const response = NextResponse.json(
      {
        success: false,
        message: 'Logout error',
        code: 'LOGOUT_ERROR',
      },
      { status: 500 }
    )

    clearAuthCookies(response)
    return response
  }
}

