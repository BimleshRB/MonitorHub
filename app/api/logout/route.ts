import { NextResponse } from 'next/server'

export async function GET() {
  const url = new URL('/login', process.env.NEXTAUTH_URL || 'http://localhost:3000')
  const res = NextResponse.redirect(url)
  res.cookies.set('token', '', { path: '/', maxAge: 0 })
  return res
}
