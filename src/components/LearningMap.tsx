'use client'

import Link from 'next/link'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { EDGES, NODES, STAGES, STRANDS, nextOf, nodeOf, pathOf, prereqsOf, type MapNode } from '@/lib/learning-map'

type Box = { x: number; y: number; w: number; h: number }

/** 시기(열)마다 색: 중학교 · 고1 공통 · 일반 선택 · 진로 선택 */
const STAGE_TONE: Record<string, { head: string; chip: string; count: string; ring: string }> = {
  m: { head: 'bg-brand-600 text-white', chip: 'border-brand-200 bg-brand-50 text-brand-900', count: 'bg-brand-600', ring: 'ring-brand-500' },
  h1: { head: 'bg-sky-600 text-white', chip: 'border-sky-200 bg-sky-50 text-sky-900', count: 'bg-sky-600', ring: 'ring-sky-500' },
  h2: { head: 'bg-violet-600 text-white', chip: 'border-violet-200 bg-violet-50 text-violet-900', count: 'bg-violet-600', ring: 'ring-violet-500' },
  h3: { head: 'bg-amber-500 text-white', chip: 'border-amber-200 bg-amber-50 text-amber-900', count: 'bg-amber-500', ring: 'ring-amber-500' },
}
const toneOf = (stage: string) => STAGE_TONE[stage.startsWith('m') ? 'm' : stage]

const GRID = 'grid grid-cols-[76px_repeat(6,minmax(0,1fr))] gap-x-9'

export const countKey = (level: string, subject: string, unit: string) => `${level}|${subject}|${unit}`

const resourcesHref = (x: MapNode) =>
  `/resources?level=${x.level}&subject=${encodeURIComponent(x.subject)}&unit=${encodeURIComponent(x.unit)}`

/**
 * 학습맵: 가로는 배우는 시기(중1 → 진로 선택), 세로는 영역.
 * 단원을 누르면 그 단원으로 이어지는 앞뒤 단원이 모두 밝게 보이고, 아래에 자세한 내용이 나온다.
 */
