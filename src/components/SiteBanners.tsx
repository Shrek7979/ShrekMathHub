import Image, { type StaticImageData } from 'next/image'
import { SITE } from '@/lib/site'
import dailyShot from '@/assets/sites/daily.jpg'
import dujiShot from '@/assets/sites/duji.jpg'
import gameShot from '@/assets/sites/game.jpg'
import greensoriShot from '@/assets/sites/greensori.jpg'
import killerShot from '@/assets/sites/killer.jpg'
import newsShot from '@/assets/sites/news.jpg'
import squareShot from '@/assets/sites/square.jpg'
import zeropangShot from '@/assets/sites/zeropang.jpg'
import atelierShot from '@/assets/sites/atelier.jpg'

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
    href: SITE.greensoriUrl,
    icon: '📍',
    name: 'GreenSori Map',
    desc: '그린소리가 담은 카페 · 공간 · 여행의 기록',
    shot: greensoriShot,
    className: 'from-emerald-600 to-teal-500',
  },
  // ↓ 수학 게임
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
    href: SITE.zeroPangUrl,
    icon: '🍬',
    name: '제로팡',
    desc: '이웃한 숫자 블록을 이어 합이 0이 되면 팡! 1분 정수 덧셈 퍼즐',
    shot: zeropangShot,
    className: 'from-pink-500 to-violet-500',
  },
  {
    href: SITE.dujiPangPangUrl,
    icon: '🏁',
    name: '더지팡팡',
    desc: '맞는 두더지만 골라서 팡! 저학년부터 고등까지 레이싱 수학 게임',
    shot: dujiShot,
    className: 'from-red-600 to-amber-500',
  },
  {
    href: SITE.mathAtelierUrl,
    icon: '🎨',
    name: '수학 아틀리에',
    desc: '중1~3 개념별 게임 41개 · 두뇌 챌린지 랭킹전과 2인 대결',
    shot: atelierShot,
    className: 'from-emerald-800 to-amber-600',
  },
]

/** compact: 로그인 뒤 첫 화면 아래쪽에 조금 작게 */
export function SiteBanners({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 ${compact ? 'gap-2.5' : 'gap-3'}`}>
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
            <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-slate-800 shadow transition group-hover:bg-slate-900 group-hover:text-white">
              ↗
            </span>
            {/* 아이콘은 사진 아래 모서리에 얹어 이름 칸을 넓게 쓴다 */}
            <span className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-lg shadow">
              {s.icon}
            </span>
          </span>
          <span className={`flex flex-1 flex-col bg-gradient-to-r text-white ${compact ? 'p-2.5' : 'p-3'} ${s.className}`}>
            <span className={`block truncate font-extrabold tracking-tight ${compact ? 'text-sm' : 'text-[15px]'}`}>{s.name}</span>
            <span className={`mt-0.5 line-clamp-2 break-keep leading-snug text-white/85 ${compact ? 'text-[11px]' : 'text-xs'}`}>
              {s.desc}
            </span>
          </span>
        </a>
      ))}
    </div>
  )
}
