'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { randomStory, storyOfDay, type HistoryStory } from '@/lib/math-history'
import { useAuth } from './AuthProvider'
import { Markdown } from './Markdown'

const dateFmt = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })

/**
 * 첫 화면의 "오늘의 수학사" — 날마다 수학 역사 이야기 한 편과 수업에서 쓰는 법.
 * (학생용 오늘의 문제는 오른쪽 ShrekMath 패널에 있다)
 */
export function MathHistory() {
  const { isApproved } = useAuth()
  // 날짜로 고르는 이야기는 서버와 브라우저가 다를 수 있어서, 화면이 뜬 뒤에 정한다
  const [story, setStory] = useState<HistoryStory | null>(null)
  const [isToday, setIsToday] = useState(true)
  const [classroom, setClassroom] = useState(false)

  useEffect(() => {
    setStory(storyOfDay())
  }, [])

  function show(s: HistoryStory, today: boolean) {
    setStory(s)
    setIsToday(today)
    setClassroom(false)
  }

  return (
    <section className="card overflow-hidden border-amber-200 shadow-sm" aria-labelledby="math-history-title">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-white px-4 py-3 sm:px-5">
        <h2 id="math-history-title" className="font-bold text-slate-900">
          {isToday ? '📜 오늘의 수학사' : '📜 다른 이야기'}
        </h2>
        {story && isToday && <span className="text-xs text-slate-500">{dateFmt.format(new Date())}</span>}
        {story && (
          <span className="ml-auto flex items-center gap-1.5">
            <span className="badge bg-amber-100 text-amber-800">{story.era}</span>
            <span className="badge">{story.unit}</span>
          </span>
        )}
      </div>

      <div className="px-4 py-4 sm:px-5">
        {!story ? (
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" aria-hidden />
        ) : (
          <>
            <h3 className="text-lg font-bold text-slate-900">{story.title}</h3>
            <div className="mt-2 text-[15px] leading-relaxed text-slate-700">
              <Markdown>{story.body}</Markdown>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => setClassroom((v) => !v)}
                aria-expanded={classroom}
              >
                🏫 수업에서 이렇게 {classroom ? '닫기' : '보기'}
              </button>
              <button type="button" className="btn-ghost btn-sm" onClick={() => show(randomStory(story.id), false)}>
                🎲 다른 이야기
              </button>
              {!isToday && (
                <button type="button" className="btn-ghost btn-sm" onClick={() => show(storyOfDay(), true)}>
                  오늘의 이야기로
                </button>
              )}
              {isApproved ? (
                <Link
                  href={`/board/new?category=${encodeURIComponent('수업 나눔')}&title=${encodeURIComponent(`[수학사] ${story.title}`)}`}
                  className="ml-auto font-semibold text-amber-700 hover:underline"
                >
                  💬 수업에서 써 본 이야기 나누기 →
                </Link>
              ) : (
                <span className="ml-auto text-xs text-slate-500">선생님으로 가입하면 수업 활용 경험을 나눌 수 있어요</span>
              )}
            </div>

            {classroom && (
              <div className="mt-3 rounded-lg bg-amber-50/60 px-4 py-3 text-sm text-slate-700">
                <b className="text-slate-900">수업에서 이렇게</b>
                <Markdown small>{story.classroom}</Markdown>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
