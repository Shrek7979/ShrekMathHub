import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>Shrek Math Hub · 중·고 수학 선생님들의 나눔터</p>
        <nav className="flex gap-4">
          <Link href="/rules" className="hover:text-slate-800">
            이용 규칙
          </Link>
          <a
            href="https://shrek7979.github.io/ShrekEduInsight/?s=math"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-800"
          >
            교육 뉴스 · Shrek Edu Insight ↗
          </a>
        </nav>
      </div>
    </footer>
  )
}
