'use client'

import { useCallback, useEffect, useState } from 'react'
import { koError, timeAgo } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import { targetColumns, type Comment, type Target } from '@/lib/types'
import { useAuth } from './AuthProvider'
import { Markdown } from './Markdown'
import { ReportButton } from './ReportButton'

export function CommentSection({ target }: { target: Target }) {
  const { session, isAdmin } = useAuth()
  const uid = session?.user.id
  const cols = targetColumns(target)
  const [key, id] = Object.entries(cols)[0] as [string, number]
  const [comments, setComments] = useState<Comment[] | null>(null)
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, author:profiles(name)')
      .eq(key, id)
      .order('created_at', { ascending: true })
    setComments((data as Comment[]) ?? [])
  }, [key, id])

  useEffect(() => {
    load()
  }, [load])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setBusy(true)
    const { error } = await supabase.from('comments').insert({ ...cols, body: body.trim() })
    setBusy(false)
    if (error) return alert(koError(error))
    setBody('')
    load()
  }

  async function remove(c: Comment) {
    if (!confirm('이 댓글을 지울까요?')) return
    const { error } = await supabase.from('comments').delete().eq('id', c.id)
    if (error) return alert(koError(error))
    setComments((list) => list?.filter((x) => x.id !== c.id) ?? null)
  }

  return (
    <section className="mt-8">
      <h2 className="text-base font-bold text-slate-900">
        댓글 {comments && comments.length > 0 && <span className="text-brand-600">{comments.length}</span>}
      </h2>

      <ul className="mt-3 space-y-3">
        {comments?.map((c) => (
          <li key={c.id} className="card px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <b className="text-slate-700">{c.author?.name ?? '알 수 없음'}</b>
              <span>{timeAgo(c.created_at)}</span>
              <span className="ml-auto flex items-center gap-3">
                {c.author_id !== uid && <ReportButton commentId={c.id} />}
                {(c.author_id === uid || isAdmin) && (
                  <button onClick={() => remove(c)} className="text-xs text-slate-400 hover:text-red-500">
                    삭제
                  </button>
                )}
              </span>
            </div>
            <div className="mt-1">
              <Markdown small>{c.body}</Markdown>
            </div>
          </li>
        ))}
        {comments?.length === 0 && <li className="text-sm text-slate-400">첫 댓글을 남겨 주세요.</li>}
      </ul>

      <form onSubmit={submit} className="mt-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          maxLength={5000}
          placeholder="댓글을 남겨 주세요. 수식은 $x^2$ 처럼 쓰면 돼요."
          className="input"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(e)
          }}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-slate-400">Ctrl+Enter 로 바로 등록</span>
          <button className="btn-primary btn-sm" disabled={busy || !body.trim()}>
            댓글 등록
          </button>
        </div>
      </form>
    </section>
  )
}
