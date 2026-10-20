'use client'

import { useState } from 'react'
import { koError } from '@/lib/format'
import { supabase } from '@/lib/supabase'

const REASONS = ['저작권 문제(교과서·문제집 스캔 등)', '학생 개인정보 포함', '시행 전 평가 문항', '광고·홍보', '부적절한 내용']

type Props = { resourceId?: number; postId?: number; commentId?: number }

/** 관리자에게 알리기 */
export function ReportButton(props: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState(REASONS[0])
  const [detail, setDetail] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function submit() {
    setBusy(true)
    const { error } = await supabase.from('reports').insert({
      resource_id: props.resourceId ?? null,
      post_id: props.postId ?? null,
      comment_id: props.commentId ?? null,
      reason: detail.trim() ? `${reason} — ${detail.trim()}`.slice(0, 500) : reason,
    })
    setBusy(false)
    if (error) return alert(koError(error))
    setDone(true)
    setOpen(false)
  }

  if (done) return <span className="text-xs text-slate-400">신고했어요</span>

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs text-slate-400 hover:text-red-500">
        신고
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div className="card w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h2 className="font-bold text-slate-900">관리자에게 알리기</h2>
            <p className="mt-1 text-xs text-slate-500">작성자에게는 누가 신고했는지 보이지 않아요.</p>
            <div className="mt-4 space-y-2">
              {REASONS.map((r) => (
                <label key={r} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="accent-brand-600" />
                  {r}
                </label>
              ))}
            </div>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={2}
              maxLength={300}
              placeholder="덧붙일 말 (선택)"
              className="input mt-3"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-ghost btn-sm" onClick={() => setOpen(false)}>
                취소
              </button>
              <button className="btn-primary btn-sm" onClick={submit} disabled={busy}>
                신고하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
