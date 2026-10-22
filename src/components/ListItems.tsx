import Link from 'next/link'
import { NOTICE, QUESTION } from '@/lib/curriculum'
import { extOf } from '@/lib/files'
import { timeAgo } from '@/lib/format'
import { countOf, type Post, type Resource } from '@/lib/types'

export const RESOURCE_LIST_COLUMNS =
  'id, title, school_level, subject, unit, resource_type, files, link_url, download_count, featured, created_at, author:profiles!author_id(name, role), likes(count), comments(count)'

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
 * 자료 한 건. compact 면 한 줄 행(첫 화면 목록용, card divide-y 안에 넣어 쓴다),
 * 아니면 분류·제목·작성자 세 줄 카드(자료실 목록용).
 */
export function ResourceItem({ r, compact = false }: { r: Resource; compact?: boolean }) {
  // 파일 정보가 이상해도 목록 전체가 멈추지 않게
  const files = (r.files ?? []).filter((f) => f && typeof f.name === 'string')
  const exts = Array.from(new Set(files.map((f) => extOf(f.name).toUpperCase()).filter(Boolean)))
  if (compact)
    return (
      <li>
        <Link href={`/resources/${r.id}`} className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-slate-50">
          <span className="badge-brand shrink-0">{r.resource_type}</span>
          <span className="min-w-0 flex-1 truncate font-medium text-slate-900">
            {r.featured && <span className="mr-1 text-amber-500" title="허브 추천">⭐</span>}
            {r.title}
          </span>
          <span className="hidden shrink-0 text-xs text-slate-500 md:inline">
            {r.subject}
            {r.unit && ` · ${r.unit}`}
          </span>
          <span className="hidden w-20 shrink-0 truncate text-xs text-slate-500 sm:inline">
            <AuthorName author={r.author} />
          </span>
          <span className="w-14 shrink-0 text-right text-xs text-slate-500">{timeAgo(r.created_at)}</span>
        </Link>
      </li>
    )
  return (
    <li>
      <Link href={`/resources/${r.id}`} className="card block px-4 py-3 transition hover:border-brand-300 hover:shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {r.featured && <span className="badge bg-amber-100 text-amber-800">⭐ 추천</span>}
          <span className="badge-brand">{r.resource_type}</span>
          <span className="badge">
            {r.subject}
            {r.unit && ` · ${r.unit}`}
          </span>
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
        className={`flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50 ${notice ? 'bg-amber-50/60' : ''}`}
      >
        <span className={`badge shrink-0 ${notice ? 'bg-amber-100 font-semibold text-amber-800' : ''}`}>
          {notice ? '📢 공지' : p.category}
        </span>
        {p.category === QUESTION && p.solved && <span className="badge shrink-0 bg-brand-50 text-brand-700">✔ 해결</span>}
        <span className="min-w-0 flex-1 truncate font-medium text-slate-900">
          {p.title}
          {comments > 0 && <span className="ml-1.5 text-sm font-semibold text-brand-600">[{comments}]</span>}
        </span>
        <span className="hidden shrink-0 text-xs text-slate-500 sm:inline">
          <AuthorName author={p.author} />
        </span>
        <span className="w-16 shrink-0 text-right text-xs text-slate-500">{timeAgo(p.created_at)}</span>
      </Link>
    </li>
  )
}
