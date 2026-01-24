import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import Incident from '@/models/Incident'
import Monitor from '@/models/Monitor'

interface Params {
  params: { monitorId: string }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase()
    const payload = requireAuth(request)

    const monitor = await Monitor.findById(params.monitorId)
    if (!monitor) {
      return NextResponse.json({ error: 'Monitor not found' }, { status: 404 })
    }

    if (monitor.userId.toString() !== payload.userId && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const incidents = await Incident.find({ monitorId: params.monitorId })
      .sort({ startedAt: -1 })
      .populate('monitorId', 'name url')
      .lean()
    return NextResponse.json({ incidents })
  } catch (error) {
    console.error('Incidents by monitor error', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
