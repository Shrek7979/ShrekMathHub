import Image, { type StaticImageData } from 'next/image'
import { SITE } from '@/lib/site'
import dailyShot from '@/assets/sites/daily.jpg'
import gameShot from '@/assets/sites/game.jpg'
import greensoriShot from '@/assets/sites/greensori.jpg'
import killerShot from '@/assets/sites/killer.jpg'
import newsShot from '@/assets/sites/news.jpg'
import squareShot from '@/assets/sites/square.jpg'

type Site = { href: string; icon: string; name: string; desc: string; shot: StaticImageData; className: string }

/**
 * 첫 화면의 함께 보면 좋은 사이트 배너.
 * shot 은 각 사이트 첫 화면을 1280×800 으로 찍어 16:10 으로 자른 것 (사이트 모습이 크게 바뀌면 다시 찍기).
 */
const SITES: Site[] = [
  {
    href: SITE.shrekMathUrl,
    icon: '🎓',
    name: 'ShrekMath',
    desc: '학생용 하루 한 문제 · 풀이 사진 올리면 AI 첨삭',
    shot: dailyShot,
    className: 'from-brand-700 to-brand-500',
  },
  {
    href: SITE.newsUrl,
    icon: '📰',
    name: 'Shrek Edu Insight',
    desc: '오늘의 수학, 수업이 되는 뉴스',
    shot: newsShot,
    className: 'from-slate-800 to-indigo-700',
  },
  {
    href: SITE.killerShrekMathUrl,
    icon: '🎯',
    name: '킬러들의 수학몰',
    desc: '수능 킬러 문항 분석 · 대학별 수리논술 · 일본 대학 입시 수학',
    shot: killerShot,
    className: 'from-rose-700 to-orange-500',
  },
  {
    href: SITE.gameUrl,
    icon: '🎮',
    name: 'ShrekMath Game',
    desc: '수학게임 · 한 판 1분! 쉽고 짧은 중고등 수학 게임 모음',
    shot: gameShot,
    className: 'from-violet-700 to-fuchsia-500',
  },
  {
    href: SITE.squareHuntUrl,
    icon: '💎',
    name: 'Square Hunter',
    desc: '합이 TARGET이 되는 네모를 모두 찾는 팀 대항 수학 게임',
    shot: squareShot,
    className: 'from-slate-900 to-amber-700',
  },
  {
    href: SITE.greensoriUrl,
    icon: '📍',
    name: 'GreenSori Map',
    desc: '그린소리가 담은 카페 · 공간 · 여행의 기록',
    shot: greensoriShot,
    className: 'from-emerald-600 to-teal-500',
  },
]

/** compact: 로그인 뒤 첫 화면 아래쪽에 조금 작게 */
export function SiteBanners({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 ${compact ? 'gap-2.5' : 'gap-3 sm:gap-4'}`}>
      {SITES.map((s) => (
        <a
          key={s.href}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`${s.name} — ${s.desc}`}
          className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl"
        >
          {/* 사이트 첫 화면 미리보기 */}
          <span className="relative block aspect-[16/10] overflow-hidden bg-slate-900">
            <Image
              src={s.shot}
              alt={`${s.name} 첫 화면`}
              fill
              sizes="(min-width: 768px) 33vw, 50vw"
              placeholder="blur"
              className="object-cover object-top transition duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
            <span className="absolute left-2 top-2 hidden max-w-[75%] truncate rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur sm:block">
              {new URL(s.href).host}
            </span>
            <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-slate-800 shadow transition group-hover:bg-slate-900 group-hover:text-white">
              ↗
            </span>
          </span>
          <span className={`flex flex-1 items-start gap-2.5 bg-gradient-to-r text-white ${compact ? 'p-2.5' : 'p-3 sm:p-3.5'} ${s.className}`}>
            <span
              // 휴대폰의 두 줄 배치에서는 이름이 잘리지 않게 아이콘을 뺀다
              className={`hidden shrink-0 items-center justify-center rounded-lg bg-white/20 sm:flex ${
                compact ? 'h-8 w-8 text-base' : 'h-9 w-9 text-lg sm:h-10 sm:w-10 sm:text-xl'
              }`}
            >
              {s.icon}
            </span>
            <span className="min-w-0">
              <span className={`block truncate font-extrabold tracking-tight ${compact ? 'text-sm' : 'text-[15px] sm:text-base'}`}>
                {s.name}
              </span>
              <span className={`mt-0.5 line-clamp-2 break-keep leading-snug text-white/85 ${compact ? 'text-[11px]' : 'text-xs sm:text-[13px]'}`}>
                {s.desc}
              </span>
            </span>
          </span>
        </a>
      ))}
    </div>
  )
}
