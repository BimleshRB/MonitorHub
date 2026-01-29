import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import User from '@/models/User'

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase()
    const payload = requireAuth(request)

    const body = await request.json()
    const { name } = body || {}

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }

    const user = await User.findByIdAndUpdate(
      payload.userId,
      { name: name.trim() },
      { new: true, runValidators: true }
    ).lean()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Profile update error', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
