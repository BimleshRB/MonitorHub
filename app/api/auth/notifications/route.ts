import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import User from '@/models/User'

export interface NotificationPreferences {
  emailAlerts?: boolean
  slackAlerts?: boolean
  smsAlerts?: boolean
  weeklyReport?: boolean
  incident?: boolean
  maintenance?: boolean
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const payload = requireAuth(request)

    const user = await User.findById(payload.userId).select('notificationPreferences').lean()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      preferences: user.notificationPreferences || {
        emailAlerts: true,
        slackAlerts: false,
        smsAlerts: false,
        weeklyReport: true,
        incident: true,
        maintenance: true,
      },
    })
  } catch (error) {
    console.error('Notification preferences GET error', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase()
    const payload = requireAuth(request)

    const body = await request.json()
    const preferences: NotificationPreferences = body || {}

    const user = await User.findByIdAndUpdate(
      payload.userId,
      { notificationPreferences: preferences },
      { new: true }
    ).lean()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      preferences: user.notificationPreferences || preferences,
    })
  } catch (error) {
    console.error('Notification preferences PUT error', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}
