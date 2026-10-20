'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Gate } from '@/components/Gate'
import { LoadError, Spinner } from '@/components/ui'
import { SUBJECTS, UNIT_HINTS } from '@/lib/curriculum'
import { supabase } from '@/lib/supabase'
import type { SchoolLevel } from '@/lib/types'

type Row = { school_level: SchoolLevel; subject: string; unit: string; n: number }

export default function CurriculumPage() {
  return (
    <Gate>
      <CurriculumMap />
    </Gate>
  )
}

/** 학교급 → 과목 → 단원 순서로 자료가 얼마나 모였는지 보여 주는 지도 */
function CurriculumMap() {
  const { profile } = useAuth()
  const [level, setLevel] = useState<SchoolLevel>(profile?.school_level === '중' ? '중' : '고')
  const [rows, setRows] = useState<Row[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    setFailed(false)
    supabase.rpc('resource_counts').then(({ data, error }) =>
      error ? setFailed(true) : setRows(((data as Row[]) ?? []).map((r) => ({ ...r, n: Number(r.n) }))),
    )
  }, [reload])

  if (failed) return <LoadError onRetry={() => setReload((n) => n + 1)} />
  if (!rows) return <Spinner />

  const mine = rows.filter((r) => r.school_level === level)
  const total = mine.reduce((s, r) => s + r.n, 0)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">교육과정 지도</h1>
          <p className="mt-1 text-sm text-slate-500">
            과목·단원을 누르면 그 자료만 모아 볼 수 있어요. 숫자는 올라온 자료 수예요. 회색 단원(자료 없음)을 누르면 자료를 요청할 수 있어요.
          </p>
        </div>
        <div className="flex gap-2">
          {(['중', '고'] as const).map((l) => (
            <button key={l} onClick={() => setLevel(l)} className={`chip ${level === l ? 'chip-on' : ''}`}>
              {l === '중' ? '중학교' : '고등학교'} ({rows.filter((r) => r.school_level === l).reduce((s, r) => s + r.n, 0)})
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-8">
        {SUBJECTS[level].map((group) => (
          <section key={group.group}>
            <h2 className="mb-3 text-sm font-bold text-slate-500">{group.group}</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {group.items.map((subject) => (
                <SubjectCard key={subject} level={level} subject={subject} rows={mine.filter((r) => r.subject === subject)} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {total === 0 && (
        <p className="mt-8 text-center text-sm text-slate-500">
          아직 {level === '중' ? '중학교' : '고등학교'} 자료가 없어요.{' '}
          <Link href="/resources/new" className="font-semibold text-brand-700">
            첫 자료 올리기 →
          </Link>
        </p>
      )}
    </div>
  )
}

function SubjectCard({ level, subject, rows }: { level: SchoolLevel; subject: string; rows: Row[] }) {
  const count = rows.reduce((s, r) => s + r.n, 0)
  const byUnit = new Map(rows.map((r) => [r.unit, r.n]))
  // 교육과정 단원 + 선생님들이 직접 적은 단원
  const units = Array.from(new Set([...(UNIT_HINTS[subject] ?? []), ...rows.map((r) => r.unit).filter(Boolean)]))
  const noUnit = byUnit.get('') ?? 0
  const base = `/resources?level=${level}&subject=${encodeURIComponent(subject)}`

  return (
    <div className={`card p-4 ${count === 0 ? 'opacity-70' : ''}`}>
      <Link href={base} className="flex items-center justify-between gap-2 hover:text-brand-700">
        <h3 className="font-bold text-slate-900">{subject}</h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${count ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
          {count}
        </span>
      </Link>
      {units.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {units.map((u) => {
            const n = byUnit.get(u) ?? 0
            // 자료가 없는 단원은 누르면 게시판에 '자료 요청' 질문을 쓰게 한다
            const href = n
              ? `${base}&unit=${encodeURIComponent(u)}`
              : `/board/new?category=${encodeURIComponent('질문')}&title=${encodeURIComponent(`[${subject} · ${u}] 자료 요청`)}`
            return (
              <li key={u}>
                <Link
                  href={href}
                  title={n ? `${u} 자료 ${n}개 보기` : `${u} 자료가 아직 없어요 — 눌러서 요청하기`}
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs transition ${
                    n ? 'border-brand-200 bg-brand-50 text-brand-800 hover:border-brand-400' : 'border-slate-200 text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {u}
                  {n > 0 && <b className="tabular-nums">{n}</b>}
                </Link>
              </li>
            )
          })}
          {noUnit > 0 && <li className="px-1 py-0.5 text-xs text-slate-500">단원 미지정 {noUnit}</li>}
        </ul>
      )}
    </div>
  )
}
