'use client'

import { useEffect, useState } from 'react'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { DailyProblem } from './DailyProblem'

const STORAGE_KEY = 'smh-problem-panel'

/**
 * 아주 넓은 화면(1536px 이상)에서 오른쪽에 늘 떠 있는 "오늘의 수학 문제" 패널 (접기 가능).
 * 그보다 좁은 화면에서는 첫 화면 본문 안에 같은 카드가 나온다 (page.tsx 의 2xl:hidden).
 */
export function ProblemPanel() {
  const wide = useMediaQuery('(min-width: 1536px)')
  const [open, setOpen] = useState(true)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'closed') setOpen(false)
    } catch {}
  }, [])

  function remember(next: boolean) {
    setOpen(next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'open' : 'closed')
    } catch {}
  }

  if (!wide) return null
  if (!open)
    return (
      <button
        onClick={() => remember(true)}
        className="fixed right-0 top-1/2 z-30 -translate-y-1/2 rounded-l-xl border border-r-0 border-brand-200 bg-white px-2 py-4 text-sm font-semibold text-brand-700 shadow-md hover:bg-brand-50 [writing-mode:vertical-rl]"
      >
        🧩 오늘의 문제 펼치기
      </button>
    )
  return (
    <aside className="sticky top-[57px] flex h-[calc(100vh-57px)] w-[400px] shrink-0 flex-col self-start overflow-y-auto border-l border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-xs text-slate-500">수업 시작 5분, 학생들과 함께 풀어 보세요</p>
        <button onClick={() => remember(false)} className="rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200">
          접기 ›
        </button>
      </div>
      <DailyProblem />
    </aside>
  )
}
