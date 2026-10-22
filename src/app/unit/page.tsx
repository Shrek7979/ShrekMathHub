'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { Gate } from '@/components/Gate'
import { HistoryArt } from '@/components/HistoryArt'
import { POST_LIST_COLUMNS, PostItem, RESOURCE_LIST_COLUMNS, ResourceItem } from '@/components/ListItems'
import { LoadError, Spinner } from '@/components/ui'
import { QUESTION, UNIT_HINTS, unitHref } from '@/lib/curriculum'
import { NODES, nextOf, nodeOf, prereqsOf, type MapNode } from '@/lib/learning-map'
import { LINK_GROUPS } from '@/lib/links'
import { STORIES } from '@/lib/math-history'
import { SITE } from '@/lib/site'
import { supabase } from '@/lib/supabase'
import type { Post, Resource, SchoolLevel } from '@/lib/types'

export default function UnitPage() {
  return (
    <Gate>
      <Suspense fallback={<Spinner />}>
        <Unit />
      </Suspense>
    </Gate>
  )
}

/** 단원 이름의 낱말이 수학사 이야기의 단원 표시에 들어 있으면 관련 이야기로 본다 */
function storiesFor(subject: string, unit: string) {
  const words = unit
    .split(/[\s·,()]+/)
    .map((w) => w.replace(/의$|와$|과$/, ''))
    .filter((w) => w.length >= 2)
  return STORIES.filter((s) => s.unit.includes(unit) || words.some((w) => s.unit.includes(w)))
}

