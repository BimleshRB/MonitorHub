import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import User from '@/models/User'

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase()
    const payload = requireAuth(request)

    const user = await User.findById(payload.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await User.deleteOne({ _id: payload.userId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Account delete error', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
