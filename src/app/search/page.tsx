'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { Gate } from '@/components/Gate'
import { POST_LIST_COLUMNS, PostItem, RESOURCE_LIST_COLUMNS, ResourceItem } from '@/components/ListItems'
import { Empty, Spinner } from '@/components/ui'
import { cleanSearch } from '@/lib/format'
import { LINK_GROUPS } from '@/lib/links'
import { supabase } from '@/lib/supabase'
import type { Post, Resource } from '@/lib/types'

const LIMIT = 10

export default function SearchPage() {
  return (
    <Gate>
      <Suspense fallback={<Spinner />}>
        <Search />
      </Suspense>
    </Gate>
  )
}

type Result = { resources: Resource[]; resourceCount: number; posts: Post[]; postCount: number }

/** 자료·게시판·링크 모음을 한 번에 찾기 */
function Search() {
  const params = useSearchParams()
  const router = useRouter()
  const q = params.get('q') ?? ''
  const [text, setText] = useState(q)
  const [result, setResult] = useState<Result | null>(null)
  const s = cleanSearch(q)

  useEffect(() => {
    setText(q)
  }, [q])

  useEffect(() => {
    if (!s) return setResult(null)
    let cancelled = false
    setResult(null)
    Promise.all([
      supabase
        .from('resources')
        .select(RESOURCE_LIST_COLUMNS, { count: 'exact' })
        .or(`title.ilike.%${s}%,description.ilike.%${s}%,unit.ilike.%${s}%,subject.ilike.%${s}%`)
        .order('created_at', { ascending: false })
        .limit(LIMIT),
      supabase
        .from('posts')
        .select(POST_LIST_COLUMNS, { count: 'exact' })
        .or(`title.ilike.%${s}%,body.ilike.%${s}%`)
        .order('created_at', { ascending: false })
        .limit(LIMIT),
    ]).then(([r, p]) => {
      if (cancelled) return
      setResult({
        resources: (r.data as unknown as Resource[]) ?? [],
        resourceCount: r.count ?? 0,
        posts: (p.data as unknown as Post[]) ?? [],
        postCount: p.count ?? 0,
      })
    })
    return () => {
      cancelled = true
    }
  }, [s])

  const lower = s.toLowerCase()
  const links = s
    ? LINK_GROUPS.flatMap((g) => g.links).filter((l) => `${l.name} ${l.desc}`.toLowerCase().includes(lower))
    : []

  return (
    <div>
      <h1 className="page-title">찾기</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          router.replace(`/search?q=${encodeURIComponent(text.trim())}`)
        }}
        className="mt-4 flex gap-2"
      >
        <input
          className="input py-3 text-base"
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="자료·게시글·링크에서 찾기 (예: 이차함수, 수행평가, GeoGebra)"
          autoFocus
        />
        <button className="btn-primary shrink-0 px-5">찾기</button>
      </form>

      {!s ? (
        <p className="mt-6 text-sm text-slate-500">찾을 낱말을 넣어 주세요.</p>
      ) : !result ? (
        <Spinner label="찾는 중…" />
      ) : result.resourceCount + result.postCount + links.length === 0 ? (
        <div className="mt-6">
          <Empty>&lsquo;{s}&rsquo;에 맞는 자료나 글이 없어요. 낱말을 줄이거나 바꿔 보세요.</Empty>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          <ResultSection title="자료" count={result.resourceCount} more={`/resources?q=${encodeURIComponent(s)}`}>
            <ul className="space-y-2">
              {result.resources.map((r) => (
                <ResourceItem key={r.id} r={r} />
              ))}
            </ul>
          </ResultSection>
          <ResultSection title="게시글" count={result.postCount} more={`/board?q=${encodeURIComponent(s)}`}>
            <ul className="card divide-y divide-slate-100 overflow-hidden">
              {result.posts.map((p) => (
                <PostItem key={p.id} p={p} />
              ))}
            </ul>
          </ResultSection>
          {links.length > 0 && (
            <ResultSection title="링크 모음" count={links.length}>
              <ul className="grid gap-2 sm:grid-cols-2">
                {links.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="card block px-4 py-3 hover:border-brand-300">
                      <p className="font-semibold text-slate-900">{l.name} ↗</p>
                      <p className="text-sm text-slate-500">{l.desc}</p>
                    </a>
                  </li>
                ))}
              </ul>
            </ResultSection>
          )}
        </div>
      )}
    </div>
  )
}

function ResultSection(props: { title: string; count: number; more?: string; children: React.ReactNode }) {
  if (props.count === 0) return null
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold text-slate-900">
          {props.title} <span className="text-brand-600">{props.count}</span>
        </h2>
        {props.more && props.count > LIMIT && (
          <Link href={props.more} className="text-sm text-slate-500 hover:text-brand-700">
            모두 보기 →
          </Link>
        )}
      </div>
      {props.children}
    </section>
  )
}
