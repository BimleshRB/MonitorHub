import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const payload = requireAuth(request)
    const user = await User.findById(payload.userId).lean()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Auth me error', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
