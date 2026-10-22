'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { HistoryArt } from '@/components/HistoryArt'
import { Markdown } from '@/components/Markdown'
import { MathHistory } from '@/components/MathHistory'
import { Empty, Spinner } from '@/components/ui'
import { STORIES, type HistoryStory } from '@/lib/math-history'

/** 학교급 칩. unit 문자열의 앞부분으로 가른다 ('중1 ', '중2 ', '중3 ', '고 ', 나머지는 공통) */
const LEVELS = ['전체', '중1', '중2', '중3', '고', '공통'] as const
type Level = (typeof LEVELS)[number]

function levelOf(unit: string): Level {
  for (const l of ['중1', '중2', '중3', '고'] as const) if (unit.startsWith(l + ' ')) return l
  return '공통'
}

function isLevel(v: string | null): v is Level {
  return LEVELS.includes(v as Level)
}

export default function HistoryPage() {
  return (
    <div>
      <h1 className="page-title">📜 오늘의 수학사</h1>
      <p className="mt-1 text-sm text-slate-500">
        날마다 한 편씩 보여 주는 수학 역사 이야기 {STORIES.length}편을 모았어요. 수업에서 꺼내 쓰는 방법도 함께 있어요.
      </p>

      <div className="mt-5">
        <MathHistory />
      </div>

      <Suspense fallback={<Spinner />}>
        <StoryList />
      </Suspense>
    </div>
  )
}

/** 42편 전체 목록 + 학교급 칩 + 검색 (검색어는 ?q= 로 공유) */
function StoryList() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const q = params.get('q') ?? ''
  const levelParam = params.get('level')
  const level: Level = isLevel(levelParam) ? levelParam : '전체'
  const [text, setText] = useState(q)
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    setText(q)
  }, [q])

  // 입력을 멈춘 뒤 잠깐 있다가 URL 에 반영 (뒤로 가기 기록은 남기지 않음)
  useEffect(() => {
    if (text.trim() === q) return
    const t = setTimeout(() => setParam('q', text.trim()), 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  function setParam(key: 'q' | 'level', value: string) {
    const next = new URLSearchParams(params.toString())
    if (value && value !== '전체') next.set(key, value)
    else next.delete(key)
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const words = q.toLowerCase().split(/\s+/).filter(Boolean)
  const filtered = useMemo(
    () =>
      STORIES.filter((s) => {
        if (level !== '전체' && levelOf(s.unit) !== level) return false
        if (!words.length) return true
        const hay = `${s.title} ${s.unit} ${s.era} ${s.body} ${s.classroom}`.toLowerCase()
        return words.every((w) => hay.includes(w))
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level, q],
  )

  const counts = useMemo(() => {
    const c: Record<Level, number> = { 전체: STORIES.length, 중1: 0, 중2: 0, 중3: 0, 고: 0, 공통: 0 }
    for (const s of STORIES) c[levelOf(s.unit)]++
    return c
  }, [])

  return (
    <section className="mt-8" aria-labelledby="history-all-title">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <h2 id="history-all-title" className="text-lg font-bold text-slate-900">
          이야기 모아 보기
          <span className="ml-2 text-sm font-normal text-slate-500">
            {filtered.length === STORIES.length ? `${STORIES.length}편` : `${filtered.length} / ${STORIES.length}편`}
          </span>
        </h2>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="scrollbar-none -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="학교급">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              className={`chip shrink-0 ${level === l ? 'chip-on' : ''}`}
              aria-pressed={level === l}
              onClick={() => setParam('level', l)}
            >
              {l}
              <span className={`ml-1 text-xs ${level === l ? 'text-white/80' : 'text-slate-400'}`}>{counts[l]}</span>
            </button>
          ))}
        </div>
        <form
          className="relative sm:ml-auto sm:w-64"
          onSubmit={(e) => {
            e.preventDefault()
            setParam('q', text.trim())
          }}
          role="search"
        >
          <input
            type="search"
            className="input pr-8"
            placeholder="제목·단원·본문에서 찾기"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="이야기 찾기"
          />
          {text && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1 text-slate-400 hover:text-slate-700"
              onClick={() => {
                setText('')
                setParam('q', '')
              }}
              aria-label="검색어 지우기"
            >
              ✕
            </button>
          )}
        </form>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4">
          <Empty
            action={
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => {
                  setText('')
                  router.replace(pathname, { scroll: false })
                }}
              >
                필터 지우기
              </button>
            }
          >
            맞는 이야기가 없어요. 다른 낱말로 찾아보세요.
          </Empty>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {filtered.map((s) => (
            <StoryCard key={s.id} story={s} open={open === s.id} onToggle={() => setOpen(open === s.id ? null : s.id)} />
          ))}
        </ul>
      )}
    </section>
  )
}

function StoryCard({ story, open, onToggle }: { story: HistoryStory; open: boolean; onToggle: () => void }) {
  const bodyId = `history-story-${story.id}`
  return (
    <li className={`card overflow-hidden transition ${open ? 'border-amber-300 shadow-sm' : 'hover:border-amber-200'}`}>
      <button
        type="button"
        className="flex w-full items-center gap-3 px-3 py-3 text-left sm:px-4"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={bodyId}
      >
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-amber-50 p-1.5 text-amber-700">
          <HistoryArt name={story.art} className="h-full w-full" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold text-slate-900">{story.title}</span>
          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="badge bg-amber-100 text-amber-800">{story.era}</span>
            <span className="badge">{story.unit}</span>
          </span>
        </span>
        <span className={`shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div id={bodyId} className="border-t border-amber-100 px-3 pb-4 pt-3 sm:px-4">
          <div className="text-[15px] leading-relaxed text-slate-700">
            <Markdown>{story.body}</Markdown>
          </div>
          <div className="mt-3 rounded-lg bg-amber-50/60 px-4 py-3 text-sm text-slate-700">
            <b className="text-slate-900">🏫 수업에서 이렇게</b>
            <Markdown small>{story.classroom}</Markdown>
          </div>
        </div>
      )}
    </li>
  )
}
