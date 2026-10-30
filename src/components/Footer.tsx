import Link from 'next/link'
import { SITE } from '@/lib/site'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {SITE.name} · {SITE.tagline}
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/rules" className="hover:text-slate-800">
            이용 규칙
          </Link>
          <Link href="/privacy" className="hover:text-slate-800">
            개인정보처리방침
          </Link>
          <Link href="/links" className="hover:text-slate-800">
            링크 모음
          </Link>
          <a href={SITE.newsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-slate-800">
            교육 뉴스 · Shrek Edu Insight ↗
          </a>
          <a href={SITE.shrekMathUrl} target="_blank" rel="noopener noreferrer" className="hover:text-slate-800">
            학생용 하루 한 문제 · ShrekMath ↗
          </a>
          <a href={SITE.killerShrekMathUrl} target="_blank" rel="noopener noreferrer" className="hover:text-slate-800">
            수능·논술 · 킬러들의 수학몰 ↗
          </a>
          <a href={SITE.graphGameUrl} target="_blank" rel="noopener noreferrer" className="hover:text-slate-800">
            함수 그래프 게임 · 그래프 사진관 ↗
          </a>
        </nav>
      </div>
    </footer>
  )
}