function Unit() {
  const params = useSearchParams()
  const level: SchoolLevel = params.get('level') === '중' ? '중' : '고'
  const subject = params.get('subject') ?? ''
  const unit = (params.get('unit') ?? '').slice(0, 40)
  const [resources, setResources] = useState<Resource[] | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [failed, setFailed] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    if (!subject || !unit) return
    setResources(null)
    Promise.all([
      supabase
        .from('resources')
        .select(RESOURCE_LIST_COLUMNS)
        .eq('school_level', level)
        .eq('subject', subject)
        .eq('unit', unit)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(40),
      supabase.from('posts').select(POST_LIST_COLUMNS).ilike('title', `%${unit}%`).order('created_at', { ascending: false }).limit(8),
    ]).then(([r, p]) => {
      if (r.error) return setFailed(true)
      setFailed(false)
      setResources((r.data as unknown as Resource[]) ?? [])
      setPosts((p.data as unknown as Post[]) ?? [])
    })
  }, [level, subject, unit, reload])

  if (!subject || !unit)
    return (
      <div className="card mx-auto mt-6 max-w-lg px-6 py-10 text-center text-sm text-slate-600">
        <p>어느 단원인지 알 수 없어요.</p>
        <Link href="/curriculum" className="btn-primary mt-4">
          교육과정 지도에서 고르기
        </Link>
      </div>
    )

  const node = NODES.find((n) => n.subject === subject && n.unit === unit)
  const prereqs = node ? prereqsOf(node.id).map(nodeOf) : []
  const nexts = node ? nextOf(node.id).map(nodeOf) : []
  const siblings = UNIT_HINTS[subject] ?? []
  const idx = siblings.indexOf(unit)
  const stories = storiesFor(subject, unit)
  const tools = LINK_GROUPS.find((g) => g.title === '수업 도구')?.links ?? []
  const types = new Map<string, number>()
  resources?.forEach((r) => types.set(r.resource_type, (types.get(r.resource_type) ?? 0) + 1))
  const uploadHref = `/resources/new?level=${level}&subject=${encodeURIComponent(subject)}&unit=${encodeURIComponent(unit)}`
  const askHref = `/board/new?category=${encodeURIComponent(QUESTION)}&title=${encodeURIComponent(`[${subject} · ${unit}] `)}`

  return (
    <div>
      <nav className="text-sm text-slate-500" aria-label="위치">
        <Link href="/curriculum" className="hover:text-brand-700">
          교육과정 지도
        </Link>
        <span className="mx-1.5">›</span>
        <Link href={`/resources?level=${level}&subject=${encodeURIComponent(subject)}`} className="hover:text-brand-700">
          {subject}
        </Link>
      </nav>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">{unit}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {level === '중' ? '중학교' : '고등학교'} · {subject}
            {idx >= 0 && ` · ${idx + 1}/${siblings.length} 단원`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={uploadHref} className="btn-primary">
            + 이 단원 자료 올리기
          </Link>
          <Link href={askHref} className="btn-secondary">
            질문하기
          </Link>
        </div>
      </div>

      {(prereqs.length > 0 || nexts.length > 0 || idx >= 0) && (
        <div className="card mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 text-sm">
          <UnitLinks label="먼저 배우는 단원" nodes={prereqs} />
          <UnitLinks label="이어지는 단원" nodes={nexts} />
          {idx >= 0 && (
            <span className="ml-auto flex items-center gap-2 text-xs text-slate-500">
              {idx > 0 && (
                <Link href={unitHref(level, subject, siblings[idx - 1])} className="chip py-0.5 text-xs">
                  ← {siblings[idx - 1]}
                </Link>
              )}
              {idx < siblings.length - 1 && (
                <Link href={unitHref(level, subject, siblings[idx + 1])} className="chip py-0.5 text-xs">
                  {siblings[idx + 1]} →
                </Link>
              )}
            </span>
          )}
          {node && (
            <Link href="/curriculum" className="text-xs font-semibold text-brand-700 hover:underline">
              학습맵에서 보기 →
            </Link>
          )}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="space-y-8 lg:col-span-3">
          <section>
            <Head title={`자료${resources ? ` ${resources.length}개` : ''}`} href={`/resources?level=${level}&subject=${encodeURIComponent(subject)}&unit=${encodeURIComponent(unit)}`} more="자료실에서 걸러 보기 →" />
            {failed ? (
              <LoadError onRetry={() => setReload((n) => n + 1)} />
            ) : !resources ? (
              <Spinner />
            ) : resources.length === 0 ? (
              <Link href={uploadHref} className="card block px-4 py-8 text-center text-sm text-slate-500 hover:border-brand-300">
                이 단원 자료가 아직 없어요. 첫 자료를 올려 주세요!
              </Link>
            ) : (
              <>
                {types.size > 1 && (
                  <p className="mb-2 flex flex-wrap gap-1.5 text-xs text-slate-500">
                    {Array.from(types).map(([t, n]) => (
                      <span key={t} className="badge">
                        {t} {n}
                      </span>
                    ))}
                  </p>
                )}
                <ul className="card divide-y divide-slate-100 overflow-hidden">
                  {resources.map((r) => (
                    <ResourceItem key={r.id} r={r} compact />
                  ))}
                </ul>
              </>
            )}
          </section>

          <section>
            <Head title="이 단원 이야기" href={`/search?q=${encodeURIComponent(unit)}`} more="찾기 →" />
            {posts.length === 0 ? (
              <Link href={askHref} className="card block px-4 py-6 text-center text-sm text-slate-500 hover:border-brand-300">
                아직 이 단원 글이 없어요. "이 단원 어떻게 가르치세요?" 첫 질문을 남겨 보세요.
              </Link>
            ) : (
              <ul className="card divide-y divide-slate-100 overflow-hidden">
                {posts.map((p) => (
                  <PostItem key={p.id} p={p} />
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-8 lg:col-span-2">
          {stories.length > 0 && (
            <section>
              <Head title="수업 시작 5분, 수학사" href={`/history?q=${encodeURIComponent(unit)}`} more="모아 보기 →" />
              <ul className="space-y-2">
                {stories.slice(0, 3).map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/history?q=${encodeURIComponent(s.title)}`}
                      className="card flex items-center gap-3 border-amber-200 px-3 py-2.5 hover:border-amber-300"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-50 p-1 text-amber-700">
                        <HistoryArt name={s.art} className="h-full w-full" />
                      </span>
                      <span className="min-w-0">
                        <b className="block truncate text-sm text-slate-900">{s.title}</b>
                        <span className="block text-xs text-slate-500">{s.era}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <Head title="학생용 오늘의 문제" href={SITE.shrekMathUrl} more="ShrekMath ↗" external />
            <a
              href={SITE.shrekMathUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card flex items-center gap-3 px-4 py-3 text-sm hover:border-brand-300"
            >
              <span className="text-2xl">🎓</span>
              <span className="text-slate-600">
                학생들은 ShrekMath에서 날마다 한 문제를 풀고 AI 첨삭을 받아요. 이 단원 문제가 나오는 날 수업에 연결해 보세요.
              </span>
            </a>
          </section>

          <section>
            <Head title="수업 도구" href="/links" more="링크 모음 →" />
            <div className="grid grid-cols-2 gap-2">
              {tools.slice(0, 4).map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card truncate px-3 py-2 text-sm font-medium text-slate-700 hover:border-brand-300 hover:text-brand-700"
                  title={l.desc}
                >
                  {l.name} ↗
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function UnitLinks({ label, nodes }: { label: string; nodes: MapNode[] }) {
  if (nodes.length === 0) return null
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      {nodes.map((n) => (
        <Link key={n.id} href={unitHref(n.level, n.subject, n.unit)} className="chip py-0.5 text-xs" title={n.subject}>
          {n.unit}
        </Link>
      ))}
    </span>
  )
}

function Head({ title, href, more, external = false }: { title: string; href: string; more: string; external?: boolean }) {
  const cls = 'text-sm text-slate-500 hover:text-brand-700'
  return (
    <div className="mb-3 flex items-end justify-between gap-2 border-b border-slate-200 pb-2">
      <h2 className="text-[15px] font-bold text-slate-900">{title}</h2>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {more}
        </a>
      ) : (
        <Link href={href} className={cls}>
          {more}
        </Link>
      )}
    </div>
  )
}
