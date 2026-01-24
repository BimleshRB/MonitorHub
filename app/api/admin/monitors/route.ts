import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import Monitor from '@/models/Monitor'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const payload = requireAuth(request)

    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const monitors = await Monitor.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ monitors })
  } catch (error) {
    console.error('Admin monitors error', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
