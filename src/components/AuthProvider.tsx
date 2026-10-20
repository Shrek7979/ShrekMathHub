'use client'

import type { Session } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { isConfigured, supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

type AuthState = {
  session: Session | null
  profile: Profile | null
  /** 로그인 상태와 회원 정보를 아직 불러오는 중 */
  loading: boolean
  isApproved: boolean
  isAdmin: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionReady, setSessionReady] = useState(!isConfigured)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileReady, setProfileReady] = useState(!isConfigured)
  const userId = session?.user.id ?? null

  useEffect(() => {
    if (!isConfigured) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionReady(true)
    })
    // 이 콜백 안에서는 다른 Supabase 요청을 하지 않는다 (요청이 멈출 수 있음)
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setSessionReady(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const loadProfile = useCallback(async (uid: string | null) => {
    if (!uid) {
      setProfile(null)
      setProfileReady(true)
      return
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
    setProfile((data as Profile | null) ?? null)
    setProfileReady(true)
  }, [])

  useEffect(() => {
    if (!sessionReady) return
    setProfileReady(false)
    loadProfile(userId)
  }, [sessionReady, userId, loadProfile])

  const value: AuthState = {
    session,
    profile,
    loading: !sessionReady || !profileReady,
    isApproved: profile?.status === 'approved',
    isAdmin: profile?.status === 'approved' && profile.role === 'admin',
    refreshProfile: () => loadProfile(userId),
    signOut: async () => {
      await supabase.auth.signOut()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 는 AuthProvider 안에서만 쓸 수 있어요.')
  return ctx
}
