'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Gate } from '@/components/Gate'
import { POST_LIST_COLUMNS, PostItem, RESOURCE_LIST_COLUMNS, ResourceItem } from '@/components/ListItems'
import { SiteBanners } from '@/components/SiteBanners'
import { Spinner } from '@/components/ui'
import { NOTICE, QUESTION, SUBJECTS } from '@/lib/curriculum'
import { timeAgo } from '@/lib/format'
import { LINK_GROUPS } from '@/lib/links'
import { supabase } from '@/lib/supabase'
import type { Post, Resource, SchoolLevel } from '@/lib/types'

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
    ['🗺️', '교육과정 지도', '2022 개정 교육과정 과목·단원별로 모인 자료를 한눈에 봐요.'],
    ['💬', '질문·나눔 게시판', '"이 단원 어떻게 가르치세요?" 수업 고민을 함께 풀어요.'],
    ['∑', '수식 그대로', '$x^2$ 처럼 쓰면 글과 댓글에서 수식이 바로 보여요.'],
    ['📰', '오늘의 수학 뉴스', '화면 한쪽에서 Shrek Edu Insight 수학 뉴스를 늘 함께 봐요.'],
    ['🔒', '선생님만', '관리자가 승인한 수학 선생님만 들어와요. 평가 자료도 안심하고 나눠요.'],
  ]
  return (
    <div className="py-6 sm:py-10">
      <section className="text-center">
        <p className="badge-brand">중·고등학교 수학 선생님의 허브</p>
        <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          수학 선생님이 만든 자료를,
          <br />
          <span className="text-brand-600">수학 선생님들과 함께.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
          혼자 고민하던 수업 준비, 여기서 나눠요. 직접 만든 자료를 올리고, 서로의 수업 이야기를 듣고, 오늘의 수학 뉴스도 함께 봐요.
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
      <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(([icon, title, desc]) => (
          <div key={title} className="card p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-xl text-brand-700">{icon}</div>
            <h2 className="mt-3 font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{desc}</p>
          </div>
        ))}
      </section>
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500">함께 보면 좋은 사이트</h2>
          <Link href="/links" className="text-sm text-slate-500 hover:text-brand-700">
            수학교육 링크 모음 →
          </Link>
        </div>
        <SiteBanners />
      </section>
    </div>
  )
}

type HomeData = {
  notice: Post | null
  featured: Resource[]
  recent: Resource[]
  posts: Post[]
  questions: Post[]
}

function Dashboard() {
  const { profile, isAdmin } = useAuth()
  const [data, setData] = useState<HomeData | null>(null)
  const level: SchoolLevel = profile?.school_level === '중' ? '중' : '고'

  useEffect(() => {
    const res = () => supabase.from('resources').select(RESOURCE_LIST_COLUMNS)
    const posts = () => supabase.from('posts').select(POST_LIST_COLUMNS)
    Promise.all([
      posts().eq('category', NOTICE).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      res().eq('featured', true).order('created_at', { ascending: false }).limit(4),
      res().order('created_at', { ascending: false }).limit(5),
      posts().neq('category', NOTICE).order('created_at', { ascending: false }).limit(6),
      posts().eq('category', QUESTION).eq('solved', false).order('created_at', { ascending: false }).limit(4),
    ]).then(([n, f, r, p, q]) =>
      setData({
        notice: (n.data as unknown as Post | null) ?? null,
        featured: (f.data as unknown as Resource[]) ?? [],
        recent: (r.data as unknown as Resource[]) ?? [],
        posts: (p.data as unknown as Post[]) ?? [],
        questions: (q.data as unknown as Post[]) ?? [],
      }),
    )
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

      <HubSearch />

      {data?.notice && (
        <Link
          href={`/board/${data.notice.id}`}
          className="mt-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm hover:border-amber-300"
        >
          <span className="badge shrink-0 bg-amber-100 font-semibold text-amber-800">📢 공지</span>
          <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{data.notice.title}</span>
          <span className="shrink-0 text-xs text-slate-400">{timeAgo(data.notice.created_at)}</span>
        </Link>
      )}

      <div className="mt-5">
        <SiteBanners />
      </div>

      {!data ? (
        <Spinner />
      ) : (
        <>
          {data.featured.length > 0 && (
            <section className="mt-8">
              <SectionHead title="⭐ 허브 추천 자료" href="/resources?featured=1" />
              <ul className="grid gap-2 md:grid-cols-2">
                {data.featured.map((r) => (
                  <ResourceItem key={r.id} r={r} />
                ))}
              </ul>
            </section>
          )}

          <section className="mt-8">
            <SectionHead title={`🗺️ ${level === '중' ? '중학교' : '고등학교'} 과목별 자료`} href="/curriculum" more="교육과정 지도 →" />
            <div className="flex flex-wrap gap-2">
              {SUBJECTS[level]
                .flatMap((g) => g.items)
                .map((s) => (
                  <Link key={s} href={`/resources?level=${level}&subject=${encodeURIComponent(s)}`} className="chip">
                    {s}
                  </Link>
                ))}
            </div>
          </section>

          <div className="mt-8 grid gap-8 lg:grid-cols-5">
            <section className="lg:col-span-3">
              <SectionHead title="새로 올라온 자료" href="/resources" />
              {data.recent.length === 0 ? (
                <FirstOne href="/resources/new" text={isAdmin ? '첫 자료를 올려 허브를 열어 주세요!' : '아직 자료가 없어요. 첫 자료를 올려 주세요!'} />
              ) : (
                <ul className="space-y-2">
                  {data.recent.map((r) => (
                    <ResourceItem key={r.id} r={r} />
                  ))}
                </ul>
              )}
            </section>

            <div className="space-y-8 lg:col-span-2">
              {data.questions.length > 0 && (
                <section>
                  <SectionHead title="🙋 답을 기다리는 질문" href={`/board?category=${encodeURIComponent(QUESTION)}`} />
                  <ul className="card divide-y divide-slate-100 overflow-hidden">
                    {data.questions.map((p) => (
                      <PostItem key={p.id} p={p} />
                    ))}
                  </ul>
                </section>
              )}
              <section>
                <SectionHead title="게시판 새 글" href="/board" />
                {data.posts.length === 0 ? (
                  <FirstOne href="/board/new" text="첫 글을 남겨 주세요." />
                ) : (
                  <ul className="card divide-y divide-slate-100 overflow-hidden">
                    {data.posts.map((p) => (
                      <PostItem key={p.id} p={p} />
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>

          <section className="mt-10">
            <SectionHead title="🔗 수업 준비 바로가기" href="/links" more="링크 모음 →" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {LINK_GROUPS.flatMap((g) => g.links)
                .slice(0, 8)
                .map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card truncate px-3 py-2.5 text-sm font-medium text-slate-700 hover:border-brand-300 hover:text-brand-700"
                    title={l.desc}
                  >
                    {l.name} ↗
                  </a>
                ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

/** 첫 화면의 큰 찾기 칸 → /search */
function HubSearch() {
  const router = useRouter()
  const [q, setQ] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`)
      }}
      className="mt-5 flex gap-2"
      role="search"
    >
      <input
        className="input py-3 text-base"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="무엇을 찾으세요? 예) 이차함수 활동지, 수행평가 루브릭"
        aria-label="자료·글 찾기"
      />
      <button className="btn-primary shrink-0 px-5">찾기</button>
    </form>
  )
}

function SectionHead({ title, href, more = '더 보기 →' }: { title: string; href: string; more?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-bold text-slate-900">{title}</h2>
      <Link href={href} className="text-sm text-slate-500 hover:text-brand-700">
        {more}
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
