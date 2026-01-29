/**
 * Admin Users Management API
 * GET /api/admin/users - List all users (pagination)
 */

import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import User from '@/models/User'
import { requireAuth, requireAdmin } from '@/lib/auth'

/**
 * Get all users (admin only)
 * Supports pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const payload = requireAuth(request)
    requireAdmin(payload)

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const skip = parseInt(searchParams.get('skip') || '0')
    const role = searchParams.get('role') // 'USER' or 'ADMIN'

    // Build filter
    let filter: any = {}
    if (role && ['USER', 'ADMIN'].includes(role)) {
      filter.role = role
    }

    // Fetch users (exclude password hashes)
    const users = await User.find(filter)
      .select('-passwordHash -lastRefreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await User.countDocuments(filter)

    return NextResponse.json(
      {
        success: true,
        users,
        pagination: {
          total,
          limit,
          skip,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Admin users GET error:', error)
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { success: false, message: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }
    return NextResponse.json(
      { success: false, message: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
