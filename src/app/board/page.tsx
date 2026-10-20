'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { Gate } from '@/components/Gate'
import { POST_LIST_COLUMNS, PostItem } from '@/components/ListItems'
import { Empty, LoadError, Spinner } from '@/components/ui'
import { BOARD_CATEGORIES, NOTICE } from '@/lib/curriculum'
import { POST_SEARCH_FIELDS, searchFilters } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import type { Post } from '@/lib/types'

const PAGE = 30

export default function BoardPage() {
  return (
    <Gate>
      <Suspense fallback={<Spinner />}>
        <Board />
      </Suspense>
    </Gate>
  )
}

function Board() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const category = params.get('category') ?? ''
  const q = params.get('q') ?? ''
  const [search, setSearch] = useState(q)
  const [items, setItems] = useState<Post[] | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [notices, setNotices] = useState<Post[]>([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [failed, setFailed] = useState(false)
  const [reload, setReload] = useState(0)
  const showPinned = !category && !q

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
    setPage(0)
    setItems(null)
  }, [category, q])

  // 전체 보기에서는 공지를 맨 위에 따로 고정
  useEffect(() => {
    if (!showPinned) return setNotices([])
    let cancelled = false
    supabase
      .from('posts')
      .select(POST_LIST_COLUMNS)
      .eq('category', NOTICE)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => !cancelled && setNotices((data as unknown as Post[]) ?? []))
    return () => {
      cancelled = true
    }
  }, [showPinned, reload])

  useEffect(() => {
    let cancelled = false
    setFailed(false)
    let query = supabase.from('posts').select(POST_LIST_COLUMNS, { count: 'exact' })
    if (category) query = query.eq('category', category)
    else if (!q) query = query.neq('category', NOTICE)
    for (const f of searchFilters(q, POST_SEARCH_FIELDS)) query = query.or(f)
    query
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(page * PAGE, page * PAGE + PAGE - 1)
      .then(({ data, count, error }) => {
        if (cancelled) return
        setLoadingMore(false)
        if (error) return setFailed(true)
        const rows = (data as unknown as Post[]) ?? []
        setItems((prev) => (page === 0 ? rows : [...(prev ?? []), ...rows]))
        setTotal(count ?? 0)
      })
    return () => {
      cancelled = true
    }
  }, [category, q, page, reload])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title">게시판</h1>
        <Link href={`/board/new${category ? `?category=${encodeURIComponent(category)}` : ''}`} className="btn-primary">
          글쓰기
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {['', NOTICE, ...BOARD_CATEGORIES].map((c) => (
          <button key={c || 'all'} onClick={() => setParam({ category: c })} className={`chip ${category === c ? 'chip-on' : ''}`}>
            {c === NOTICE ? '📢 공지' : c || '전체'}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setParam({ q: search.trim() })
        }}
        className="mt-3 flex gap-2"
      >
        <input className="input" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="제목·내용에서 찾기" />
        <button className="btn-secondary shrink-0">찾기</button>
      </form>

      {notices.length > 0 && (
        <ul className="card mt-4 divide-y divide-slate-100 overflow-hidden border-amber-200">
          {notices.map((p) => (
            <PostItem key={p.id} p={p} />
          ))}
        </ul>
      )}

      <div className="mt-4">
        {failed ? (
          <LoadError
            onRetry={() => {
              setItems(null)
              setPage(0)
              setReload((n) => n + 1)
            }}
          />
        ) : items === null ? (
          <Spinner />
        ) : items.length === 0 && notices.length > 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            아직 다른 글이 없어요.{' '}
            <Link href="/board/new" className="font-semibold text-brand-700">
              첫 글 쓰기 →
            </Link>
          </p>
        ) : items.length === 0 ? (
          <Empty
            action={
              <Link href="/board/new" className="btn-primary btn-sm">
                글쓰기
              </Link>
            }
          >
            {category || q ? '조건에 맞는 글이 없어요.' : '아직 글이 없어요. 첫 이야기를 들려주세요!'}
          </Empty>
        ) : (
          <>
            <ul className="card divide-y divide-slate-100 overflow-hidden">
              {items.map((p) => (
                <PostItem key={p.id} p={p} />
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
