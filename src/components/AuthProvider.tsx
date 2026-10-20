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
  /** 회원 정보를 불러오다 실패함 (연결 문제) */
  profileError: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionReady, setSessionReady] = useState(!isConfigured)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileReady, setProfileReady] = useState(!isConfigured)
  const [profileError, setProfileError] = useState(false)
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
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
    setProfileError(!!error)
    if (!error) setProfile((data as Profile | null) ?? null)
    setProfileReady(true)
  }, [])

  useEffect(() => {
    if (!sessionReady) return
    setProfileReady(false)
    loadProfile(userId)
  }, [sessionReady, userId, loadProfile])

  const refreshProfile = useCallback(() => loadProfile(userId), [loadProfile, userId])

  const value: AuthState = {
    session,
    profile,
    loading: !sessionReady || !profileReady,
    isApproved: profile?.status === 'approved',
    isAdmin: profile?.status === 'approved' && profile.role === 'admin',
    profileError,
    refreshProfile,
    signOut: async () => {
      // 학교 공용 PC 에서 다음 선생님에게 쓰던 글이 보이지 않게
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith('smh-draft-'))
          .forEach((k) => localStorage.removeItem(k))
      } catch {}
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
