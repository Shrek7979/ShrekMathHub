import { SITE } from '@/lib/site'

/** 첫 화면의 함께 보면 좋은 사이트 배너 */
const SITES = [
  {
    href: SITE.shrekMathUrl,
    icon: '🎓',
    name: 'ShrekMath',
    desc: '학생용 하루 한 문제 · 풀이 사진 올리면 AI 첨삭',
    className: 'from-brand-700 to-brand-500',
  },
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

/** compact: 첫 화면 아래쪽에 작게 (양옆 패널에 이미 보이는 사이트라 크게 둘 필요가 없음) */
export function SiteBanners({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 xl:grid-cols-3 ${compact ? 'gap-2' : ''}`}>
      {SITES.map((s) => (
        <a
          key={s.href}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`group flex items-center rounded-xl bg-gradient-to-r text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
            compact ? 'gap-3 px-4 py-2.5' : 'gap-4 px-5 py-4'
          } ${s.className}`}
        >
          <span className={`flex shrink-0 items-center justify-center rounded-lg bg-white/15 ${compact ? 'h-8 w-8 text-lg' : 'h-11 w-11 text-2xl'}`}>
            {s.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className={`block font-bold ${compact ? 'text-sm' : ''}`}>{s.name}</span>
            <span className={`block leading-snug text-white/80 sm:truncate ${compact ? 'text-xs' : 'text-sm'}`}>{s.desc}</span>
          </span>
          <span className="shrink-0 text-sm font-semibold text-white/80 transition group-hover:translate-x-0.5 group-hover:text-white">
            <span className="hidden sm:inline">바로 가기 </span>↗
          </span>
        </a>
      ))}
    </div>
  )
}
