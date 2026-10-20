import Link from 'next/link'
import { extOf } from '@/lib/files'
import { timeAgo } from '@/lib/format'
import { countOf, type Post, type Resource } from '@/lib/types'

export const RESOURCE_LIST_COLUMNS =
  'id, title, school_level, subject, unit, resource_type, files, link_url, download_count, created_at, author:profiles(name), likes(count), comments(count)'

export const POST_LIST_COLUMNS = 'id, category, title, created_at, author:profiles(name), likes(count), comments(count)'

export function ResourceItem({ r }: { r: Resource }) {
  const exts = Array.from(new Set(r.files.map((f) => extOf(f.name).toUpperCase()).filter(Boolean)))
  return (
    <li>
      <Link href={`/resources/${r.id}`} className="card block px-4 py-3 transition hover:border-brand-300 hover:shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="badge-brand">{r.resource_type}</span>
          <span className="badge">
            {r.subject}
            {r.unit && ` · ${r.unit}`}
          </span>
        </div>
        <p className="mt-1.5 font-semibold text-slate-900">{r.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span>{r.author?.name ?? '알 수 없음'}</span>
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
  return (
    <li>
      <Link href={`/board/${p.id}`} className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50">
        <span className="badge shrink-0">{p.category}</span>
        <span className="min-w-0 flex-1 truncate font-medium text-slate-900">
          {p.title}
          {comments > 0 && <span className="ml-1.5 text-sm font-semibold text-brand-600">[{comments}]</span>}
        </span>
        <span className="hidden shrink-0 text-xs text-slate-500 sm:inline">{p.author?.name ?? '알 수 없음'}</span>
        <span className="w-16 shrink-0 text-right text-xs text-slate-400">{timeAgo(p.created_at)}</span>
      </Link>
    </li>
  )
}
