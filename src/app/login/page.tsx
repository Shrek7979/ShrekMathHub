'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { GoogleButton } from '@/components/GoogleButton'
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
      <div className="card mt-6 p-5">
        <GoogleButton />
        <p className="mt-3 text-center text-xs text-slate-400">처음이라면 Google로 들어온 뒤 가입 신청서를 적으면 돼요.</p>
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-center text-slate-500 hover:text-slate-800">이메일로 가입했다면</summary>
        <form onSubmit={submit} className="card mt-3 space-y-4 p-5">
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
            {busy ? '로그인하는 중…' : '이메일로 로그인'}
          </button>
          <p className="text-center">
            <Link href="/forgot" className="text-xs text-slate-500 hover:text-slate-800">
              비밀번호를 잊었어요
            </Link>
          </p>
        </form>
      </details>
    </div>
  )
}
