/**
 * Incident Detection & Management Service
 * Handles incident creation, resolution, and tracking with idempotency
 */

import { Types } from 'mongoose'
import Incident from '@/models/Incident'
import Monitor from '@/models/Monitor'
import HealthLog from '@/models/HealthLog'
import { analyzeIncident } from './gemini'
import connectToDatabase from './db'

export interface IncidentCreateInput {
  monitorId: string
  userId: string
  statusCode?: number | null
  responseTime?: number | null
  errorMessage?: string
}

/**
 * Check if monitor should trigger an incident
 * Uses consecutive failures: 2 failures = incident
 */
export async function checkAndCreateIncident(params: IncidentCreateInput): Promise<boolean> {
  await connectToDatabase()

  const { monitorId, userId, statusCode, responseTime, errorMessage } = params

  try {
    // Get the monitor
    const monitor = await Monitor.findById(monitorId)
    if (!monitor) {
      console.warn(`Monitor ${monitorId} not found`)
      return false
    }

    // Check for existing ongoing incident
    const existingIncident = await Incident.findOne({
      monitorId,
      status: 'ONGOING',
    })

    if (existingIncident) {
      // Incident already exists, just increment failure count
      existingIncident.failureCount += 1
      await existingIncident.save()
      return false
    }

    // Check recent health logs for consecutive failures
    const recentLogs = await HealthLog.find({ monitorId })
      .sort({ checkedAt: -1 })
      .limit(3)
      .lean()

    // Need 2 consecutive failures to create incident
    if (recentLogs.length < 2 || recentLogs.some((log) => log.isUp)) {
      return false
    }

    // Create incident
    const incidentData = {
      monitorId,
      userId,
      startedAt: new Date(),
      status: 'ONGOING',
      failureCount: 2,
    }

    const incident = await Incident.create(incidentData)

    // Run AI analysis asynchronously (don't block on failure)
    // Determine previous incidents in last 24h
    const previousIncidents = await Incident.countDocuments({
      monitorId,
      createdAt: { $gte: new Date(Date.now() - 86400000) },
    })

    analyzeIncident({
      url: monitor.url,
      statusCode,
      responseTime,
      errorMessage,
      previousIncidents,
    })
      .then((analysis) => {
        incident.severity = analysis.severity
        incident.aiExplanation = analysis.explanation
        incident.suggestedFix = analysis.suggestedFix
        return incident.save()
      })
      .catch((err) => console.error('AI analysis failed for incident:', err))

    console.log(`Incident created for monitor ${monitorId}`)
    return true
  } catch (error) {
    console.error(`Error creating incident for monitor ${monitorId}:`, error)
    return false
  }
}

/**
 * Resolve an ongoing incident for a monitor
 * Called when monitor recovers (status becomes UP)
 */
export async function resolveIncident(monitorId: string): Promise<boolean> {
  await connectToDatabase()

  try {
    const incident = await Incident.findOne({
      monitorId,
      status: 'ONGOING',
    })

    if (!incident) {
      return false
    }

    // Calculate downtime duration
    const durationSeconds = Math.floor((Date.now() - incident.startedAt.getTime()) / 1000)

    incident.resolvedAt = new Date()
    incident.durationSeconds = durationSeconds
    incident.status = 'RESOLVED'

    await incident.save()

    console.log(
      `Incident resolved for monitor ${monitorId}. Downtime: ${durationSeconds}s`
    )
    return true
  } catch (error) {
    console.error(`Error resolving incident for monitor ${monitorId}:`, error)
    return false
  }
}

/**
 * Get ongoing incidents for a user
 */
export async function getOngoingIncidents(userId: string) {
  await connectToDatabase()

  try {
    const incidents = await Incident.find({
      userId,
      status: 'ONGOING',
    })
      .populate('monitorId', 'name url')
      .sort({ startedAt: -1 })
      .lean()

    return incidents
  } catch (error) {
    console.error(`Error fetching incidents for user ${userId}:`, error)
    return []
  }
}

/**
 * Get recent incidents (last 24 hours) for a user
 */
export async function getRecentIncidents(userId: string, hours = 24) {
  await connectToDatabase()

  try {
    const since = new Date(Date.now() - hours * 3600000)

    const incidents = await Incident.find({
      userId,
      createdAt: { $gte: since },
    })
      .populate('monitorId', 'name url')
      .sort({ createdAt: -1 })
      .lean()

    return incidents
  } catch (error) {
    console.error(
      `Error fetching recent incidents for user ${userId}:`,
      error
    )
    return []
  }
}

/**
 * Get incident statistics for KPI calculation
 */
export async function getIncidentStats(userId: string) {
  await connectToDatabase()

  try {
    const now = new Date()
    const last24h = new Date(now.getTime() - 86400000)

    const [ongoingCount, last24hCount] = await Promise.all([
      Incident.countDocuments({ userId, status: 'ONGOING' }),
      Incident.countDocuments({ userId, createdAt: { $gte: last24h } }),
    ])

    return { ongoingCount, last24hCount }
  } catch (error) {
    console.error(`Error fetching incident stats for user ${userId}:`, error)
    return { ongoingCount: 0, last24hCount: 0 }
  }
}
