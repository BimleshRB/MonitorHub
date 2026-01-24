import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import Incident from '@/models/Incident'
import Monitor from '@/models/Monitor'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const payload = requireAuth(request)

    let filter = {}
    if (payload.role !== 'ADMIN') {
      const monitors = await Monitor.find({ userId: payload.userId }).select('_id')
      const ids = monitors.map((m) => m._id)
      filter = { monitorId: { $in: ids } }
    }

    const incidents = await Incident.find(filter)
      .sort({ startedAt: -1 })
      .populate('monitorId', 'name url')
      .lean()
    return NextResponse.json({ incidents })
  } catch (error) {
    console.error('Incidents GET error', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
