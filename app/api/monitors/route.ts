/**
 * Monitors API Endpoints
 * GET /api/monitors - List user's monitors
 * POST /api/monitors - Create new monitor
 */

import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import Monitor from '@/models/Monitor'
import HealthLog from '@/models/HealthLog'
import { requireAuth } from '@/lib/auth'

const CreateMonitorSchema = z.object({
  name: z.string().min(3, 'Name too short').max(100),
  url: z.string().url('Invalid URL'),
  interval: z.number().min(60).max(3600).optional(),
})

/**
 * Get all monitors for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const payload = requireAuth(request)

    const monitors = await Monitor.find({ userId: payload.userId })
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean()

    // Enrich with health statistics
    const enrichedMonitors = await Promise.all(
      monitors.map(async (monitor) => {
        const logs = await HealthLog.find({ monitorId: monitor._id })
          .sort({ checkedAt: -1 })
          .limit(50)
          .lean()

        const upCount = logs.filter((l) => l.isUp).length
        const uptime = logs.length > 0 ? ((upCount / logs.length) * 100).toFixed(2) : '100'

        return {
          ...monitor,
          uptimePercent: parseFloat(uptime),
          recentChecks: logs.length,
        }
      })
    )

    return NextResponse.json(
      {
        success: true,
        monitors: enrichedMonitors,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Monitors GET error:', error)
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

/**
 * Create a new monitor
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const payload = requireAuth(request)

    const body = await request.json()

    // Validate request body
    const validation = CreateMonitorSchema.safeParse(body)
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

    const { name, url, interval = 60 } = validation.data

    // Create monitor
    const monitor = await Monitor.create({
      userId: payload.userId,
      name: name.trim(),
      url: url.trim(),
      interval,
      isActive: true,
      status: 'UP',
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Monitor created',
        monitor: monitor.toObject(),
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Monitors POST error:', error)
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
