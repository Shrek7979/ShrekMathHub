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
import { fullDate, koError, timeAgo } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import type { Post } from '@/lib/types'

export default function PostDetailPage() {
  return (
    <Gate>
      <Detail />
    </Gate>
  )
}

function Detail() {
  const { id } = useParams<{ id: string }>()
  const pid = Number(id)
  const router = useRouter()
  const { session, isAdmin } = useAuth()
  const [p, setP] = useState<Post | null | undefined>(undefined)

  useEffect(() => {
    supabase
      .from('posts')
      .select('*, author:profiles(name)')
      .eq('id', pid)
      .maybeSingle()
      .then(({ data }) => setP((data as Post | null) ?? null))
  }, [pid])

  if (p === undefined) return <Spinner />
  if (p === null)
    return (
      <Empty
        action={
          <Link href="/board" className="btn-secondary btn-sm">
            게시판으로
          </Link>
        }
      >
        지워졌거나 없는 글이에요.
      </Empty>
    )

  const mine = p.author_id === session?.user.id

  async function remove() {
    if (!p || !confirm('이 글을 지울까요? 댓글도 함께 지워져요.')) return
    const { error } = await supabase.from('posts').delete().eq('id', p.id)
    if (error) return alert(koError(error))
    router.replace('/board')
  }

  return (
    <article className="mx-auto max-w-3xl">
      <Link href={`/board?category=${encodeURIComponent(p.category)}`} className="text-sm text-slate-500 hover:text-slate-800">
        ← {p.category}
      </Link>
      <h1 className="mt-2 text-2xl font-bold leading-snug text-slate-900">{p.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 text-sm text-slate-500">
        <b className="text-slate-700">{p.author?.name ?? '알 수 없음'}</b>
        <span title={fullDate(p.created_at)}>{timeAgo(p.created_at)}</span>
        {p.updated_at.slice(0, 16) !== p.created_at.slice(0, 16) && <span className="text-xs">(고침)</span>}
      </div>

      <div className="card mt-5 px-5 py-4">
        <Markdown>{p.body}</Markdown>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Reactions target={{ postId: p.id }} />
        <div className="ml-auto flex items-center gap-3">
          {!mine && <ReportButton postId={p.id} />}
          {mine && (
            <Link href={`/board/${p.id}/edit`} className="btn-secondary btn-sm">
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

      <CommentSection target={{ postId: p.id }} />
    </article>
  )
}
