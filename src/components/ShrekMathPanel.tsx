'use client'

import { useEffect, useState } from 'react'
import { SITE } from '@/lib/site'
import { useMediaQuery } from '@/lib/useMediaQuery'

const STORAGE_KEY = 'smh-shrekmath-panel'
const TAB_KEY = 'smh-right-panel-tab'

const TABS = [
  {
    key: 'game',
    icon: '🎮',
    label: '수학 게임',
    desc: '한 판 1분! 쉽고 짧은 중고등 수학 게임',
    url: SITE.gameUrl,
    title: 'ShrekMath Game 수학 게임',
  },
  {
    key: 'daily',
    icon: '🎓',
    label: '오늘의 문제',
    desc: '학생용 오늘의 문제 · 풀이 사진 올리면 AI 첨삭',
    url: SITE.shrekMathUrl,
    title: 'ShrekMath 학생용 오늘의 문제',
  },
]

/**
 * 아주 넓은 화면(1536px 이상): 오른쪽에 늘 떠 있는 패널 (접기 가능).
 * 그보다 좁은 가로 화면(휴대폰 가로 모드, 노트북): 오른쪽 아래 "수학 게임" 버튼 → 오른쪽에서 나오는 창.
 * 세로 화면에서는 보이지 않는다.
 * 탭으로 ShrekMath Game 과 학생용 "오늘의 문제" 사이트 ShrekMath 를 오간다.
 * ShrekMath 쪽 next.config.mjs 의 frame-ancestors 에 이 허브 주소가 허용되어 있어야 보인다.
 */
export function ShrekMathPanel() {
  const wide = useMediaQuery('(min-width: 1536px)')
  const landscape = useMediaQuery('(orientation: landscape)')
  const [open, setOpen] = useState(true)
  const [sheet, setSheet] = useState(false)
  // 창을 처음 열기 전에는 게임을 불러오지 않고, 연 뒤에는 닫아도 그대로 둔다
  const [sheetUsed, setSheetUsed] = useState(false)
  const [tab, setTab] = useState<string | null>(null)
  // 한 번 연 탭은 그대로 두어, 탭을 오가도 게임이나 풀이가 처음으로 돌아가지 않게 한다
  const [seen, setSeen] = useState<string[]>([])

  useEffect(() => {
    let first = TABS[0].key
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'closed') setOpen(false)
      const saved = localStorage.getItem(TAB_KEY)
      if (TABS.some((t) => t.key === saved)) first = saved as string
    } catch {}
    setTab(first)
    setSeen([first])
  }, [])

  useEffect(() => {
    if (!sheet) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheet(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sheet])

  function remember(next: boolean) {
    setOpen(next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'open' : 'closed')
    } catch {}
  }

  function pick(key: string) {
    setTab(key)
    setSeen((s) => (s.includes(key) ? s : [...s, key]))
    try {
      localStorage.setItem(TAB_KEY, key)
    } catch {}
  }

  if (wide === null) return null
  const current = TABS.find((t) => t.key === tab) ?? TABS[0]
  const body = (onClose: () => void, closeLabel: string) => (
    <>
      <div className="flex items-center gap-1 border-b border-slate-200 px-2 pt-2">
        <div role="tablist" aria-label="오른쪽 패널" className="flex min-w-0 flex-1 gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={t.key === current.key}
              onClick={() => pick(t.key)}
              className={`-mb-px whitespace-nowrap rounded-t-lg border-b-2 px-2.5 py-1.5 text-sm font-bold ${
                t.key === current.key
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <a
          href={current.url}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          새 창 ↗
        </a>
        <button onClick={onClose} className="whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100">
          {closeLabel}
        </button>
      </div>
      <p className="truncate border-b border-slate-200 px-3 py-1 text-[11px] text-slate-500">{current.desc}</p>
      {TABS.filter((t) => seen.includes(t.key)).map((t) => (
        <iframe
          key={t.key}
          src={t.url}
          title={t.title}
          // 로그인·풀이 사진 올리기가 되어야 하므로 스크립트·폼·카메라 허용, 이 화면 전체를 바꾸는 것은 막음
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-downloads"
          allow="camera"
          className={`w-full flex-1 border-0 ${t.key === current.key ? '' : 'hidden'}`}
        />
      ))}
    </>
  )

  if (wide) {
    if (!open)
      return (
        <button
          onClick={() => remember(true)}
          className="fixed right-0 top-1/2 z-30 -translate-y-1/2 rounded-l-xl border border-r-0 border-brand-200 bg-white px-2 py-4 text-sm font-semibold text-brand-700 shadow-md hover:bg-brand-50 [writing-mode:vertical-rl]"
        >
          🎮 수학 게임 · 오늘의 문제 펼치기
        </button>
      )
    return (
      <aside className="sticky top-[61px] flex h-[calc(100vh-61px)] w-[360px] shrink-0 flex-col self-start border-l border-slate-200 bg-white 2xl:w-[378px]">
        {body(() => remember(false), '접기 ›')}
      </aside>
    )
  }

  return (
    <>
      {landscape && (
        <button
          onClick={() => {
            setSheet(true)
            setSheetUsed(true)
          }}
          // 1024px 미만에서는 오른쪽 아래 "수학 뉴스" 버튼이 있어 그 왼쪽에 둔다
          className="fixed bottom-4 right-[8rem] z-40 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:brightness-110 lg:right-4"
        >
          🎮 수학 게임
        </button>
      )}
      {sheetUsed && (
        <div
          className={`fixed inset-0 z-50 justify-end bg-slate-900/40 ${sheet ? 'flex' : 'hidden'}`}
          onClick={() => setSheet(false)}
          role="dialog"
          aria-modal="true"
          aria-label="수학 게임"
        >
          <div className="flex h-full w-[min(420px,92vw)] flex-col overflow-hidden bg-white" onClick={(e) => e.stopPropagation()}>
            {body(() => setSheet(false), '닫기 ✕')}
          </div>
        </div>
      )}
    </>
  )
}
