/**
 * Monitor Health Check Cron Job
 * Runs every 1 minute to check all active monitors
 * 
 * Features:
 * - Redis lock prevents overlapping runs
 * - Batch processing (20 monitors at a time)
 * - Promise.allSettled for resilience
 * - Incident detection with 2-failure threshold
 * - AI analysis and email alerts
 * - Cron secret validation
 */

import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import Monitor from '@/models/Monitor'
import HealthLog from '@/models/HealthLog'
import User from '@/models/User'
import { checkMonitorHealth } from '@/lib/monitor-health-check'
import { checkAndCreateIncident, resolveIncident } from '@/lib/incident-service'
import {
  acquireCronLock,
  releaseCronLock,
  isAlertInCooldown,
  setAlertCooldown,
} from '@/lib/redis'
import {
  sendDowntimeAlert,
  sendRecoveryAlert,
} from '@/lib/email-service'

const CRON_SECRET = process.env.CRON_SECRET
const BATCH_SIZE = 20

/**
 * Validate cron request with secret
 */
function validateCronSecret(request: Request): boolean {
  if (!CRON_SECRET) {
    console.warn('CRON_SECRET not configured, allowing all cron requests')
    return true
  }

  const provided = request.headers.get('x-cron-secret')
  return provided === CRON_SECRET
}

/**
 * Process a batch of monitors
 */
async function processBatch(monitors: any[]): Promise<{ success: number; failed: number }> {
  const results = await Promise.allSettled(
    monitors.map(async (monitor) => {
      try {
        await processMonitor(monitor)
        return { success: true }
      } catch (error) {
        console.error(`Error processing monitor ${monitor._id}:`, error)
        return { success: false }
      }
    })
  )

  const success = results.filter((r) => r.status === 'fulfilled' && r.value?.success).length
  const failed = results.length - success

  return { success, failed }
}

/**
 * Process a single monitor health check
 */
async function processMonitor(monitor: any): Promise<void> {
  const { _id: monitorId, userId, url, name } = monitor

  // Perform health check
  const healthCheck = await checkMonitorHealth(url)

  // Log health check result
  await HealthLog.create({
    monitorId,
    statusCode: healthCheck.statusCode,
    responseTime: healthCheck.responseTime,
    isUp: healthCheck.isUp,
    errorMessage: healthCheck.errorMessage,
    checkedAt: new Date(),
  })

  // Update monitor status
  const previousStatus = monitor.status
  const newStatus = healthCheck.status

  if (newStatus !== previousStatus) {
    await Monitor.findByIdAndUpdate(monitorId, {
      status: newStatus,
      lastCheckedAt: new Date(),
      lastStatusCode: healthCheck.statusCode,
      lastResponseTime: healthCheck.responseTime,
      consecutiveFailures: healthCheck.isUp ? 0 : (monitor.consecutiveFailures || 0) + 1,
    })
  } else {
    await Monitor.findByIdAndUpdate(monitorId, {
      lastCheckedAt: new Date(),
      lastStatusCode: healthCheck.statusCode,
      lastResponseTime: healthCheck.responseTime,
      consecutiveFailures: healthCheck.isUp ? 0 : (monitor.consecutiveFailures || 0) + 1,
    })
  }

  // Get user for notifications
  const user = await User.findById(userId).lean()
  if (!user || !user.notificationPreferences?.emailAlerts) {
    return
  }

  // Handle incident creation or resolution
  if (!healthCheck.isUp) {
    // Monitor is down - check if we should create incident
    const incidentCreated = await checkAndCreateIncident({
      monitorId: monitorId.toString(),
      userId: userId.toString(),
      statusCode: healthCheck.statusCode,
      responseTime: healthCheck.responseTime,
      errorMessage: healthCheck.errorMessage,
    })

    // Send downtime alert if incident was created and not in cooldown
    if (incidentCreated) {
      const inCooldown = await isAlertInCooldown(monitorId.toString())
      if (!inCooldown) {
        await sendDowntimeAlert(
          user.email,
          user.name,
          name,
          url,
          healthCheck.statusCode,
          healthCheck.responseTime,
          healthCheck.errorMessage
        )
      }
    }
  } else if (previousStatus === 'DOWN' || previousStatus === 'SLOW') {
    // Monitor recovered - resolve incident
    const incidentResolved = await resolveIncident(monitorId.toString())

    if (incidentResolved) {
      // Get incident details for email
      const incident = await HealthLog.findOne({ monitorId, isUp: false })
        .sort({ checkedAt: -1 })
        .lean()

      if (incident) {
        const downtime = Math.floor(
          (Date.now() - (incident.checkedAt?.getTime() || Date.now())) / 1000
        )
        await sendRecoveryAlert(
          user.email,
          user.name,
          name,
          url,
          downtime
        )
      }
    }
  }
}

/**
 * Main cron handler
 */
export async function POST(request: Request) {
  const startTime = Date.now()

  // Validate cron secret
  if (!validateCronSecret(request)) {
    console.warn('Cron request rejected: invalid secret')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Try to acquire lock (prevent concurrent runs)
  const lockAcquired = await acquireCronLock()
  if (!lockAcquired) {
    console.warn('Cron job already running, skipping')
    return NextResponse.json(
      { message: 'Job already running', skipped: true },
      { status: 202 }
    )
  }

  try {
    await connectToDatabase()

    console.log('Starting monitor health check cron job')

    // Fetch all active monitors
    const monitors = await Monitor.find({ isActive: true })
      .select('_id userId url name status')
      .lean()

    console.log(`Processing ${monitors.length} monitors`)

    let totalSuccess = 0
    let totalFailed = 0

    // Process in batches to avoid resource exhaustion
    for (let i = 0; i < monitors.length; i += BATCH_SIZE) {
      const batch = monitors.slice(i, i + BATCH_SIZE)
      const { success, failed } = await processBatch(batch)
      totalSuccess += success
      totalFailed += failed

      // Small delay between batches to avoid overwhelming the system
      if (i + BATCH_SIZE < monitors.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    const duration = Date.now() - startTime

    console.log(
      `Cron job completed in ${duration}ms: ${totalSuccess} success, ${totalFailed} failed`
    )

    return NextResponse.json({
      success: true,
      processed: totalSuccess,
      failed: totalFailed,
      durationMs: duration,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  } finally {
    // Always release lock
    await releaseCronLock()
  }
}
