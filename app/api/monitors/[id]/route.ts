import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import Monitor from '@/models/Monitor'

interface Params {
  params: { id: string }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase()
    const payload = requireAuth(request)

    const monitor = await Monitor.findById(params.id)
    if (!monitor) {
      return NextResponse.json({ error: 'Monitor not found' }, { status: 404 })
    }

    if (monitor.userId.toString() !== payload.userId && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, url, interval, status } = body || {}

    if (name) monitor.name = name
    if (url) monitor.url = url
    if (interval) monitor.interval = interval
    if (status && (status === 'UP' || status === 'DOWN')) monitor.status = status

    await monitor.save()
    return NextResponse.json({ monitor })
  } catch (error) {
    console.error('Monitor PUT error', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase()
    const payload = requireAuth(request)

    const monitor = await Monitor.findById(params.id)
    if (!monitor) {
      return NextResponse.json({ error: 'Monitor not found' }, { status: 404 })
    }

    if (monitor.userId.toString() !== payload.userId && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await monitor.deleteOne()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Monitor DELETE error', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
