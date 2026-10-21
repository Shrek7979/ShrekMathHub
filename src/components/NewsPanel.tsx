'use client'

import { useEffect, useState } from 'react'
import { SITE } from '@/lib/site'
import { useMediaQuery } from '@/lib/useMediaQuery'

const NEWS_URL = SITE.newsUrl
const STORAGE_KEY = 'smh-news-panel'

/**
 * 화면 한쪽에 늘 떠 있는 Shrek Edu Insight(수학 뉴스).
 * 넓은 화면: 왼쪽에 붙어 있는 패널(접기 가능). 좁은 화면: 오른쪽 아래 버튼 → 아래에서 올라오는 창.
 * 레이아웃에 들어 있어서 화면을 옮겨도 다시 불러오지 않는다.
 */
export function NewsPanel() {
  const wide = useMediaQuery('(min-width: 1024px)')
  const [open, setOpen] = useState(true)
  const [sheet, setSheet] = useState(false)

  useEffect(() => {
    if (!sheet) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheet(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sheet])

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

  if (wide === null) return null

  if (wide) {
    if (!open)
      return (
        <button
          onClick={() => remember(true)}
          className="fixed left-0 top-1/2 z-30 -translate-y-1/2 rounded-r-xl border border-l-0 border-slate-200 bg-white px-2 py-4 text-sm font-semibold text-slate-700 shadow-md hover:bg-slate-50 [writing-mode:vertical-rl]"
        >
          📰 수학 뉴스 펼치기
        </button>
      )
    return (
      <aside className="sticky top-[57px] flex h-[calc(100vh-57px)] w-[340px] shrink-0 flex-col self-start border-r border-slate-200 bg-white xl:w-[400px] 2xl:w-[420px]">
        <PanelHeader onClose={() => remember(false)} closeLabel="‹ 접기" />
        <NewsFrame />
      </aside>
    )
  }

  return (
    <>
      <button
        onClick={() => setSheet(true)}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-slate-800"
      >
        📰 수학 뉴스
      </button>
      {sheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40" onClick={() => setSheet(false)} role="dialog" aria-modal="true" aria-label="수학 뉴스">
          <div className="flex h-[85vh] flex-col overflow-hidden rounded-t-2xl bg-white" onClick={(e) => e.stopPropagation()}>
            <PanelHeader onClose={() => setSheet(false)} closeLabel="닫기 ✕" />
            <NewsFrame />
          </div>
        </div>
      )}
    </>
  )
}

function PanelHeader({ onClose, closeLabel }: { onClose: () => void; closeLabel: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2">
      <span className="text-lg leading-none">📰</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-900">Shrek Edu Insight</p>
        <p className="text-[11px] text-slate-500">오늘의 수학, 수업이 되는 뉴스</p>
      </div>
      <a
        href={NEWS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      >
        새 창 ↗
      </a>
      <button onClick={onClose} className="rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100">
        {closeLabel}
      </button>
    </div>
  )
}

function NewsFrame() {
  return (
    <iframe
      src={NEWS_URL}
      title="Shrek Edu Insight 수학 뉴스"
      // 뉴스 사이트가 이 화면 전체를 다른 곳으로 바꾸지 못하게 (새 창 열기·스크립트는 허용)
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
      className="w-full flex-1 border-0"
    />
  )
}

