'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { ErrorBox } from '@/components/ui'
import { koError } from '@/lib/format'
import { NOT_CONFIGURED_MESSAGE, isConfigured, supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const { session } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (session) router.replace('/')
  }, [session, router])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!isConfigured) return setError(NOT_CONFIGURED_MESSAGE)
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (error) return setError(koError(error))
    router.replace('/')
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="page-title text-center">로그인</h1>
      <form onSubmit={submit} className="card mt-6 space-y-4 p-5">
        <div>
          <label className="label" htmlFor="email">
            이메일
          </label>
          <input id="email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="pw">
            비밀번호
          </label>
          <input id="pw" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        <ErrorBox>{error}</ErrorBox>
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? '로그인하는 중…' : '로그인'}
        </button>
      </form>
      <div className="mt-4 flex justify-center gap-4 text-sm text-slate-500">
        <Link href="/forgot" className="hover:text-slate-800">
          비밀번호를 잊었어요
        </Link>
        <Link href="/signup" className="font-semibold text-brand-700">
          가입 신청
        </Link>
      </div>
    </div>
  )
}
