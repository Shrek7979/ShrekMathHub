'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { ErrorBox, Spinner } from '@/components/ui'
import { koError } from '@/lib/format'
import { supabase } from '@/lib/supabase'

/** 비밀번호 재설정 메일의 링크가 여는 화면 (링크를 누르면 잠깐 로그인된 상태가 된다) */
export default function ResetPage() {
  const router = useRouter()
  const { session, loading } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (loading) return <Spinner />
  if (!session)
    return (
      <p className="card mx-auto mt-6 max-w-sm p-6 text-center text-sm text-slate-600">
        링크가 만료되었어요.{' '}
        <Link href="/forgot" className="font-semibold text-brand-700">
          다시 받기
        </Link>
      </p>
    )

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) return setError('비밀번호는 8자 이상으로 정해 주세요.')
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) return setError(koError(error))
    alert('새 비밀번호로 바꿨어요.')
    router.replace('/')
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="page-title text-center">새 비밀번호</h1>
      <form onSubmit={submit} className="card mt-6 space-y-4 p-5">
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="새 비밀번호 (8자 이상)"
          autoComplete="new-password"
        />
        <ErrorBox>{error}</ErrorBox>
        <button className="btn-primary w-full" disabled={busy}>
          바꾸기
        </button>
      </form>
    </div>
  )
}
