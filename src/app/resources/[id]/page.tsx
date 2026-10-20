'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { CommentSection } from '@/components/CommentSection'
import { Gate } from '@/components/Gate'
import { Markdown } from '@/components/Markdown'
import { Reactions } from '@/components/Reactions'
import { ReportButton } from '@/components/ReportButton'
import { Empty, Spinner } from '@/components/ui'
import { LEVEL_LABEL } from '@/lib/curriculum'
import { canPreview, downloadFile, extOf, previewFile, removeFiles } from '@/lib/files'
import { fileSize, fullDate, koError } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import type { FileInfo, Resource } from '@/lib/types'

export default function ResourceDetailPage() {
  return (
    <Gate>
      <Detail />
    </Gate>
  )
}

function Detail() {
  const { id } = useParams<{ id: string }>()
  const rid = Number(id)
  const router = useRouter()
  const { session, isAdmin } = useAuth()
  const [r, setR] = useState<Resource | null | undefined>(undefined)
  const [busyFile, setBusyFile] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('resources')
      .select('*, author:profiles(name)')
      .eq('id', rid)
      .maybeSingle()
      .then(({ data }) => setR((data as Resource | null) ?? null))
  }, [rid])

  if (r === undefined) return <Spinner />
  if (r === null)
    return (
      <Empty
        action={
          <Link href="/resources" className="btn-secondary btn-sm">
            자료실로
          </Link>
        }
      >
        지워졌거나 없는 자료예요.
      </Empty>
    )

  const mine = r.author_id === session?.user.id

  async function download(f: FileInfo) {
    setBusyFile(f.path)
    try {
      await downloadFile(f)
      await supabase.rpc('count_download', { rid })
      setR((x) => (x ? { ...x, download_count: x.download_count + 1 } : x))
    } catch (e) {
      alert(koError(e))
    } finally {
      setBusyFile(null)
    }
  }

  async function remove() {
    if (!r || !confirm('이 자료를 지울까요? 첨부 파일과 댓글도 함께 지워져요.')) return
    const { error } = await supabase.from('resources').delete().eq('id', r.id)
    if (error) return alert(koError(error))
    await removeFiles(r.files.map((f) => f.path))
    router.replace('/resources')
  }

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/resources" className="text-sm text-slate-500 hover:text-slate-800">
        ← 자료실
      </Link>

      <header className="mt-3">
        <div className="flex flex-wrap gap-1.5 text-xs">
          <span className="badge-brand">{r.resource_type}</span>
          <span className="badge">{LEVEL_LABEL[r.school_level]}</span>
          <span className="badge">{r.subject}</span>
          {r.unit && <span className="badge">{r.unit}</span>}
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-snug text-slate-900">{r.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
          <b className="text-slate-700">{r.author?.name ?? '알 수 없음'}</b>
          <span>{fullDate(r.created_at)}</span>
          {r.updated_at.slice(0, 16) !== r.created_at.slice(0, 16) && <span className="text-xs">(고침 {fullDate(r.updated_at)})</span>}
          <span className="tabular-nums">⬇ {r.download_count}</span>
        </div>
      </header>

      {(r.files.length > 0 || r.link_url) && (
        <section className="card mt-5 divide-y divide-slate-100">
          {r.files.map((f) => (
            <div key={f.path} className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-md bg-slate-100 font-mono text-[11px] font-bold uppercase text-slate-500">
                {extOf(f.name) || 'file'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{f.name}</p>
                <p className="text-xs text-slate-400">{fileSize(f.size)}</p>
              </div>
              {canPreview(f) && (
                <button className="btn-ghost btn-sm" onClick={() => previewFile(f).catch((e) => alert(koError(e)))}>
                  미리보기
                </button>
              )}
              <button className="btn-primary btn-sm" onClick={() => download(f)} disabled={busyFile === f.path}>
                {busyFile === f.path ? '받는 중…' : '내려받기'}
              </button>
            </div>
          ))}
          {r.link_url && (
            <a
              href={r.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50"
            >
              <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-md bg-brand-50 text-base">🔗</span>
              <span className="min-w-0 flex-1 truncate text-brand-700">{r.link_url}</span>
              <span className="text-xs text-slate-400">새 창 ↗</span>
            </a>
          )}
        </section>
      )}

      {r.description && (
        <section className="mt-6">
          <Markdown>{r.description}</Markdown>
        </section>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
        <Reactions target={{ resourceId: r.id }} />
        <div className="ml-auto flex items-center gap-3">
          {!mine && <ReportButton resourceId={r.id} />}
          {mine && (
            <Link href={`/resources/${r.id}/edit`} className="btn-secondary btn-sm">
              고치기
            </Link>
          )}
          {(mine || isAdmin) && (
            <button className="btn-danger btn-sm" onClick={remove}>
              지우기
            </button>
          )}
        </div>
      </div>

      <CommentSection target={{ resourceId: r.id }} />
    </article>
  )
}
