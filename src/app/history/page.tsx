'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { HistoryArt } from '@/components/HistoryArt'
import { Markdown } from '@/components/Markdown'
import { MathHistory } from '@/components/MathHistory'
import { Empty, Spinner } from '@/components/ui'
import { MACTUTOR, MONTHS, dayLabel, kstToday, loadAll, loadMonth, type HistoryDay } from '@/lib/history-days'
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

/** URL 쿼리 여러 개를 한 번에 바꾼다 (뒤로 가기 기록은 남기지 않음) */
function useSetParams() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  return (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (v && v !== '전체') next.set(k, v)
      else next.delete(k)
    }
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }
}

export default function HistoryPage() {
  return (
    <div>
      <h1 className="page-title">📜 오늘의 수학사</h1>
      <p className="mt-1 text-sm text-slate-500">
        1년 366일, 그날 태어났거나 세상을 떠난 수학자와 그날의 사건을 우리말로 정리했어요. 자료는{' '}
        <a href={MACTUTOR} target="_blank" rel="noopener noreferrer" className="font-semibold text-amber-700 hover:underline">
          MacTutor History of Mathematics
        </a>
        (St Andrews 대학)를 바탕으로 했어요.
      </p>
      <Suspense fallback={<Spinner />}>
        <HistoryTabs />
      </Suspense>
    </div>
  )
}

function HistoryTabs() {
  const params = useSearchParams()
  const setParams = useSetParams()
  const tab = params.get('tab') === 'topics' ? 'topics' : 'days'
  const d = params.get('d')
  const date = d && /^\d\d-\d\d$/.test(d) ? d : undefined

  return (
    <>
      <div className="mt-5">
        <MathHistory date={date} onDateChange={(next) => setParams({ d: next === kstToday() ? '' : next })} />
      </div>

      <div className="mt-8 flex gap-1 border-b border-slate-200" role="tablist">
        {(
          [
            ['days', '날짜별 366일'],
            ['topics', `주제별 이야기 ${STORIES.length}편`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setParams({ tab: key === 'topics' ? 'topics' : '', q: '', level: '', m: '' })}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
              tab === key ? 'border-amber-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'days' ? <DayList current={date} /> : <StoryList />}
    </>
  )
}

/** 날짜별: 달 칩 + 그 달의 날짜 목록, 찾기는 열두 달 전체에서 */
function DayList({ current }: { current?: string }) {
  const params = useSearchParams()
  const setParams = useSetParams()
  const q = params.get('q') ?? ''
  const mParam = params.get('m')
  const [month, setMonth] = useState<string | null>(null)
  const [text, setText] = useState(q)
  const [list, setList] = useState<HistoryDay[] | null>(null)
  const [failed, setFailed] = useState(false)

  // 처음 보이는 달: ?m= → 보고 있는 날짜의 달 → 이번 달
  useEffect(() => {
    setMonth(mParam && MONTHS.includes(mParam) ? mParam : (current ?? kstToday()).slice(0, 2))
  }, [mParam, current])

  useEffect(() => setText(q), [q])
  useEffect(() => {
    if (text.trim() === q) return
    const t = setTimeout(() => setParams({ q: text.trim() }), 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  const words = q.toLowerCase().split(/\s+/).filter(Boolean)
  useEffect(() => {
    if (!month) return
    let alive = true
    setList(null)
    setFailed(false)
    const load = words.length ? loadAll() : loadMonth(month)
    load.then((l) => alive && setList(l)).catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, q])

  const shown = useMemo(() => {
    if (!list) return null
    if (!words.length) return list
    return list.filter((d) => {
      const hay = `${d.nameKo} ${d.name} ${d.title} ${d.body} ${d.unit} ${d.event} ${d.classroom}`.toLowerCase()
      return words.every((w) => hay.includes(w))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, q])

  return (
    <section className="mt-4" aria-label="날짜별 수학사">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div
          className={`scrollbar-none -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0 ${words.length ? 'opacity-40' : ''}`}
          role="group"
          aria-label="달"
        >
          {MONTHS.map((m) => (
            <button
              key={m}
              type="button"
              className={`chip shrink-0 px-2.5 ${month === m && !words.length ? 'chip-on' : ''}`}
              aria-pressed={month === m}
              onClick={() => setParams({ m, q: '' })}
            >
              {Number(m)}월
            </button>
          ))}
        </div>
        <SearchBox text={text} setText={setText} onClear={() => setParams({ q: '' })} placeholder="수학자·업적·단원 찾기 (예: 확률, 뇌터)" />
      </div>

      {failed ? (
        <p className="mt-6 text-center text-sm text-slate-500">자료를 불러오지 못했어요. 인터넷 연결을 확인해 주세요.</p>
      ) : !shown ? (
        <Spinner />
      ) : shown.length === 0 ? (
        <div className="mt-4">
          <Empty>맞는 수학자가 없어요. 다른 낱말로 찾아보세요.</Empty>
        </div>
      ) : (
        <ul className="card mt-4 divide-y divide-slate-100 overflow-hidden">
          {shown.map((d) => (
            <li key={d.date}>
              <button
                type="button"
                onClick={() => {
                  setParams({ d: d.date === kstToday() ? '' : d.date })
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-amber-50/60 sm:px-4 ${
                  current === d.date ? 'bg-amber-50' : ''
                }`}
              >
                <span className="w-16 shrink-0 text-xs font-semibold tabular-nums text-slate-500">{dayLabel(d.date)}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 p-1 text-amber-700">
                  <HistoryArt name={d.art} className="h-full w-full" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900">{d.title}</span>
                  <span className="block truncate text-xs text-slate-500">
                    {d.kind === 'born' ? '🎂 탄생' : '별세'} · {d.nameKo} · {d.life}
                    {d.event && ' · 📅 이날의 사건'}
                  </span>
                </span>
                <span className="hidden shrink-0 sm:inline">
                  <span className="badge">{d.unit}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function SearchBox({
  text,
  setText,
  onClear,
  placeholder,
}: {
  text: string
  setText: (v: string) => void
  onClear: () => void
  placeholder: string
}) {
  return (
    <form className="relative sm:ml-auto sm:w-72" onSubmit={(e) => e.preventDefault()} role="search">
      <input type="search" className="input pr-8" placeholder={placeholder} value={text} onChange={(e) => setText(e.target.value)} aria-label="찾기" />
      {text && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1 text-slate-400 hover:text-slate-700"
          onClick={() => {
            setText('')
            onClear()
          }}
          aria-label="검색어 지우기"
        >
          ✕
        </button>
      )}
    </form>
  )
}

/** 주제별 이야기 42편 + 학교급 칩 + 검색 (검색어는 ?q= 로 공유) */
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
    <section className="mt-4" aria-labelledby="history-all-title">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <h2 id="history-all-title" className="text-sm text-slate-500">
          수업 주제별로 고른 수학사 이야기예요. 이야기마다 "수업에서 이렇게"가 있어요.
          <span className="ml-2 font-semibold text-slate-700">
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
