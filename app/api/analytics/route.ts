/**
 * Analytics API Endpoint
 * GET /api/analytics - Get KPIs and dashboard metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import Monitor from '@/models/Monitor'
import HealthLog from '@/models/HealthLog'
import Incident from '@/models/Incident'
import { requireAuth } from '@/lib/auth'
import {
  getCachedDashboardKPIs,
  cacheDashboardKPIs,
} from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const payload = requireAuth(request)

    // Check cache first (30 second TTL)
    const cached = await getCachedDashboardKPIs(payload.userId)
    if (cached) {
      return NextResponse.json(
        {
          success: true,
          message: 'Cached results',
          kpis: cached,
        },
        { status: 200 }
      )
    }

    const now = new Date()
    const last24h = new Date(now.getTime() - 86400000)
    const last7d = new Date(now.getTime() - 7 * 86400000)

    // Get user's monitors
    const monitors = await Monitor.find({ userId: payload.userId }).select('_id status').lean()
    const monitorIds = monitors.map((m) => m._id)

    // Calculate KPIs in parallel
    const [
      totalMonitors,
      activeMonitors,
      upMonitors,
      downMonitors,
      slowMonitors,
      incident24h,
      averageResponseTime,
      uptime24h,
    ] = await Promise.all([
      Monitor.countDocuments({ userId: payload.userId }),
      Monitor.countDocuments({ userId: payload.userId, isActive: true }),
      Monitor.countDocuments({ userId: payload.userId, status: 'UP' }),
      Monitor.countDocuments({ userId: payload.userId, status: 'DOWN' }),
      Monitor.countDocuments({ userId: payload.userId, status: 'SLOW' }),
      Incident.countDocuments({
        userId: payload.userId,
        createdAt: { $gte: last24h },
      }),
      (async () => {
        const logs = await HealthLog.aggregate([
          { $match: { monitorId: { $in: monitorIds } } },
          { $group: { _id: null, avg: { $avg: '$responseTime' } } },
        ])
        return logs[0]?.avg || 0
      })(),
      (async () => {
        const logs = await HealthLog.find({
          monitorId: { $in: monitorIds },
          checkedAt: { $gte: last24h },
        })
          .select('isUp')
          .lean()

        if (logs.length === 0) return 100
        const upCount = logs.filter((l) => l.isUp).length
        return ((upCount / logs.length) * 100).toFixed(2)
      })(),
    ])

    const kpis = {
      totalMonitors,
      activeMonitors,
      upMonitors,
      downMonitors,
      slowMonitors,
      incidents24h: incident24h,
      averageResponseTime: Math.round(averageResponseTime),
      uptime24h: parseFloat(uptime24h),
      timestamp: now.toISOString(),
    }

    // Cache for 30 seconds
    await cacheDashboardKPIs(payload.userId, kpis)

    return NextResponse.json(
      {
        success: true,
        kpis,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Analytics GET error:', error)
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
