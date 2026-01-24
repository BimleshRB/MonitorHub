import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { signAccessToken, verifyPassword } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { email, password } = body || {}

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = signAccessToken({ userId: user._id.toString(), email: user.email, role: user.role, name: user.name })
    const res = NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    })
    res.cookies.set('token', token, { httpOnly: true, secure: false, sameSite: 'lax', path: '/' })

    return res
  } catch (error) {
    console.error('Login error', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
