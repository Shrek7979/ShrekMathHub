'use client'

import { useEffect, useState } from 'react'
import { SITE } from '@/lib/site'
import { useMediaQuery } from '@/lib/useMediaQuery'

const STORAGE_KEY = 'smh-shrekmath-panel'

/**
 * 아주 넓은 화면(1536px 이상)에서 오른쪽에 늘 떠 있는 학생용 "오늘의 문제" 사이트 ShrekMath (접기 가능).
 * ShrekMath 쪽 next.config.mjs 의 frame-ancestors 에 이 허브 주소가 허용되어 있어야 보인다.
 */
export function ShrekMathPanel() {
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
        🎓 ShrekMath 펼치기
      </button>
    )
  return (
    <aside className="sticky top-[57px] flex h-[calc(100vh-57px)] w-[400px] shrink-0 flex-col self-start border-l border-slate-200 bg-white 2xl:w-[420px]">
      <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2">
        <span className="text-lg leading-none">🎓</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">ShrekMath</p>
          <p className="text-[11px] text-slate-500">학생용 오늘의 문제 · 풀이 사진 올리면 AI 첨삭</p>
        </div>
        <a
          href={SITE.shrekMathUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          새 창 ↗
        </a>
        <button onClick={() => remember(false)} className="rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100">
          접기 ›
        </button>
      </div>
      <iframe
        src={SITE.shrekMathUrl}
        title="ShrekMath 학생용 오늘의 문제"
        // 로그인·풀이 사진 올리기가 되어야 하므로 스크립트·폼·카메라 허용, 이 화면 전체를 바꾸는 것은 막음
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-downloads"
        allow="camera"
        className="w-full flex-1 border-0"
      />
    </aside>
  )
}
