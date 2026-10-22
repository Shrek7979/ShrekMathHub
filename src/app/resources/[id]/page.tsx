'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { ClassroomUses } from '@/components/ClassroomUses'
import { CommentSection } from '@/components/CommentSection'
import { FilePreview, canPreview } from '@/components/FilePreview'
import { Gate } from '@/components/Gate'
import { AuthorName, RESOURCE_LIST_COLUMNS, ResourceItem, SourceBadge } from '@/components/ListItems'
import { Markdown } from '@/components/Markdown'
import { Reactions } from '@/components/Reactions'
import { ReportButton } from '@/components/ReportButton'
import { ShareButton } from '@/components/ShareButton'
import { Empty, LoadError, Spinner } from '@/components/ui'
import { LEVEL_LABEL } from '@/lib/curriculum'
import { embedOf } from '@/lib/embed'
import { downloadFile, extOf, removeFiles } from '@/lib/files'
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
  const [openPreview, setOpenPreview] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    setFailed(false)
    // 주소가 잘못됐으면(숫자가 아님) 묻지 않고 '없는 자료'로
    if (!Number.isInteger(rid) || rid <= 0) return setR(null)
    supabase
      .from('resources')
      .select('*, author:profiles!author_id(name, role)')
      .eq('id', rid)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error('[자료 불러오기 실패]', error)
          return setFailed(true)
        }
        const row = data as Resource | null
        // 파일 정보가 이상한 항목은 빼고 보여 준다
        setR(row ? { ...row, files: (row.files ?? []).filter((f) => f && typeof f.path === 'string' && typeof f.name === 'string') } : null)
      })
  }, [rid, reload])

  if (failed)
    return (
      <LoadError
        onRetry={() => {
          setR(undefined)
          setReload((n) => n + 1)
        }}
      />
    )
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
  const embed = embedOf(r.link_url)

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
    await removeFiles(r.files.map((f) => f.path), r.author_id)
    router.replace('/resources')
  }

  async function toggleFeatured() {
    if (!r) return
    const { error } = await supabase.rpc('admin_feature_resource', { rid: r.id, on_off: !r.featured })
    if (error) return alert(koError(error))
    setR({ ...r, featured: !r.featured })
  }

  return (
    <article className="mx-auto max-w-3xl">
      <Link href={`/resources?level=${r.school_level}&subject=${encodeURIComponent(r.subject)}`} className="text-sm text-slate-500 hover:text-slate-800">
        ← {r.subject} 자료
      </Link>

      <header className="mt-3">
        <div className="flex flex-wrap gap-1.5 text-xs">
          {r.featured && <span className="badge bg-amber-100 text-amber-800">⭐ 허브 추천</span>}
          <span className="badge-brand">{r.resource_type}</span>
          <span className="badge">{LEVEL_LABEL[r.school_level]}</span>
          <Link href={`/resources?level=${r.school_level}&subject=${encodeURIComponent(r.subject)}`} className="badge hover:bg-slate-200">
            {r.subject}
          </Link>
          {r.unit && (
            <Link
              href={`/resources?level=${r.school_level}&subject=${encodeURIComponent(r.subject)}&unit=${encodeURIComponent(r.unit)}`}
              className="badge hover:bg-slate-200"
            >
              {r.unit}
            </Link>
          )}
          <SourceBadge kind={r.source_kind} always />
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-snug text-slate-900">{r.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
          <Link href={`/teachers/${r.author_id}`} className="font-bold text-slate-700 hover:text-brand-700">
            <AuthorName author={r.author} />
          </Link>
          <span>{fullDate(r.created_at)}</span>
          {r.updated_at.slice(0, 16) !== r.created_at.slice(0, 16) && <span className="text-xs">(고침 {fullDate(r.updated_at)})</span>}
          <span className="tabular-nums">⬇ {r.download_count}</span>
        </div>
        {r.source_note && (
          <p className="mt-2 text-sm text-slate-600">
            <span className="mr-1.5 font-semibold text-slate-500">출처</span>
            {r.source_note}
          </p>
        )}
      </header>

      {(r.files.length > 0 || r.link_url) && (
        <section className="card mt-5 divide-y divide-slate-100 overflow-hidden">
          {r.files.map((f) => (
            <div key={f.path}>
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-md bg-slate-100 font-mono text-[11px] font-bold uppercase text-slate-500">
                  {extOf(f.name) || 'file'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{f.name}</p>
                  <p className="text-xs text-slate-500">{fileSize(f.size)}</p>
                </div>
                {canPreview(f) && (
                  <button
                    className="btn-ghost btn-sm"
                    aria-expanded={openPreview === f.path}
                    onClick={() => setOpenPreview((p) => (p === f.path ? null : f.path))}
                  >
                    {openPreview === f.path ? '미리보기 닫기' : '미리보기'}
                  </button>
                )}
                <button className="btn-primary btn-sm" onClick={() => download(f)} disabled={busyFile === f.path}>
                  {busyFile === f.path ? '받는 중…' : '내려받기'}
                </button>
              </div>
              {openPreview === f.path && <FilePreview file={f} />}
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
              <span className="text-xs text-slate-500">새 창 ↗</span>
            </a>
          )}
        </section>
      )}

      {embed && (
        <section className="mt-5">
          <p className="mb-2 text-xs font-semibold text-slate-500">{embed.kind} 바로 보기</p>
          <div className="aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            <iframe
              src={embed.src}
              title={`${r.title} (${embed.kind})`}
              loading="lazy"
              allow="fullscreen; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </section>
      )}

      {r.description && (
        <section className="mt-6">
          <Markdown>{r.description}</Markdown>
        </section>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
        <Reactions target={{ resourceId: r.id }} />
        <ClassroomUses resourceId={r.id} />
        <ShareButton title={r.title} />
        <div className="ml-auto flex flex-wrap items-center gap-3">
          {!mine && <ReportButton resourceId={r.id} />}
          {isAdmin && (
            <button className="btn-secondary btn-sm" onClick={toggleFeatured}>
              {r.featured ? '⭐ 추천 해제' : '⭐ 허브 추천'}
            </button>
          )}
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

      <RelatedResources current={r} />
    </article>
  )
}

/** 같은 과목(같은 단원 먼저)의 다른 자료 */
function RelatedResources({ current }: { current: Resource }) {
  const [items, setItems] = useState<Resource[] | null>(null)
  const [unitMatch, setUnitMatch] = useState(false)

  useEffect(() => {
    supabase
      .from('resources')
      .select(RESOURCE_LIST_COLUMNS)
      .eq('school_level', current.school_level)
      .eq('subject', current.subject)
      .neq('id', current.id)
      .order('created_at', { ascending: false })
      .limit(12)
      .then(({ data }) => {
        const rows = (data as unknown as Resource[]) ?? []
        const sameUnit = rows.filter((x) => current.unit && x.unit === current.unit)
        const others = rows.filter((x) => !sameUnit.includes(x))
        setItems([...sameUnit, ...others].slice(0, 4))
        setUnitMatch(sameUnit.length > 0)
      })
  }, [current.id, current.school_level, current.subject, current.unit])

  if (!items || items.length === 0) return null
  return (
    <section className="mt-10 border-t border-slate-200 pt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold text-slate-900">
          {current.subject}
          {unitMatch && ` · ${current.unit}`} 다른 자료
        </h2>
        <Link
          href={`/resources?level=${current.school_level}&subject=${encodeURIComponent(current.subject)}`}
          className="text-sm text-slate-500 hover:text-brand-700"
        >
          더 보기 →
        </Link>
      </div>
      <ul className="grid gap-2 md:grid-cols-2">
        {items.map((x) => (
          <ResourceItem key={x.id} r={x} />
        ))}
      </ul>
    </section>
  )
}
