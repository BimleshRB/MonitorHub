import { NextResponse } from 'next/server'

import connectToDatabase from '@/lib/db'
import HealthLog from '@/models/HealthLog'
import Incident from '@/models/Incident'
import Monitor from '@/models/Monitor'
import { generateIncidentExplanation } from '@/lib/gemini'
import { sendIncidentEmail } from '@/lib/resend'
import { withCooldown } from '@/lib/redis'

// This route is intended to be called by Vercel Cron (or an internal queue).
// Optionally protect it with CRON_SECRET. If set, requests must include x-cron-secret header.
export async function POST(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const provided = request.headers.get('x-cron-secret')
      if (provided !== cronSecret) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // If you want to allow authenticated admins to trigger manually, uncomment:
    // requireAuth(request as any)

    await connectToDatabase()

    const monitors = await Monitor.find()
      .populate('userId', 'email name role')
      .lean()

    let processed = 0

    for (const monitor of monitors) {
      processed += 1
      const started = Date.now()
      let isUp = false
      let statusCode: number | null = null
      let responseTime: number | null = null

      try {
        const res = await fetch(monitor.url, { method: 'GET', cache: 'no-store' })
        statusCode = res.status
        responseTime = Date.now() - started
        isUp = res.ok
      } catch (error) {
        console.error(`Ping failed for ${monitor.url}`, error)
        isUp = false
      }

      await HealthLog.create({
        monitorId: monitor._id,
        statusCode,
        responseTime,
        isUp,
        checkedAt: new Date(),
      })

      await Monitor.findByIdAndUpdate(monitor._id, {
        status: isUp ? 'UP' : 'DOWN',
        lastCheckedAt: new Date(),
      })

      const openIncident = await Incident.findOne({ monitorId: monitor._id, resolvedAt: { $exists: false } })

      if (!isUp && !openIncident) {
        // New incident
        const aiExplanation = await generateIncidentExplanation({
          url: monitor.url,
          statusCode,
          responseTime,
          status: 'DOWN',
        })

        await Incident.create({
          monitorId: monitor._id,
          startedAt: new Date(),
          aiExplanation,
        })

        const email = (monitor as any).userId?.email as string | undefined
        if (email) {
          await withCooldown(`alert:${monitor._id}:down`, 900, async () => {
            await sendIncidentEmail({
              to: email,
              subject: `\u26a0\ufe0f ${monitor.name} is DOWN`,
              html: `<p>Monitor: ${monitor.name}</p><p>URL: ${monitor.url}</p><p>Status: DOWN</p><p>Status Code: ${statusCode ?? 'N/A'}</p><p>Response Time: ${responseTime ?? 'N/A'} ms</p><p>AI: ${aiExplanation ?? 'No explanation available.'}</p>`,
            })
          })
        }
      }

      if (isUp && openIncident) {
        const resolvedAt = new Date()
        const durationSeconds = Math.round((resolvedAt.getTime() - openIncident.startedAt.getTime()) / 1000)
        openIncident.resolvedAt = resolvedAt
        openIncident.durationSeconds = durationSeconds
        await openIncident.save()

        const aiExplanation = await generateIncidentExplanation({
          url: monitor.url,
          statusCode,
          responseTime,
          status: 'UP',
        })

        if (aiExplanation) {
          openIncident.aiExplanation = aiExplanation
          await openIncident.save()
        }

        const email = (monitor as any).userId?.email as string | undefined
        if (email) {
          await withCooldown(`alert:${monitor._id}:up`, 900, async () => {
            await sendIncidentEmail({
              to: email,
              subject: `\u2705 ${monitor.name} recovered`,
              html: `<p>Monitor: ${monitor.name}</p><p>URL: ${monitor.url}</p><p>Status: UP</p><p>Downtime: ${durationSeconds}s</p>`,
            })
          })
        }
      }
    }

    return NextResponse.json({ processed })
  } catch (error) {
    console.error('Cron monitor error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
