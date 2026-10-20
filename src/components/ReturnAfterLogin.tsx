'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { takeReturnPath } from '@/lib/auth-helpers'
import { useAuth } from './AuthProvider'

/** Google 로그인 뒤 첫 화면으로 돌아왔을 때, 로그인 전에 보던 화면으로 다시 옮긴다 */
export function ReturnAfterLogin() {
  const { session } = useAuth()
  const router = useRouter()
  useEffect(() => {
    // Google 로그인은 첫 화면('/')으로 돌아온다. 다른 화면(로그인 화면 등)은 그 화면이 알아서 옮긴다.
    if (!session || window.location.pathname !== '/') return
    const path = takeReturnPath()
    if (path && path !== '/') router.replace(path)
  }, [session, router])
  return null
}
