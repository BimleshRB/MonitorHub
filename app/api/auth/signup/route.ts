import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { hashPassword, signAccessToken } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { name, email, password } = body || {}

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role: 'USER' })

    const token = signAccessToken({ userId: user._id.toString(), email: user.email, role: user.role, name: user.name })
    const res = NextResponse.json(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
      { status: 201 }
    )
    res.cookies.set('token', token, { httpOnly: true, secure: false, sameSite: 'lax', path: '/' })

    return res
  } catch (error) {
    console.error('Signup error', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
