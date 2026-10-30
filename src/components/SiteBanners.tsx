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
    href: SITE.killerShrekMathUrl,
    icon: '🎯',
    name: '킬러들의 수학몰',
    desc: '수능 킬러 문항 분석 · 대학별 수리논술 · 일본 대학 입시 수학',
    className: 'from-rose-700 to-orange-500',
  },
  {
    href: SITE.graphGameUrl,
    icon: '📸',
    name: '그래프 사진관',
    desc: '식에 맞는 그래프를 찰칵! 중1~고1 함수 그래프 게임',
    className: 'from-sky-600 to-violet-600',
  },
  {
    href: SITE.greensoriUrl,
    icon: '📍',
    name: 'GreenSori Map',
    desc: '그린소리가 담은 카페 · 공간 · 여행의 기록',
    className: 'from-emerald-600 to-teal-500',
  },
]

/** compact: 로그인 뒤 첫 화면 아래쪽에 작게 (양옆 패널에 이미 보이는 사이트라 크게 둘 필요가 없음) */
export function SiteBanners({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid grid-cols-2 ${compact ? 'gap-2 md:grid-cols-3 xl:grid-cols-5' : 'gap-3 md:grid-cols-3 xl:grid-cols-5'}`}>
      {SITES.map((s) => (
        <a
          key={s.href}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`${s.name} — ${s.desc}`}
          className={`group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg ${
            compact ? 'p-3.5' : 'p-4'
          } ${s.className}`}
        >
          {/* 배경 장식 원 */}
          <span className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <span className="flex items-center justify-between">
            <span
              className={`flex items-center justify-center rounded-xl bg-white/20 ${
                compact ? 'h-8 w-8 text-lg' : 'h-10 w-10 text-xl sm:h-11 sm:w-11 sm:text-2xl'
              }`}
            >
              {s.icon}
            </span>
            <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-sm font-bold transition group-hover:bg-white group-hover:text-slate-900">
              ↗
            </span>
          </span>
          <span className={`block truncate font-extrabold tracking-tight ${compact ? 'mt-2 text-[15px]' : 'mt-3 text-base'}`}>
            {s.name}
          </span>
          <span
            className={`mt-1 line-clamp-2 break-keep leading-snug text-white/85 ${compact ? 'text-xs' : 'text-[13px]'}`}
          >
            {s.desc}
          </span>
        </a>
      ))}
    </div>
  )
}
