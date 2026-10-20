'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Gate } from '@/components/Gate'
import { POST_LIST_COLUMNS, PostItem, RESOURCE_LIST_COLUMNS, ResourceItem } from '@/components/ListItems'
import { SiteBanners } from '@/components/SiteBanners'
import { Spinner } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import type { Post, Resource } from '@/lib/types'

export default function HomePage() {
  const { session, loading } = useAuth()
  if (loading) return <Spinner />
  if (!session) return <Landing />
  return (
    <Gate>
      <Dashboard />
    </Gate>
  )
}

function Landing() {
  const features = [
    ['📂', '자료실', '학습지·수업 PPT·수행평가·GeoGebra 자료를 학교급·과목·단원별로 나눠요.'],
    ['💬', '질문·나눔 게시판', '"이 단원 어떻게 가르치세요?" 수업 고민을 함께 풀어요.'],
    ['∑', '수식 그대로', '$x^2$ 처럼 쓰면 글과 댓글에서 수식이 바로 보여요.'],
    ['🔒', '선생님만', '관리자가 승인한 수학 선생님만 들어와요. 평가 자료도 안심하고 나눠요.'],
  ]
  return (
    <div className="py-6 sm:py-12">
      <section className="text-center">
        <p className="badge-brand">중·고등학교 수학 선생님 전용</p>
        <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          수학 선생님이 만든 자료를,
          <br />
          <span className="text-brand-600">수학 선생님들과 함께.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
          혼자 고민하던 수업 준비, 여기서 나눠요. 직접 만든 자료를 올리고, 서로의 수업 이야기를 들어요.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/signup" className="btn-primary px-6 py-3 text-base">
            가입 신청하기
          </Link>
          <Link href="/login" className="btn-secondary px-6 py-3 text-base">
            로그인
          </Link>
        </div>
      </section>
      <section className="mt-14 grid gap-4 sm:grid-cols-2">
        {features.map(([icon, title, desc]) => (
          <div key={title} className="card p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-xl text-brand-700">{icon}</div>
            <h2 className="mt-3 font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{desc}</p>
          </div>
        ))}
      </section>
      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold text-slate-500">함께 보면 좋은 사이트</h2>
        <SiteBanners />
      </section>
    </div>
  )
}

function Dashboard() {
  const { profile } = useAuth()
  const [recent, setRecent] = useState<Resource[] | null>(null)
  const [popular, setPopular] = useState<Resource[] | null>(null)
  const [posts, setPosts] = useState<Post[] | null>(null)

  useEffect(() => {
    const res = () => supabase.from('resources').select(RESOURCE_LIST_COLUMNS)
    Promise.all([
      res().order('created_at', { ascending: false }).limit(5),
      res().gt('download_count', 0).order('download_count', { ascending: false }).limit(5),
      supabase.from('posts').select(POST_LIST_COLUMNS).order('created_at', { ascending: false }).limit(8),
    ]).then(([a, b, c]) => {
      setRecent((a.data as unknown as Resource[]) ?? [])
      setPopular((b.data as unknown as Resource[]) ?? [])
      setPosts((c.data as unknown as Post[]) ?? [])
    })
  }, [])

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">반가워요</p>
          <h1 className="page-title">{profile?.name} 선생님 👋</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/resources/new" className="btn-primary">
            + 자료 올리기
          </Link>
          <Link href="/board/new" className="btn-secondary">
            글쓰기
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <SiteBanners />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <SectionHead title="새로 올라온 자료" href="/resources" />
          {recent === null ? (
            <Spinner />
          ) : recent.length === 0 ? (
            <FirstOne href="/resources/new" text="아직 자료가 없어요. 첫 자료를 올려 주세요!" />
          ) : (
            <ul className="space-y-2">
              {recent.map((r) => (
                <ResourceItem key={r.id} r={r} />
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-8 lg:col-span-2">
          <section>
            <SectionHead title="게시판 새 글" href="/board" />
            {posts === null ? (
              <Spinner />
            ) : posts.length === 0 ? (
              <FirstOne href="/board/new" text="첫 글을 남겨 주세요." />
            ) : (
              <ul className="card divide-y divide-slate-100 overflow-hidden">
                {posts.map((p) => (
                  <PostItem key={p.id} p={p} />
                ))}
              </ul>
            )}
          </section>
          {popular && popular.length > 0 && (
            <section>
              <SectionHead title="많이 받은 자료" href="/resources?sort=popular" />
              <ol className="card divide-y divide-slate-100 overflow-hidden text-sm">
                {popular.map((r, i) => (
                  <li key={r.id}>
                    <Link href={`/resources/${r.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50">
                      <span className="w-4 font-bold text-brand-600">{i + 1}</span>
                      <span className="min-w-0 flex-1 truncate">{r.title}</span>
                      <span className="text-xs tabular-nums text-slate-400">⬇ {r.download_count}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionHead({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-bold text-slate-900">{title}</h2>
      <Link href={href} className="text-sm text-slate-500 hover:text-brand-700">
        더 보기 →
      </Link>
    </div>
  )
}

function FirstOne({ href, text }: { href: string; text: string }) {
  return (
    <Link href={href} className="card block px-4 py-8 text-center text-sm text-slate-500 hover:border-brand-300">
      {text}
    </Link>
  )
}
