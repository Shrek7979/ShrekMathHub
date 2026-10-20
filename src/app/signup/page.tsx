'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ApplicationFields, checkApplication, emptyApplication } from '@/components/Application'
import { useAuth } from '@/components/AuthProvider'
import { GoogleButton } from '@/components/GoogleButton'
import { ErrorBox } from '@/components/ui'
import { koError } from '@/lib/format'
import { NOT_CONFIGURED_MESSAGE, isConfigured, supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const { session, refreshProfile } = useAuth()
  const [app, setApp] = useState(emptyApplication)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
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
    if (password.length < 8) return setError('비밀번호는 8자 이상으로 정해 주세요.')
    if (password !== password2) return setError('비밀번호 두 칸이 서로 달라요.')
    const problem = checkApplication(app)
    if (problem) return setError(problem)

    setBusy(true)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: app.name.trim(), school_level: app.level, school: app.school.trim(), note: app.note.trim() },
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
        Shrek Math Hub 는 <b>중·고등학교 수학 선생님</b>만 이용할 수 있어요.
      </p>

      <div className="card mt-6 p-5">
        <ol className="mb-5 space-y-1.5 text-sm text-slate-600">
          <li>
            <b className="text-brand-700">①</b> Google 계정으로 들어와요
          </li>
          <li>
            <b className="text-brand-700">②</b> 학교·담당 정보를 적어 가입 신청을 보내요
          </li>
          <li>
            <b className="text-brand-700">③</b> 관리자가 확인하고 승인하면 끝!
          </li>
        </ol>
        <GoogleButton label="Google 계정으로 가입 신청" />
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          Google 화면에서 &lsquo;액세스 차단됨&rsquo;이 나오면 아직 등록되지 않은 계정이라서 그래요. 아래 <b>이메일로 가입</b>을 쓰거나,
          관리자에게 Gmail 주소를 알려 주세요.
        </p>
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-center text-slate-500 hover:text-slate-800">Google 계정이 없다면 이메일로 가입</summary>
        <form onSubmit={submit} className="card mt-3 space-y-4 p-5">
          <div>
            <span className="label">이메일</span>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="label">비밀번호</span>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
              <p className="mt-1 text-xs text-slate-400">8자 이상</p>
            </div>
            <div>
              <span className="label">비밀번호 확인</span>
              <input className="input" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} autoComplete="new-password" />
            </div>
          </div>
          <ApplicationFields value={app} onChange={setApp} />
          <ErrorBox>{error}</ErrorBox>
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? '신청하는 중…' : '이메일로 가입 신청'}
          </button>
        </form>
      </details>

      <p className="mt-6 text-center text-sm text-slate-500">
        이미 가입했다면{' '}
        <Link href="/login" className="font-semibold text-brand-700">
          로그인
        </Link>
      </p>
    </div>
  )
}
