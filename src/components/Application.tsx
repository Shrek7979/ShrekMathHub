'use client'

import Link from 'next/link'
import { useState } from 'react'
import { LEVEL_LABEL } from '@/lib/curriculum'
import { koError } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import type { MemberLevel } from '@/lib/types'
import { useAuth } from './AuthProvider'
import { ErrorBox } from './ui'

/** 가입 신청서에 들어가는 내용 (관리자가 교사인지 확인할 때 봄) */
export type Application = {
  name: string
  level: MemberLevel
  school: string
  note: string
  agree: boolean
}

export const emptyApplication = (name = ''): Application => ({ name, level: '고', school: '', note: '', agree: false })

export function checkApplication(a: Application): string {
  if (!a.name.trim()) return '이름을 넣어 주세요.'
  if (!a.school.trim()) return '학교 이름을 넣어 주세요.'
  if (!a.agree) return '이용 규칙에 동의해 주세요.'
  return ''
}

export function ApplicationFields({ value, onChange }: { value: Application; onChange: (a: Application) => void }) {
  const set = (patch: Partial<Application>) => onChange({ ...value, ...patch })
  return (
    <>
      <Field label="이름" hint="사이트에 표시돼요. 실명을 권해요.">
        <input className="input" value={value.name} onChange={(e) => set({ name: e.target.value })} maxLength={30} autoComplete="name" />
      </Field>
      <Field label="학교급">
        <div className="flex gap-2">
          {(['중', '고', '중고'] as const).map((l) => (
            <button key={l} type="button" onClick={() => set({ level: l })} className={`chip flex-1 justify-center ${value.level === l ? 'chip-on' : ''}`}>
              {LEVEL_LABEL[l]}
            </button>
          ))}
        </div>
      </Field>
      <Field label="학교" hint="관리자만 볼 수 있어요.">
        <input className="input" value={value.school} onChange={(e) => set({ school: e.target.value })} maxLength={100} placeholder="예) 서울OO고등학교" />
      </Field>
      <Field label="교사 확인을 위한 한마디" hint="관리자만 볼 수 있어요. 담당 학년·과목, 연락 가능한 방법 등을 적어 주세요.">
        <textarea
          className="input"
          rows={3}
          value={value.note}
          onChange={(e) => set({ note: e.target.value })}
          maxLength={1000}
          placeholder="예) 2학년 대수 담당입니다. 학교 업무 메일 OOO@OO.go.kr 로 확인 가능해요."
        />
      </Field>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input type="checkbox" className="mt-0.5 accent-brand-600" checked={value.agree} onChange={(e) => set({ agree: e.target.checked })} />
        <span>
          <Link href="/rules" target="_blank" className="font-semibold text-brand-700 underline">
            이용 규칙
          </Link>
          (저작권·학생 개인정보·평가 문항 보안)을 읽었고 지킬게요.
        </span>
      </label>
    </>
  )
}

/** Google 로 처음 들어온 선생님이 적는 가입 신청서 */
export function ApplicationForm({ onDone }: { onDone: () => void }) {
  const { session, profile, refreshProfile } = useAuth()
  const [value, setValue] = useState(() => emptyApplication(profile?.name ?? ''))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const problem = checkApplication(value)
    if (problem) return setError(problem)
    const uid = session!.user.id
    setBusy(true)
    const a = await supabase.from('profiles').update({ name: value.name.trim(), school_level: value.level }).eq('id', uid)
    const b = await supabase.from('profile_private').update({ school: value.school.trim(), note: value.note.trim() }).eq('id', uid)
    setBusy(false)
    if (a.error || b.error) return setError(koError(a.error ?? b.error))
    await refreshProfile()
    onDone()
  }

  return (
    <form onSubmit={submit} className="space-y-4 text-left">
      <ApplicationFields value={value} onChange={setValue} />
      <ErrorBox>{error}</ErrorBox>
      <button className="btn-primary w-full" disabled={busy}>
        {busy ? '보내는 중…' : '가입 신청 보내기'}
      </button>
    </form>
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
