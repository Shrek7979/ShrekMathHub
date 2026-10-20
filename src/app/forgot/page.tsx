'use client'

import { useState } from 'react'
import { ErrorBox } from '@/components/ui'
import { koError } from '@/lib/format'
import { NOT_CONFIGURED_MESSAGE, isConfigured, supabase } from '@/lib/supabase'

export default function ForgotPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!isConfigured) return setError(NOT_CONFIGURED_MESSAGE)
    setBusy(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset`,
    })
    setBusy(false)
    if (error) return setError(koError(error))
    setSent(true)
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="page-title text-center">비밀번호 다시 정하기</h1>
      {sent ? (
        <p className="card mt-6 p-5 text-center text-sm leading-relaxed text-slate-600">
          <b>{email}</b> 로 메일을 보냈어요. 메일의 링크를 눌러 새 비밀번호를 정해 주세요.
        </p>
      ) : (
        <form onSubmit={submit} className="card mt-6 space-y-4 p-5">
          <p className="text-sm text-slate-600">가입한 이메일을 넣으면 비밀번호를 다시 정할 수 있는 링크를 보내 드려요.</p>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="이메일" />
          <ErrorBox>{error}</ErrorBox>
          <button className="btn-primary w-full" disabled={busy}>
            링크 받기
          </button>
        </form>
      )}
    </div>
  )
}
