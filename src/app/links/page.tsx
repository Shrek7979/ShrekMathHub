import type { Metadata } from 'next'
import { LINK_GROUPS } from '@/lib/links'
import { SITE } from '@/lib/site'

export const metadata: Metadata = { title: '수학교육 링크 모음' }

export default function LinksPage() {
  return (
    <div>
      <h1 className="page-title">수학교육 링크 모음</h1>
      <p className="mt-1 text-sm text-slate-500">수업 준비할 때 자주 찾는 곳을 한곳에 모았어요. 모두 새 창으로 열려요.</p>

      <div className="mt-6 space-y-8">
        <section>
          <h2 className="mb-3 text-sm font-bold text-slate-500">📰 Shrek 사이트</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <LinkCard name="Shrek Edu Insight" url={SITE.newsUrl} desc="오늘의 수학, 수업이 되는 뉴스" />
            <LinkCard name="GreenSori Map" url={SITE.greensoriUrl} desc="그린소리가 담은 카페 · 공간 · 여행의 기록" />
          </div>
        </section>
        {LINK_GROUPS.map((g) => (
          <section key={g.title}>
            <h2 className="mb-3 text-sm font-bold text-slate-500">
              {g.icon} {g.title}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {g.links.map((l) => (
                <LinkCard key={l.url} {...l} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function LinkCard({ name, url, desc }: { name: string; url: string; desc: string }) {
  const host = new URL(url).hostname.replace(/^www\./, '')
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="card group block p-4 transition hover:border-brand-300 hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-slate-900 group-hover:text-brand-700">{name}</p>
        <span className="text-xs text-slate-400">↗</span>
      </div>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
      <p className="mt-2 font-mono text-[11px] text-slate-400">{host}</p>
    </a>
  )
}
