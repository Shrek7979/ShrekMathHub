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
            <LinkCard name="ShrekMath" url={SITE.shrekMathUrl} desc="학생용 하루 한 문제 · 풀이 사진 올리면 AI 첨삭" />
            <LinkCard name="Shrek Edu Insight" url={SITE.newsUrl} desc="오늘의 수학, 수업이 되는 뉴스" />
            <LinkCard name="킬러들의 수학몰" url={SITE.killerShrekMathUrl} desc="수능 킬러 문항 분석 · 대학별 수리논술 · 일본 대학 입시 수학" />
            <LinkCard name="루키들의 수학몰" url={SITE.rookieShrekMathUrl} desc="고1·고3 학력평가와 평가원 기출의 2~3점 문항을 시험처럼 풀고 바로 채점" />
            <LinkCard name="ShrekMath Game" url={SITE.gameUrl} desc="한 판 1분! 쉽고 짧은 중고등 수학 게임 20여 종 (징검다리·두더지·그래프 사진관 등)" />
            <LinkCard name="Square Hunter" url={SITE.squareHuntUrl} desc="합이 TARGET이 되는 네모를 모두 찾는 팀 대항 수학 게임 (진행 화면 · 학생 참가 · 혼자 하기)" />
            <LinkCard name="제로팡" url={SITE.zeroPangUrl} desc="이웃한 숫자 블록을 이어 합이 0이 되면 팡! 1분 정수 덧셈 퍼즐 (쉬움~영재)" />
            <LinkCard name="더지팡팡" url={SITE.dujiPangPangUrl} desc="맞는 두더지만 골라서 팡! 저학년부터 고등까지 즐기는 레이싱 수학 게임" />
            <LinkCard name="수학 아틀리에" url={SITE.mathAtelierUrl} desc="중1~3 교과 개념별 게임과 학년 무관 두뇌 챌린지(랭킹전 · 2인 대결)를 모은 게임 도서관" />
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
        <span className="text-xs text-slate-500">↗</span>
      </div>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
      <p className="mt-2 font-mono text-[11px] text-slate-400">{host}</p>
    </a>
  )
}
