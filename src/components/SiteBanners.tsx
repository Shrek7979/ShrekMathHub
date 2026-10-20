import { SITE } from '@/lib/site'

/** 첫 화면의 함께 보면 좋은 사이트 배너 */
const SITES = [
  {
    href: SITE.newsUrl,
    icon: '📰',
    name: 'Shrek Edu Insight',
    desc: '오늘의 수학, 수업이 되는 뉴스',
    className: 'from-slate-800 to-indigo-700',
  },
  {
    href: SITE.greensoriUrl,
    icon: '📍',
    name: 'GreenSori Map',
    desc: '그린소리가 담은 카페 · 공간 · 여행의 기록',
    className: 'from-emerald-600 to-teal-500',
  },
]

export function SiteBanners() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {SITES.map((s) => (
        <a
          key={s.href}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`group flex items-center gap-4 rounded-xl bg-gradient-to-r px-5 py-4 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${s.className}`}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/15 text-2xl">{s.icon}</span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold">{s.name}</span>
            <span className="block text-sm leading-snug text-white/80 sm:truncate">{s.desc}</span>
          </span>
          <span className="shrink-0 text-sm font-semibold text-white/80 transition group-hover:translate-x-0.5 group-hover:text-white">
            <span className="hidden sm:inline">바로 가기 </span>↗
          </span>
        </a>
      ))}
    </div>
  )
}
