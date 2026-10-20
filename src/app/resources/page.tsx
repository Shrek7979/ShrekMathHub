'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { Gate } from '@/components/Gate'
import { RESOURCE_LIST_COLUMNS, ResourceItem } from '@/components/ListItems'
import { Empty, Spinner } from '@/components/ui'
import { RESOURCE_TYPES, SUBJECTS } from '@/lib/curriculum'
import { cleanSearch } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import type { Resource, SchoolLevel } from '@/lib/types'

const PAGE = 20

export default function ResourcesPage() {
  return (
    <Gate>
      <Suspense fallback={<Spinner />}>
        <ResourceList />
      </Suspense>
    </Gate>
  )
}

function ResourceList() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const level = (params.get('level') ?? '') as SchoolLevel | ''
  const subject = params.get('subject') ?? ''
  const type = params.get('type') ?? ''
  const sort = params.get('sort') === 'popular' ? 'popular' : 'recent'
  const q = params.get('q') ?? ''

  const [search, setSearch] = useState(q)
  const [items, setItems] = useState<Resource[] | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  /** 주소창의 조건을 바꾼다 (뒤로 가기·링크 공유 가능) */
  function setParam(changes: Record<string, string>) {
    const next = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
  }

  useEffect(() => {
    setSearch(q)
  }, [q])

  useEffect(() => {
    let cancelled = false
    async function load() {
      let query = supabase.from('resources').select(RESOURCE_LIST_COLUMNS, { count: 'exact' })
      if (level) query = query.eq('school_level', level)
      if (subject) query = query.eq('subject', subject)
      if (type) query = query.eq('resource_type', type)
      const s = cleanSearch(q)
      if (s) query = query.or(`title.ilike.%${s}%,description.ilike.%${s}%,unit.ilike.%${s}%`)
      query = query
        .order(sort === 'popular' ? 'download_count' : 'created_at', { ascending: false })
        .order('id', { ascending: false })
        .range(page * PAGE, page * PAGE + PAGE - 1)
      const { data, count } = await query
      if (cancelled) return
      const rows = (data as unknown as Resource[]) ?? []
      setItems((prev) => (page === 0 ? rows : [...(prev ?? []), ...rows]))
      setTotal(count ?? 0)
      setLoadingMore(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [level, subject, type, sort, q, page])

  // 조건이 바뀌면 첫 쪽부터
  useEffect(() => {
    setPage(0)
    setItems(null)
  }, [level, subject, type, sort, q])

  const subjectGroups = level ? SUBJECTS[level] : [...SUBJECTS['중'], ...SUBJECTS['고']]
  const filtered = !!(level || subject || type || q)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title">자료실</h1>
        <Link href="/resources/new" className="btn-primary">
          + 자료 올리기
        </Link>
      </div>

      <div className="card mt-5 space-y-3 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setParam({ q: search.trim() })
          }}
          className="flex gap-2"
        >
          <input
            className="input"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제목·설명·단원에서 찾기 (예: 이차함수, 수행평가)"
          />
          <button className="btn-secondary shrink-0">찾기</button>
        </form>

        <div className="flex flex-wrap gap-2">
          {(['', '중', '고'] as const).map((l) => (
            <button
              key={l || 'all'}
              onClick={() => setParam({ level: l, subject: '' })}
              className={`chip ${level === l ? 'chip-on' : ''}`}
            >
              {l === '' ? '전체' : l === '중' ? '중학교' : '고등학교'}
            </button>
          ))}
          <select
            aria-label="과목"
            className="input w-auto py-1"
            value={subject}
            onChange={(e) => setParam({ subject: e.target.value })}
          >
            <option value="">모든 과목</option>
            {subjectGroups.map((g, i) => (
              <optgroup key={`${g.group}-${i}`} label={g.group}>
                {g.items.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <select aria-label="자료 유형" className="input w-auto py-1" value={type} onChange={(e) => setParam({ type: e.target.value })}>
            <option value="">모든 유형</option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
        <span>
          {items !== null && (
            <>
              <b className="text-slate-800">{total}</b>개
            </>
          )}
          {filtered && (
            <button onClick={() => router.replace(pathname)} className="ml-3 text-brand-700 hover:underline">
              조건 지우기
            </button>
          )}
        </span>
        <div className="flex gap-1">
          {(['recent', 'popular'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setParam({ sort: s === 'recent' ? '' : s })}
              className={`rounded-md px-2 py-1 ${sort === s ? 'font-semibold text-slate-900' : 'hover:text-slate-800'}`}
            >
              {s === 'recent' ? '최신순' : '많이 받은 순'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3">
        {items === null ? (
          <Spinner />
        ) : items.length === 0 ? (
          <Empty
            action={
              <Link href="/resources/new" className="btn-primary btn-sm">
                자료 올리기
              </Link>
            }
          >
            {filtered ? '조건에 맞는 자료가 없어요.' : '아직 올라온 자료가 없어요. 첫 자료를 나눠 주세요!'}
          </Empty>
        ) : (
          <>
            <ul className="space-y-2">
              {items.map((r) => (
                <ResourceItem key={r.id} r={r} />
              ))}
            </ul>
            {items.length < total && (
              <div className="mt-4 text-center">
                <button
                  className="btn-secondary"
                  disabled={loadingMore}
                  onClick={() => {
                    setLoadingMore(true)
                    setPage((p) => p + 1)
                  }}
                >
                  더 보기 ({total - items.length}개 남음)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