export function LearningMap({ counts }: { counts: Map<string, number> }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const chipRefs = useRef(new Map<string, HTMLButtonElement>())
  const [boxes, setBoxes] = useState<Map<string, Box>>(new Map())
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [hover, setHover] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [full, setFull] = useState(false)

  const countOf = useCallback((x: MapNode) => counts.get(countKey(x.level, x.subject, x.unit)) ?? 0, [counts])

  // 단원 상자의 자리를 재서 선을 그린다 (창 크기·글꼴이 바뀌면 다시)
  const measure = useCallback(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const base = wrap.getBoundingClientRect()
    const next = new Map<string, Box>()
    chipRefs.current.forEach((el, id) => {
      const r = el.getBoundingClientRect()
      next.set(id, { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height })
    })
    setBoxes(next)
    setSize({ w: wrap.scrollWidth, h: wrap.scrollHeight })
  }, [])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (wrapRef.current) ro.observe(wrapRef.current)
    document.fonts?.ready.then(measure).catch(() => {})
    return () => ro.disconnect()
  }, [measure, full])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (full) setFull(false)
      else setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [full])

  const active = hover ?? selected
  const path = useMemo(() => (active ? pathOf(active) : null), [active])
  const lit = (id: string) => !path || id === active || path.before.has(id) || path.after.has(id)
  const edgeLit = (a: string, b: string) => {
    if (!path || !active) return false
    const back = (x: string) => x === active || path.before.has(x)
    const fwd = (x: string) => x === active || path.after.has(x)
    return (back(a) && back(b)) || (fwd(a) && fwd(b))
  }

  const stageIndex = useMemo(() => new Map(STAGES.map((s, i) => [s.id, i])), [])

  function edgePath(a: string, b: string) {
    const s = boxes.get(a)
    const t = boxes.get(b)
    if (!s || !t) return ''
    const sy = s.y + s.h / 2
    const ty = t.y + t.h / 2
    if (stageIndex.get(nodeOf(a).stage) === stageIndex.get(nodeOf(b).stage)) {
      // 같은 시기 안: 오른쪽으로 둥글게
      const sx = s.x + s.w
      const tx = t.x + t.w
      const bulge = 12 + Math.min(22, Math.abs(ty - sy) * 0.12)
      return `M${sx},${sy} C${sx + bulge},${sy} ${tx + bulge},${ty} ${tx + 2},${ty}`
    }
    const sx = s.x + s.w
    const tx = t.x
    const dx = Math.max(24, (tx - sx) / 2)
    return `M${sx},${sy} C${sx + dx},${sy} ${tx - dx},${ty} ${tx - 2},${ty}`
  }

  const total = NODES.reduce((s, x) => s + countOf(x), 0)
  const covered = NODES.filter((x) => countOf(x) > 0).length
  const sel = selected ? nodeOf(selected) : null

  return (
    <div className={full ? 'fixed inset-0 z-50 overflow-auto bg-white p-4 sm:p-6' : ''}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          단원 {NODES.length}개 중 <b className="text-slate-900">{covered}개</b>에 자료가 있어요 (단원을 정해 올린 자료 {total}개).
          <span className="hidden sm:inline"> 단원을 누르면 먼저 배우는 단원과 이어지는 단원이 함께 밝아져요.</span>
        </p>
        <div className="flex items-center gap-2">
          {selected && (
            <button className="btn-ghost btn-sm" onClick={() => setSelected(null)}>
              선택 해제
            </button>
          )}
          <button className="btn-secondary btn-sm" onClick={() => setFull((f) => !f)}>
            {full ? '닫기 (Esc)' : '⛶ 크게 보기'}
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-400 lg:hidden">← 옆으로 밀어서 전체를 볼 수 있어요 →</p>

      <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <div ref={wrapRef} className="relative min-w-[1040px] p-3" onMouseLeave={() => setHover(null)}>
          {/* 선 (단원 상자 뒤에) */}
          <svg className="pointer-events-none absolute inset-0 z-0" width={size.w} height={size.h} aria-hidden>
            <defs>
              <marker id="lm-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" fill="#cbd5e1" />
              </marker>
              <marker id="lm-arrow-on" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" fill="#527b20" />
              </marker>
            </defs>
            {EDGES.map(([a, b]) => {
              const on = edgeLit(a, b)
              // 두 시기 이상 건너뛰는 긴 선은 평소에 흐리게 (눌렀을 때만 또렷하게)
              const long = Math.abs(stageIndex.get(nodeOf(b).stage)! - stageIndex.get(nodeOf(a).stage)!) >= 2
              return (
                <path
                  key={`${a}>${b}`}
                  d={edgePath(a, b)}
                  fill="none"
                  stroke={on ? '#527b20' : '#cbd5e1'}
                  strokeWidth={on ? 2.2 : 1.2}
                  strokeOpacity={on ? 1 : path ? 0.2 : long ? 0.45 : 0.9}
                  strokeDasharray={!on && long ? '4 4' : undefined}
                  markerEnd={`url(#${on ? 'lm-arrow-on' : 'lm-arrow'})`}
                />
              )
            })}
          </svg>

          {/* 머리줄: 시기 */}
          <div className={`${GRID} relative z-10 mb-2`}>
            <div />
            {STAGES.map((s) => (
              <div key={s.id} className={`rounded-lg px-2 py-1.5 text-center ${toneOf(s.id).head}`}>
                <div className="text-sm font-bold">{s.label}</div>
                <div className="truncate text-[11px] opacity-90">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* 영역마다 한 줄 */}
          {STRANDS.map((st, i) => (
            <div key={st.id} className={`${GRID} relative z-10 rounded-lg py-3 ${i % 2 ? '' : 'bg-slate-50'}`}>
              {/* 옆으로 밀어도 영역 이름은 왼쪽에 남게 */}
              <div
                className={`sticky left-0 z-20 -my-3 flex items-start justify-center rounded-l-lg py-4 text-center text-xs font-bold leading-tight text-slate-500 ${
                  i % 2 ? 'bg-white' : 'bg-slate-50'
                }`}
              >
                {st.label}
              </div>
              {STAGES.map((sg) => (
                <div key={sg.id} className="flex flex-col gap-1.5">
                  {NODES.filter((x) => x.stage === sg.id && x.strand === st.id).map((x) => {
                    const c = countOf(x)
                    const tone = toneOf(x.stage)
                    const isSel = selected === x.id
                    return (
                      <button
                        key={x.id}
                        ref={(el) => {
                          if (el) chipRefs.current.set(x.id, el)
                          else chipRefs.current.delete(x.id)
                        }}
                        type="button"
                        onMouseEnter={() => setHover(x.id)}
                        onFocus={() => setHover(x.id)}
                        onBlur={() => setHover(null)}
                        onClick={() => setSelected((v) => (v === x.id ? null : x.id))}
                        aria-pressed={isSel}
                        title={`${x.subject} · ${x.unit} — 자료 ${c}개`}
                        className={`relative w-full rounded-lg border px-2 py-1.5 text-left transition ${
                          c ? tone.chip : 'border-dashed border-slate-300 bg-white text-slate-600'
                        } ${lit(x.id) ? '' : 'opacity-25'} ${isSel ? `ring-2 ring-offset-1 ${tone.ring}` : ''} ${
                          active === x.id ? 'shadow-md' : 'hover:shadow-sm'
                        }`}
                      >
                        {x.level === '고' && (
                          <span className="block text-[10px] font-medium leading-tight opacity-70">{x.subject}</span>
                        )}
                        <span className="block pr-5 text-[12.5px] font-semibold leading-snug">{x.unit}</span>
                        {c > 0 && (
                          <span
                            className={`absolute right-1.5 top-1.5 min-w-[18px] rounded-full px-1 text-center text-[10px] font-bold leading-[18px] text-white tabular-nums ${tone.count}`}
                          >
                            {c}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <svg width="28" height="8" aria-hidden>
            <path d="M0,4 H22" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M20,0 L28,4 L20,8 z" fill="#94a3b8" />
          </svg>
          먼저 배우는 단원 → 이어서 배우는 단원
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-5 rounded border border-brand-200 bg-brand-50" /> 자료 있음 (숫자 = 자료 수)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-5 rounded border border-dashed border-slate-300" /> 아직 자료 없음
        </span>
        <span>고등학교 단원은 가장 가까운 영역 줄에 놓았어요.</span>
      </div>

      {sel && <NodeDetail node={sel} count={countOf(sel)} countOf={countOf} onPick={setSelected} />}
    </div>
  )
}

function NodeDetail({
  node,
  count,
  countOf,
  onPick,
}: {
  node: MapNode
  count: number
  countOf: (x: MapNode) => number
  onPick: (id: string) => void
}) {
  const stage = STAGES.find((s) => s.id === node.stage)!
  const strand = STRANDS.find((s) => s.id === node.strand)!
  const before = prereqsOf(node.id).map(nodeOf)
  const after = nextOf(node.id).map(nodeOf)
  const path = pathOf(node.id)
  const newHref = `/resources/new?level=${node.level}&subject=${encodeURIComponent(node.subject)}&unit=${encodeURIComponent(node.unit)}`
  const askHref = `/board/new?category=${encodeURIComponent('질문')}&title=${encodeURIComponent(`[${node.subject} · ${node.unit}] 자료 요청`)}`

  const Chips = ({ list, empty }: { list: MapNode[]; empty: string }) =>
    list.length ? (
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {list.map((x) => (
          <button key={x.id} onClick={() => onPick(x.id)} className="chip px-2.5 py-0.5 text-xs">
            {x.level === '고' ? x.subject : STAGES.find((s) => s.id === x.stage)!.label} · {x.unit}
            {countOf(x) > 0 && <b className="ml-1 tabular-nums text-brand-700">{countOf(x)}</b>}
          </button>
        ))}
      </div>
    ) : (
      <p className="mt-1.5 text-xs text-slate-400">{empty}</p>
    )

  return (
    <section className="card mt-4 p-4 sm:p-5" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {node.level === '고' ? `${stage.label} · ${node.subject}` : node.subject} · {strand.label}
          </p>
          <h2 className="mt-0.5 text-lg font-bold text-slate-900">{node.unit}</h2>
          <p className="mt-1 text-xs text-slate-500">
            앞쪽으로 {path.before.size}개, 뒤쪽으로 {path.after.size}개 단원과 이어져 있어요.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {count > 0 ? (
            <Link href={resourcesHref(node)} className="btn-primary btn-sm">
              자료 {count}개 보기 →
            </Link>
          ) : (
            <Link href={askHref} className="btn-secondary btn-sm">
              자료 요청하기
            </Link>
          )}
          <Link href={newHref} className="btn-secondary btn-sm">
            + 이 단원 자료 올리기
          </Link>
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="text-xs font-bold text-slate-600">← 먼저 배우는 단원</h3>
          <Chips list={before} empty="이 지도에서 가장 처음 배우는 단원이에요." />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-600">이어서 배우는 단원 →</h3>
          <Chips list={after} empty="이 지도에서 마지막 단계예요." />
        </div>
      </div>
    </section>
  )
}
