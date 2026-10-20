'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BOARD_CATEGORIES } from '@/lib/curriculum'
import { koError } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import type { Post } from '@/lib/types'
import { MarkdownEditor } from './MarkdownEditor'
import { ErrorBox } from './ui'

/** 게시판 글쓰기 / 고치기 */
export function PostForm({ initial, defaultCategory }: { initial?: Post; defaultCategory?: string }) {
  const router = useRouter()
  const [category, setCategory] = useState(
    initial?.category ?? (defaultCategory && BOARD_CATEGORIES.includes(defaultCategory) ? defaultCategory : '질문'),
  )
  const [title, setTitle] = useState(initial?.title ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return setError('제목을 넣어 주세요.')
    if (!body.trim()) return setError('내용을 넣어 주세요.')
    setBusy(true)
    const row = { category, title: title.trim(), body: body.trim() }
    const { data, error } = initial
      ? await supabase.from('posts').update(row).eq('id', initial.id).select('id').single()
      : await supabase.from('posts').insert(row).select('id').single()
    setBusy(false)
    if (error) return setError(koError(error))
    router.push(`/board/${data.id}`)
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <span className="label">분류</span>
        <div className="flex flex-wrap gap-2">
          {BOARD_CATEGORIES.map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)} className={`chip ${category === c ? 'chip-on' : ''}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="title">
          제목
        </label>
        <input id="title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
      </div>
      <div>
        <label className="label" htmlFor="body">
          내용
        </label>
        <MarkdownEditor
          id="body"
          value={body}
          onChange={setBody}
          rows={14}
          placeholder={'수업 고민, 질문, 경험을 자유롭게 나눠 주세요.\n수식 예) $\\frac{d}{dx}x^n = nx^{n-1}$'}
        />
        <p className="mt-1.5 text-xs text-slate-400">학생 이름이나 성적 같은 개인정보는 쓰지 말아 주세요.</p>
      </div>
      <ErrorBox>{error}</ErrorBox>
      <div className="flex justify-end gap-3">
        <button type="button" className="btn-ghost" onClick={() => router.back()}>
          취소
        </button>
        <button className="btn-primary" disabled={busy}>
          {initial ? '고친 내용 저장' : '글 올리기'}
        </button>
      </div>
    </form>
  )
}
