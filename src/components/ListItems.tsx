import Link from 'next/link'
import { NOTICE, QUESTION } from '@/lib/curriculum'
import { extOf } from '@/lib/files'
import { timeAgo } from '@/lib/format'
import { countOf, sourceKindOf, type Post, type Resource } from '@/lib/types'

export const RESOURCE_LIST_COLUMNS =
  'id, title, school_level, subject, unit, resource_type, files, link_url, download_count, featured, source_kind, created_at, author:profiles!author_id(name, role), likes(count), comments(count), classroom_uses(count)'

/** 출처 배지. 기본값인 '직접 만듦'은 목록에서는 생략할 수 있다 (always=false) */
export function SourceBadge({ kind, always = false }: { kind?: string | null; always?: boolean }) {
  const s = sourceKindOf(kind)
  if (!always && s.value === 'own') return null
  return (
    <span className={`badge ${s.value === 'own' ? '' : 'bg-sky-50 text-sky-700'}`} title={s.label}>
      {s.icon} {s.short}
    </span>
  )
}

/** 자료 유형마다 다른 색 배지 (자료실 서가의 색 띠처럼) */
const TYPE_BADGE: Record<string, string> = {
  '수업 PPT': 'bg-orange-50 text-orange-700 ring-orange-200',
  '학습지·활동지': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  수행평가: 'bg-rose-50 text-rose-700 ring-rose-200',
  '평가 문항': 'bg-red-50 text-red-700 ring-red-200',
  '수업 지도안·계획': 'bg-sky-50 text-sky-700 ring-sky-200',
  '디지털 도구': 'bg-violet-50 text-violet-700 ring-violet-200',
  '영상·링크': 'bg-indigo-50 text-indigo-700 ring-indigo-200',
}
export const typeBadge = (t: string) => `badge ring-1 ring-inset font-semibold ${TYPE_BADGE[t] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}`

/** 게시판 분류마다 다른 색 배지 */
const CATEGORY_BADGE: Record<string, string> = {
  질문: 'bg-violet-50 text-violet-700',
  '수업 나눔': 'bg-emerald-50 text-emerald-700',
  '평가·수행평가': 'bg-rose-50 text-rose-700',
  '교육과정·연수': 'bg-sky-50 text-sky-700',
  '업무·생활': 'bg-orange-50 text-orange-700',
  자유: 'bg-slate-100 text-slate-600',
}

export const POST_LIST_COLUMNS = 'id, category, title, solved, created_at, author:profiles!author_id(name, role), likes(count), comments(count)'

/** 작성자 이름 (관리자는 표시를 붙여 사칭과 구분) */
export function AuthorName({ author }: { author?: { name: string; role?: string } | null }) {
  return (
    <span className="inline-flex items-center gap-1">
      {author?.name ?? '알 수 없음'}
      {author?.role === 'admin' && <span className="rounded bg-brand-600 px-1 text-[10px] font-bold leading-4 text-white">관리자</span>}
    </span>
  )
}

/**
 * 자료 한 건. compact 면 제목·정보 두 줄 행(첫 화면 목록용, card divide-y 안에 넣어 쓴다),
 * 아니면 분류·제목·작성자 세 줄 카드(자료실 목록용).
 */
export function ResourceItem({ r, compact = false }: { r: Resource; compact?: boolean }) {
  // 파일 정보가 이상해도 목록 전체가 멈추지 않게
  const files = (r.files ?? []).filter((f) => f && typeof f.name === 'string')
  const exts = Array.from(new Set(files.map((f) => extOf(f.name).toUpperCase()).filter(Boolean)))
  if (compact)
    return (
      <li>
        <Link href={`/resources/${r.id}`} className="flex items-start gap-3 px-4 py-3 transition hover:bg-brand-50/50">
          <span className={`mt-0.5 shrink-0 ${typeBadge(r.resource_type)}`}>{r.resource_type}</span>
          <span className="min-w-0 flex-1">
            <span className="line-clamp-1 font-semibold text-slate-900">
              {r.featured && <span className="mr-1 text-amber-500" title="허브 추천">⭐</span>}
              {r.title}
            </span>
            <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
              <span>
                {r.subject}
                {r.unit && ` · ${r.unit}`}
              </span>
              <span className="text-slate-300">|</span>
              <AuthorName author={r.author} />
              <span className="text-slate-300">|</span>
              <span>{timeAgo(r.created_at)}</span>
            </span>
          </span>
        </Link>
      </li>
    )
  return (
    <li>
      <Link href={`/resources/${r.id}`} className="card block px-4 py-3 transition hover:border-brand-300 hover:shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {r.featured && <span className="badge bg-amber-100 text-amber-800">⭐ 추천</span>}
          <span className={typeBadge(r.resource_type)}>{r.resource_type}</span>
          <span className="badge">
            {r.subject}
            {r.unit && ` · ${r.unit}`}
          </span>
          <SourceBadge kind={r.source_kind} />
        </div>
        <p className="mt-1.5 font-semibold text-slate-900">{r.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <AuthorName author={r.author} />
          <span>{timeAgo(r.created_at)}</span>
          {exts.length > 0 && <span className="font-mono text-[11px] text-slate-400">{exts.join(' · ')}</span>}
          {r.link_url && <span className="text-slate-400">🔗 링크</span>}
          <span className="ml-auto flex gap-3 tabular-nums">
            <span title="내려받기">⬇ {r.download_count}</span>
            <span title="좋아요">♡ {countOf(r.likes)}</span>
            <span title="댓글">💬 {countOf(r.comments)}</span>
            <span title="수업에 써 봤어요">🏫 {countOf(r.classroom_uses)}</span>
          </span>
        </div>
      </Link>
    </li>
  )
}

export function PostItem({ p }: { p: Post }) {
  const comments = countOf(p.comments)
  const notice = p.category === NOTICE
  return (
    <li>
      <Link
        href={`/board/${p.id}`}
        className={`flex items-start gap-3 px-4 py-3 transition hover:bg-slate-50 ${notice ? 'bg-amber-50/60' : ''}`}
      >
        <span className={`badge mt-0.5 shrink-0 ${notice ? 'bg-amber-100 font-semibold text-amber-800' : CATEGORY_BADGE[p.category] ?? ''}`}>
          {notice ? '📢 공지' : p.category}
        </span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-1 font-semibold text-slate-900">
            {p.category === QUESTION && p.solved && <span className="mr-1 text-brand-600">✔</span>}
            {p.title}
            {comments > 0 && <span className="ml-1.5 text-sm font-semibold text-brand-600">[{comments}]</span>}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
            <AuthorName author={p.author} />
            <span className="text-slate-300">|</span>
            <span>{timeAgo(p.created_at)}</span>
          </span>
        </span>
      </Link>
    </li>
  )
}
