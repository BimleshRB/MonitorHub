import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const payload = requireAuth(request)

    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const users = await User.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Admin users error', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
