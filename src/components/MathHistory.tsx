'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  MACTUTOR,
  MACTUTOR_LICENSE,
  bioUrl,
  dayLabel,
  dayUrl,
  kstToday,
  loadDay,
  shiftDay,
  todayLabel,
  type DayPerson,
  type HistoryDay,
} from '@/lib/history-days'
import { useAuth } from './AuthProvider'
import { HistoryArt } from './HistoryArt'
import { Markdown } from './Markdown'

/**
 * "오늘의 수학사" 카드 — 오늘(한국 시간) 태어났거나 세상을 떠난 수학자 한 명과 그날의 사건.
 * MacTutor(St Andrews)의 Mathematicians of the Day 를 바탕으로 우리말로 정리한 자료(public/history)를 쓴다.
 * date/onDateChange 를 주면 바깥(수학사 모아 보기 화면)에서 날짜를 정한다.
 */
export function MathHistory({ date, onDateChange }: { date?: string; onDateChange?: (d: string) => void } = {}) {
  const { isApproved } = useAuth()
  const isHistoryPage = usePathname() === '/history'
  // 날짜는 서버와 브라우저가 다를 수 있어서, 화면이 뜬 뒤에 정한다
  const [today, setToday] = useState<string | null>(null)
  const [own, setOwn] = useState<string | null>(null)
  const current = date ?? own ?? today
  const [day, setDay] = useState<HistoryDay | null>(null)
  const [failed, setFailed] = useState(false)
  const [classroom, setClassroom] = useState(false)
  const [people, setPeople] = useState(false)

  useEffect(() => setToday(kstToday()), [])

  useEffect(() => {
    if (!current) return
    let alive = true
    setFailed(false)
    loadDay(current)
      .then((d) => alive && setDay(d))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [current])

  function go(next: string) {
    setClassroom(false)
    setPeople(false)
    if (onDateChange) onDateChange(next)
    else setOwn(next)
  }

  const isToday = !!current && current === today
  const others = day ? day.born.length + day.died.length : 0

  return (
    <section className="card overflow-hidden border-amber-200 shadow-sm" aria-labelledby="math-history-title">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-white px-4 py-2.5 sm:px-5">
        <h2 id="math-history-title" className="font-bold text-slate-900">
          📜 {isToday ? '오늘의 수학사' : '이날의 수학사'}
        </h2>
        {current && (
          <span className="flex items-center gap-0.5 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => go(shiftDay(current, -1))}
              className="rounded px-1.5 py-0.5 hover:bg-amber-100 hover:text-slate-800"
              aria-label="하루 전"
              title="하루 전"
            >
              ‹
            </button>
            <span className="min-w-[4.5rem] text-center font-semibold text-slate-600">
              {isToday ? todayLabel() : dayLabel(current)}
            </span>
            <button
              type="button"
              onClick={() => go(shiftDay(current, 1))}
              className="rounded px-1.5 py-0.5 hover:bg-amber-100 hover:text-slate-800"
              aria-label="하루 뒤"
              title="하루 뒤"
            >
              ›
            </button>
            {!isToday && today && (
              <button type="button" onClick={() => go(today)} className="ml-1 rounded px-1.5 py-0.5 font-semibold text-amber-700 hover:bg-amber-100">
                오늘로
              </button>
            )}
          </span>
        )}
        {day && (
          <span className="ml-auto flex items-center gap-1.5">
            <span className="badge bg-amber-100 text-amber-800">{day.life}</span>
            <span className="badge">{day.unit}</span>
          </span>
        )}
        {!isHistoryPage && (
          <Link href="/history" className={`whitespace-nowrap text-xs font-semibold text-amber-700 hover:underline ${day ? '' : 'ml-auto'}`}>
            전체 보기 →
          </Link>
        )}
      </div>

      <div className="px-4 py-4 sm:px-5">
        {failed ? (
          <p className="py-4 text-center text-sm text-slate-500">
            수학사 자료를 불러오지 못했어요.{' '}
            <button type="button" className="font-semibold text-amber-700 underline" onClick={() => current && go(current)}>
              다시 시도
            </button>
          </p>
        ) : !day ? (
          <div className="h-24 animate-pulse rounded-lg bg-slate-100" aria-hidden />
        ) : (
          <>
            {day.event && (
              <p className="mb-3 rounded-lg bg-amber-50/70 px-3 py-2 text-sm text-amber-900">
                <span className="mr-1">📅</span>
                {day.event}
              </p>
            )}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-amber-50 p-1.5 text-amber-700 sm:h-20 sm:w-20">
                <HistoryArt name={day.art} className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-amber-700">
                  {day.year}년 {isToday ? '오늘' : '이날'} {day.kind === 'born' ? '태어났어요' : '세상을 떠났어요'}
                </p>
                <h3 className="mt-0.5 text-lg font-bold leading-snug text-slate-900">{day.title}</h3>
                <p className="mt-0.5 truncate text-sm text-slate-500">
                  {day.nameKo} <span className="text-slate-400">({day.name})</span>
                </p>
              </div>
            </div>
            <div className="mt-3 text-[15px] leading-relaxed text-slate-700">
              <Markdown>{day.body}</Markdown>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <button type="button" className="btn-secondary btn-sm" onClick={() => setClassroom((v) => !v)} aria-expanded={classroom}>
                🏫 수업에서 이렇게 {classroom ? '닫기' : '보기'}
              </button>
              {others > 1 && (
                <button type="button" className="btn-ghost btn-sm" onClick={() => setPeople((v) => !v)} aria-expanded={people}>
                  👥 이날의 수학자 {others}명
                </button>
              )}
              <a href={bioUrl(day.slug)} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm">
                📖 전기 원문 ↗
              </a>
              {isApproved ? (
                <Link
                  href={`/board/new?category=${encodeURIComponent('수업 나눔')}&title=${encodeURIComponent(`[수학사] ${day.nameKo} — ${day.title}`)}`}
                  className="ml-auto font-semibold text-amber-700 hover:underline"
                >
                  💬 수업에서 써 본 이야기 나누기 →
                </Link>
              ) : null}
            </div>

            {classroom && (
              <div className="mt-3 rounded-lg bg-amber-50/60 px-4 py-3 text-sm text-slate-700">
                <b className="text-slate-900">수업에서 이렇게</b>
                <Markdown small>{day.classroom}</Markdown>
              </div>
            )}

            {people && (
              <div className="mt-3 grid gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm sm:grid-cols-2">
                <PeopleList label="이날 태어난 수학자" list={day.born} />
                <PeopleList label="이날 세상을 떠난 수학자" list={day.died} />
              </div>
            )}

            <p className="mt-4 border-t border-slate-100 pt-2 text-[11px] leading-relaxed text-slate-400">
              출처:{' '}
              <a href={dayUrl(day.date)} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600">
                MacTutor History of Mathematics
              </a>{' '}
              (<a href={MACTUTOR} target="_blank" rel="noopener noreferrer" className="hover:text-slate-600">University of St Andrews</a>) ·
              우리말 요약 ·{' '}
              <a href={MACTUTOR_LICENSE} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600">
                CC BY-SA 4.0
              </a>
            </p>
          </>
        )}
      </div>
    </section>
  )
}

function PeopleList({ label, list }: { label: string; list: DayPerson[] }) {
  if (list.length === 0) return null
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <ul className="mt-1 space-y-0.5">
        {list.map((p) => (
          <li key={p.slug} className="flex gap-2">
            <span className="w-14 shrink-0 text-right tabular-nums text-slate-400">{p.year}</span>
            <a href={bioUrl(p.slug)} target="_blank" rel="noopener noreferrer" className="min-w-0 truncate text-slate-700 hover:text-amber-700 hover:underline">
              {p.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
