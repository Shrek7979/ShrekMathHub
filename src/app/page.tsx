'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { MathHistory } from '@/components/MathHistory'
import { Gate } from '@/components/Gate'
import { POST_LIST_COLUMNS, PostItem, RESOURCE_LIST_COLUMNS, ResourceItem } from '@/components/ListItems'
import { SiteBanners } from '@/components/SiteBanners'
import { LoadError, Spinner } from '@/components/ui'
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
    ['📰', '오늘의 수학 뉴스', '화면 왼쪽에서 Shrek Edu Insight 수학 뉴스를 늘 함께 봐요.'],
    ['📜', '오늘의 수학사', '날마다 수학 역사 이야기 한 편과 "수업에서 이렇게" 팁. 수업 시작 5분 이야깃거리.'],
    ['🎓', 'ShrekMath', '학생용 하루 한 문제 사이트가 화면 오른쪽에. 학생이 올린 풀이 사진을 AI가 채점·첨삭해요.'],
    ['🔒', '선생님만', '관리자가 승인한 수학 선생님만 들어와요. 평가 자료도 안심하고 나눠요.'],
  ]
  return (
    <div className="py-4 sm:py-8">
      <section className="graph-paper -mx-4 px-4 py-8 text-center sm:mx-0 sm:rounded-2xl sm:py-10">
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

      {/* 대문의 특징: 날마다 수학사 이야기 한 편 (학생용 오늘의 문제는 오른쪽 ShrekMath 패널) */}
      <section className="mx-auto mt-8 max-w-3xl">
        <MathHistory />
        <p className="mt-2 text-center text-xs text-slate-500">날마다 새 이야기가 올라와요. 수업 시작 5분, 학생들에게 들려주세요.</p>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

// 지난 방문 시각 (이 브라우저 기준): 사이트를 연 뒤 처음 한 번만 읽고 지금으로 바꿔 둔다
let lastVisitCache: string | null | undefined
function takeLastVisit() {
  if (lastVisitCache === undefined) {
    try {
      lastVisitCache = localStorage.getItem('smh-last-visit')
      localStorage.setItem('smh-last-visit', new Date().toISOString())
    } catch {
      lastVisitCache = null
    }
  }
  return lastVisitCache
}

type HomeData = {
  notice: Post | null
  featured: Resource[]
  recent: Resource[]
  popular: Resource[]
  /** 지난번에 들어온 뒤 새로 올라온 자료 수 (처음이면 null) */
  newSince: number | null
  posts: Post[]
  questions: Post[]
}

function Dashboard() {
  const { profile, isAdmin } = useAuth()
  const [data, setData] = useState<HomeData | null>(null)
  const [failed, setFailed] = useState(false)
  const [reload, setReload] = useState(0)
  const level: SchoolLevel = profile?.school_level === '중' ? '중' : '고'

  useEffect(() => {
    const res = () => supabase.from('resources').select(RESOURCE_LIST_COLUMNS)
    const posts = () => supabase.from('posts').select(POST_LIST_COLUMNS)
    const lastVisit = takeLastVisit()
    Promise.all([
      posts().eq('category', NOTICE).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      res().eq('featured', true).order('created_at', { ascending: false }).limit(4),
      res().order('created_at', { ascending: false }).limit(5),
      posts().neq('category', NOTICE).order('created_at', { ascending: false }).limit(6),
      posts().eq('category', QUESTION).eq('solved', false).order('created_at', { ascending: false }).limit(4),
      res().gt('download_count', 0).order('download_count', { ascending: false }).limit(5),
      lastVisit
        ? supabase.from('resources').select('id', { count: 'exact', head: true }).gt('created_at', lastVisit)
        : Promise.resolve({ count: null }),
    ]).then(([n, f, r, p, q, pop, since]) => {
      if (r.error || p.error) return setFailed(true)
      setFailed(false)
      setData({
        notice: (n.data as unknown as Post | null) ?? null,
        featured: (f.data as unknown as Resource[]) ?? [],
        recent: (r.data as unknown as Resource[]) ?? [],
        posts: (p.data as unknown as Post[]) ?? [],
        questions: (q.data as unknown as Post[]) ?? [],
        popular: (pop.data as unknown as Resource[]) ?? [],
        newSince: since.count ?? null,
      })
    })
  }, [reload])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">{profile?.name} 선생님, 반가워요 👋</h1>
          <TodayLine />
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

      <WelcomeGuide />

      {data?.notice && (
        <Link
          href={`/board/${data.notice.id}`}
          className="mt-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm hover:border-amber-300"
        >
          <span className="badge shrink-0 bg-amber-100 font-semibold text-amber-800">📢 공지</span>
          <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{data.notice.title}</span>
          <span className="shrink-0 text-xs text-slate-500">{timeAgo(data.notice.created_at)}</span>
        </Link>
      )}

      <div className="mt-6">
        <MathHistory />
      </div>

      {failed ? (
        <div className="mt-8">
          <LoadError onRetry={() => setReload((n) => n + 1)} />
        </div>
      ) : !data ? (
        <Spinner />
      ) : (
        <>
          <div className="mt-10 grid gap-8 lg:grid-cols-5">
            <div className="space-y-8 lg:col-span-3">
              {data.featured.length > 0 && (
                <section>
                  <SectionHead title="허브 추천 자료" href="/resources?featured=1" />
                  <ul className="card divide-y divide-slate-100 overflow-hidden">
                    {data.featured.map((r) => (
                      <ResourceItem key={r.id} r={r} compact />
                    ))}
                  </ul>
                </section>
              )}

              <section>
                <SectionHead
                  title="새로 올라온 자료"
                  href="/resources"
                  badge={data.newSince ? `지난 방문 이후 ${data.newSince}개` : undefined}
                />
                {data.recent.length === 0 ? (
                  <FirstOne href="/resources/new" text={isAdmin ? '첫 자료를 올려 허브를 열어 주세요!' : '아직 자료가 없어요. 첫 자료를 올려 주세요!'} />
                ) : (
                  <ul className="card divide-y divide-slate-100 overflow-hidden">
                    {data.recent.map((r) => (
                      <ResourceItem key={r.id} r={r} compact />
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <SectionHead title={`${level === '중' ? '중학교' : '고등학교'} 과목별 자료`} href="/curriculum" more="교육과정 지도 →" />
                <div className="card divide-y divide-slate-100 px-4">
                  {SUBJECTS[level].map((g) => (
                    <div key={g.group} className="flex flex-wrap items-center gap-1.5 py-2.5">
                      <span className="w-16 shrink-0 text-xs font-semibold text-slate-400">{g.group}</span>
                      {g.items.map((s) => (
                        <Link key={s} href={`/resources?level=${level}&subject=${encodeURIComponent(s)}`} className="chip py-0.5 text-xs">
                          {s}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-8 lg:col-span-2">
              {data.popular.length > 0 && (
                <section>
                  <SectionHead title="많이 받은 자료" href="/resources?sort=popular" />
                  <ol className="card divide-y divide-slate-100 overflow-hidden text-sm">
                    {data.popular.map((r, i) => (
                      <li key={r.id}>
                        <Link href={`/resources/${r.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50">
                          <span className="w-4 font-bold text-brand-600">{i + 1}</span>
                          <span className="min-w-0 flex-1 truncate">{r.title}</span>
                          <span className="text-xs tabular-nums text-slate-500">⬇ {r.download_count}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              {data.questions.length > 0 && (
                <section>
                  <SectionHead title="답을 기다리는 질문" href={`/board?category=${encodeURIComponent(QUESTION)}`} />
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
            <SectionHead title="함께 보면 좋은 사이트" href="/links" more="링크 모음 →" />
            <SiteBanners compact />
          </section>

          <section className="mt-10">
            <SectionHead title="수업 준비 바로가기" href="/links" more="링크 모음 →" />
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

/** 처음 들어온 선생님을 위한 안내 (닫으면 이 브라우저에서는 다시 안 보임) */
function WelcomeGuide() {
  const KEY = 'smh-welcome-closed'
  const [open, setOpen] = useState(false)
  useEffect(() => {
    try {
      setOpen(localStorage.getItem(KEY) !== '1')
    } catch {}
  }, [])
  if (!open) return null
  const steps = [
    ['📂', '자료 올리기', '파일(HWP·PDF·PPT 등)이나 GeoGebra·유튜브 링크를 과목·단원과 함께 올려요.', '/resources/new'],
    ['🗺️', '교육과정 지도', '과목·단원별로 모인 자료를 찾아봐요.', '/curriculum'],
    ['💬', '게시판', '수업 고민을 질문하고, 해결되면 ✔ 해결됨을 눌러요.', '/board'],
    ['∑', '수식 쓰기', '글·댓글에서 $x^2$ 처럼 $ 로 감싸거나 편집기의 수식 버튼을 눌러요.', '/board/new'],
  ]
  return (
    <section className="card mt-4 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-700">처음 오셨나요? 이렇게 써 보세요</h2>
        <button
          onClick={() => {
            setOpen(false)
            try {
              localStorage.setItem(KEY, '1')
            } catch {}
          }}
          className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="안내 닫기"
        >
          닫기 ✕
        </button>
      </div>
      <ul className="mt-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([icon, title, desc, href]) => (
          <li key={title}>
            <Link href={href} className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50" title={desc}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-base text-brand-700">{icon}</span>
              <span className="min-w-0">
                <b className="block text-sm text-slate-900">{title}</b>
                <span className="line-clamp-2 text-xs leading-snug text-slate-500">{desc}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

const todayFmt = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })

/** 머리 아래 "10월 22일 목요일" 한 줄 */
function TodayLine() {
  const [text, setText] = useState('')
  useEffect(() => setText(todayFmt.format(new Date())), [])
  return <p className="mt-0.5 text-sm text-slate-500">{text || ' '}</p>
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
      className="mt-4 flex gap-2"
      role="search"
    >
      <input
        className="input py-2.5 text-base"
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

function SectionHead({ title, href, more = '더 보기 →', badge }: { title: string; href: string; more?: string; badge?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-2 border-b border-slate-200 pb-2">
      <h2 className="text-[15px] font-bold text-slate-900">
        {title}
        {badge && <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 align-middle text-[11px] font-bold text-white">{badge}</span>}
      </h2>
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
