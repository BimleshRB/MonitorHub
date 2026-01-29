/**
 * Monitor Detail API Endpoints
 * GET /api/monitors/[id] - Get monitor details
 * PUT /api/monitors/[id] - Update monitor
 * DELETE /api/monitors/[id] - Delete monitor
 */

import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import Monitor from '@/models/Monitor'
import HealthLog from '@/models/HealthLog'
import { requireAuth, requireAdmin } from '@/lib/auth'

interface Params {
  params: { id: string }
}

const UpdateMonitorSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  url: z.string().url().optional(),
  interval: z.number().min(60).max(3600).optional(),
  isActive: z.boolean().optional(),
})

/**
 * Get monitor details with health history
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase()
    const payload = requireAuth(request)

    const monitor = await Monitor.findById(params.id).lean()
    if (!monitor) {
      return NextResponse.json(
        { success: false, message: 'Monitor not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Check authorization
    if (
      monitor.userId.toString() !== payload.userId &&
      payload.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { success: false, message: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    // Get recent health logs
    const logs = await HealthLog.find({ monitorId: params.id })
      .sort({ checkedAt: -1 })
      .limit(100)
      .lean()

    return NextResponse.json(
      {
        success: true,
        monitor: {
          ...monitor,
          recentLogs: logs,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Monitor GET error:', error)
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
 * Update monitor
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase()
    const payload = requireAuth(request)

    const monitor = await Monitor.findById(params.id)
    if (!monitor) {
      return NextResponse.json(
        { success: false, message: 'Monitor not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Check authorization
    if (
      monitor.userId.toString() !== payload.userId &&
      payload.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { success: false, message: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate request body
    const validation = UpdateMonitorSchema.safeParse(body)
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

    const { name, url, interval, isActive } = validation.data

    // Update fields
    if (name) monitor.name = name
    if (url) monitor.url = url
    if (interval) monitor.interval = interval
    if (isActive !== undefined) monitor.isActive = isActive

    monitor.updatedAt = new Date()
    await monitor.save()

    return NextResponse.json(
      {
        success: true,
        message: 'Monitor updated',
        monitor: monitor.toObject(),
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Monitor PUT error:', error)
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
 * Delete monitor
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase()
    const payload = requireAuth(request)

    const monitor = await Monitor.findById(params.id)
    if (!monitor) {
      return NextResponse.json(
        { success: false, message: 'Monitor not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Check authorization
    if (
      monitor.userId.toString() !== payload.userId &&
      payload.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { success: false, message: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    await Monitor.findByIdAndDelete(params.id)

    // Clean up health logs
    await HealthLog.deleteMany({ monitorId: params.id })

    return NextResponse.json(
      { success: true, message: 'Monitor deleted' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Monitor DELETE error:', error)
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
