'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export type SessionUser = {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
}

export function useAuthCheck() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cached = sessionStorage.getItem('user')
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as SessionUser
        setUser(parsed)
      } catch (error) {
        sessionStorage.removeItem('user')
      }
    }

    const load = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        if (!res.ok) {
          sessionStorage.removeItem('user')
          router.push('/login')
          return
        }

        const data = await res.json()
        const nextUser: SessionUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        }

        sessionStorage.setItem('user', JSON.stringify(nextUser))
        setUser(nextUser)
      } catch (error) {
        sessionStorage.removeItem('user')
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  return { user, loading }
}
