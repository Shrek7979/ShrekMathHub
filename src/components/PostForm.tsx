'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BOARD_CATEGORIES, NOTICE } from '@/lib/curriculum'
import { koError } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import type { Post } from '@/lib/types'
import { useDraft } from '@/lib/useDraft'
import { useAuth } from './AuthProvider'
import { MarkdownEditor } from './MarkdownEditor'
import { DraftNotice, ErrorBox } from './ui'

/** 게시판 글쓰기 / 고치기 */
export function PostForm({ initial, defaultCategory, defaultTitle }: { initial?: Post; defaultCategory?: string; defaultTitle?: string }) {
  const router = useRouter()
  const { isAdmin } = useAuth()
  // 공지는 관리자만 (데이터베이스 규칙도 같은 내용으로 막고 있음)
  const categories = isAdmin ? [NOTICE, ...BOARD_CATEGORIES] : BOARD_CATEGORIES
  const [category, setCategory] = useState(
    initial?.category ?? (defaultCategory && categories.includes(defaultCategory) ? defaultCategory : '질문'),
  )
  const [title, setTitle] = useState(initial?.title ?? defaultTitle?.slice(0, 120) ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  // 새 글은 쓰는 동안 이 브라우저에 임시 저장 (고치기·자료 요청 글은 제외)
  const draft = useDraft(
    'smh-draft-post',
    { category, title, body },
    (d) => {
      if (categories.includes(d.category)) setCategory(d.category)
      setTitle(d.title ?? '')
      setBody(d.body ?? '')
    },
    !initial && !defaultTitle,
  )

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return setError('제목을 넣어 주세요.')
    if (!body.trim()) return setError('내용을 넣어 주세요.')
    setBusy(true)
    const row = { category, title: title.trim(), body: body.trim() }
    const { data, error } = initial
      ? await supabase.from('posts').update(row).eq('id', initial.id).select('id').maybeSingle()
      : await supabase.from('posts').insert(row).select('id').maybeSingle()
    setBusy(false)
    if (error) return setError(koError(error))
    if (!data) return setError('저장하지 못했어요. 권한이 없거나 이미 지워진 글이에요.')
    draft.clear()
    router.push(`/board/${data.id}`)
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {draft.restored && (
        <DraftNotice
          onDiscard={() => {
            draft.clear()
            setTitle('')
            setBody('')
          }}
        />
      )}
      <div>
        <span className="label">분류</span>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)} className={`chip ${category === c ? 'chip-on' : ''}`}>
              {c === NOTICE ? '📢 공지' : c}
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
          maxLength={30000}
          placeholder={'수업 고민, 질문, 경험을 자유롭게 나눠 주세요.\n수식 예) $\\frac{d}{dx}x^n = nx^{n-1}$'}
        />
        <p className="mt-1.5 text-xs text-slate-500">학생 이름이나 성적 같은 개인정보는 쓰지 말아 주세요.</p>
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
