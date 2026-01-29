/**
 * Signup API Endpoint
 * POST /api/auth/signup
 * Body: { name, email, password }
 * Returns: { user, accessToken, refreshToken }
 * Sends welcome email
 */

import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import User from '@/models/User'
import {
  hashPassword,
  createTokenPair,
  setAuthCookies,
} from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email-service'

const SignupSchema = z.object({
  name: z.string().min(2, 'Name too short').max(100),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()

    // Validate request body
    const validation = SignupSchema.safeParse(body)
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

    const { name, email, password } = validation.data

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email already registered',
          code: 'EMAIL_EXISTS',
        },
        { status: 409 }
      )
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      role: 'USER',
      isActive: true,
      notificationPreferences: {
        emailAlerts: true,
        incident: true,
        weeklyReport: true,
      },
    })

    // Create token pair
    const tokens = createTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    })

    // Update last login and refresh token
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
      lastRefreshToken: tokens.refreshToken,
    })

    // Send welcome email asynchronously (don't block on failure)
    sendWelcomeEmail(user.email, user.name)
      .catch((err) => {
        console.error('Failed to send welcome email:', err)
      })

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken: tokens.accessToken,
      },
      { status: 201 }
    )

    // Set auth cookies
    setAuthCookies(response, tokens)

    return response
  } catch (error) {
    console.error('Signup error:', error)
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
