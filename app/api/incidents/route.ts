/**
 * Incidents API Endpoints
 * GET /api/incidents - Get user's incidents
 */

import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import Incident from '@/models/Incident'
import Monitor from '@/models/Monitor'
import { requireAuth } from '@/lib/auth'

/**
 * Get incidents for authenticated user
 * Supports filtering by status and pagination
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const payload = requireAuth(request)

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'ONGOING' or 'RESOLVED'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const skip = parseInt(searchParams.get('skip') || '0')

    // Build filter
    let filter: any = {}

    if (payload.role !== 'ADMIN') {
      // Regular users see only their own incidents
      filter.userId = payload.userId
    }

    if (status && ['ONGOING', 'RESOLVED'].includes(status)) {
      filter.status = status
    }

    // Fetch incidents
    const incidents = await Incident.find(filter)
      .populate('monitorId', 'name url')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const total = await Incident.countDocuments(filter)

    return NextResponse.json(
      {
        success: true,
        incidents,
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
    console.error('Incidents GET error:', error)
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { success: false, message: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
