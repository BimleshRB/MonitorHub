import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import Monitor from '@/models/Monitor'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const payload = requireAuth(request)

    const monitors = await Monitor.find({ userId: payload.userId }).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ monitors })
  } catch (error) {
    console.error('Monitors GET error', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const payload = requireAuth(request)

    const body = await request.json()
    const { name, url, interval } = body || {}

    if (!name || !url) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const monitor = await Monitor.create({
      userId: payload.userId,
      name,
      url,
      interval: interval && interval > 10 ? interval : 60,
    })

    return NextResponse.json({ monitor }, { status: 201 })
  } catch (error) {
    console.error('Monitors POST error', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
