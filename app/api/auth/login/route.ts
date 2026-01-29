/**
 * Login API Endpoint
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { user, accessToken, refreshToken }
 * Sets HttpOnly cookies for tokens
 */

import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import User from '@/models/User'
import {
  verifyPassword,
  createTokenPair,
  setAuthCookies,
} from '@/lib/auth'

const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password too short'),
})

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()

    // Validate request body
    const validation = LoginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.errors[0].message,
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+passwordHash'
    )
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials', code: 'AUTH_FAILED' },
        { status: 401 }
      )
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: 'Account is disabled',
          code: 'ACCOUNT_DISABLED',
        },
        { status: 403 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials', code: 'AUTH_FAILED' },
        { status: 401 }
      )
    }

    // Create token pair
    const tokens = createTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    })

    // Update last login
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
      lastRefreshToken: tokens.refreshToken,
    })

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken: tokens.accessToken,
      },
      { status: 200 }
    )

    // Set auth cookies
    setAuthCookies(response, tokens)

    return response
  } catch (error) {
    console.error('Login error:', error)
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
