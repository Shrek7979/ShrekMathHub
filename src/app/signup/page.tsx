'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { ErrorBox } from '@/components/ui'
import { LEVEL_LABEL } from '@/lib/curriculum'
import { koError } from '@/lib/format'
import { NOT_CONFIGURED_MESSAGE, isConfigured, supabase } from '@/lib/supabase'
import type { MemberLevel } from '@/lib/types'

export default function SignupPage() {
  const router = useRouter()
  const { session, refreshProfile } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [level, setLevel] = useState<MemberLevel>('고')
  const [school, setSchool] = useState('')
  const [note, setNote] = useState('')
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [checkMail, setCheckMail] = useState(false)

  useEffect(() => {
    if (session && !busy) router.replace('/')
  }, [session, busy, router])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!isConfigured) return setError(NOT_CONFIGURED_MESSAGE)
    if (!name.trim()) return setError('이름을 넣어 주세요.')
    if (password.length < 8) return setError('비밀번호는 8자 이상으로 정해 주세요.')
    if (password !== password2) return setError('비밀번호 두 칸이 서로 달라요.')
    if (!school.trim()) return setError('학교 이름을 넣어 주세요.')
    if (!agree) return setError('이용 규칙에 동의해 주세요.')

    setBusy(true)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim(), school_level: level, school: school.trim(), note: note.trim() },
        emailRedirectTo: `${window.location.origin}/`,
      },
    })
    setBusy(false)
    if (error) return setError(koError(error))
    // 이메일 인증을 켜 둔 경우, 이미 있는 이메일이면 identities 가 비어서 온다
    if (data.user && data.user.identities?.length === 0) return setError('이미 가입된 이메일이에요. 로그인해 주세요.')
    if (!data.session) return setCheckMail(true)
    await refreshProfile()
    router.replace('/')
  }

  if (checkMail)
    return (
      <div className="card mx-auto max-w-md px-6 py-10 text-center">
        <h1 className="text-lg font-bold">메일함을 확인해 주세요</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          <b>{email}</b> 로 확인 메일을 보냈어요. 메일의 링크를 누르면 가입 신청이 접수되고, 관리자 승인 뒤 이용할 수
          있어요.
        </p>
      </div>
    )

  return (
    <div className="mx-auto max-w-md">
      <h1 className="page-title">가입 신청</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Shrek Math Hub 는 <b>중·고등학교 수학 선생님</b>만 이용할 수 있어요. 신청하시면 관리자가 확인한 뒤 승인해 드려요.
      </p>

      <form onSubmit={submit} className="card mt-6 space-y-4 p-5">
        <Field label="이름" hint="사이트에 표시돼요. 실명을 권해요.">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} autoComplete="name" />
        </Field>
        <Field label="이메일">
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="비밀번호" hint="8자 이상">
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </Field>
          <Field label="비밀번호 확인">
            <input className="input" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} autoComplete="new-password" />
          </Field>
        </div>
        <Field label="학교급">
          <div className="flex gap-2">
            {(['중', '고', '중고'] as const).map((l) => (
              <button key={l} type="button" onClick={() => setLevel(l)} className={`chip flex-1 justify-center ${level === l ? 'chip-on' : ''}`}>
                {LEVEL_LABEL[l]}
              </button>
            ))}
          </div>
        </Field>
        <Field label="학교" hint="관리자만 볼 수 있어요.">
          <input className="input" value={school} onChange={(e) => setSchool(e.target.value)} maxLength={100} placeholder="예) 서울OO고등학교" />
        </Field>
        <Field label="교사 확인을 위한 한마디" hint="관리자만 볼 수 있어요. 담당 학년·과목, 연락 가능한 방법 등을 적어 주세요.">
          <textarea
            className="input"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
            placeholder="예) 2학년 대수 담당입니다. 학교 업무 메일 OOO@OO.go.kr 로 확인 가능해요."
          />
        </Field>
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input type="checkbox" className="mt-0.5 accent-brand-600" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>
            <Link href="/rules" target="_blank" className="font-semibold text-brand-700 underline">
              이용 규칙
            </Link>
            (저작권·학생 개인정보·평가 문항 보안)을 읽었고 지킬게요.
          </span>
        </label>
        <ErrorBox>{error}</ErrorBox>
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? '신청하는 중…' : '가입 신청'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        이미 가입했다면{' '}
        <Link href="/login" className="font-semibold text-brand-700">
          로그인
        </Link>
      </p>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="label">{label}</span>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}
