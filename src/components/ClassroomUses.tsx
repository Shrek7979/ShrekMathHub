'use client'

import { useCallback, useEffect, useState } from 'react'
import { koError, timeAgo } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import type { ClassroomUse } from '@/lib/types'
import { useAuth } from './AuthProvider'
import { AuthorName } from './ListItems'

/**
 * "🏫 수업에 써 봤어요" 버튼과 후기 목록.
 * 자료 상세의 반응 줄(flex-wrap) 안에 넣는다: 버튼은 그 줄에 놓이고,
 * 후기 입력칸과 "수업에 쓴 선생님 N명" 목록은 basis-full 로 다음 줄 전체를 차지한다.
 * 한 사람이 한 자료에 한 번. 다시 누르면 취소(후기도 함께 지워짐).
 */
export function ClassroomUses({ resourceId }: { resourceId: number }) {
  const { session } = useAuth()
  const uid = session?.user.id
  const [uses, setUses] = useState<ClassroomUse[] | null>(null)
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('classroom_uses')
      .select('id, user_id, resource_id, note, created_at, author:profiles!user_id(name, role)')
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: false })
    if (error) return console.error('[수업 후기 불러오기 실패]', error)
    setUses((data as unknown as ClassroomUse[]) ?? [])
  }, [resourceId])

  useEffect(() => {
    load()
  }, [load])

  const mine = uses?.find((u) => u.user_id === uid)
  const count = uses?.length ?? 0

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!uid || busy) return
    setBusy(true)
    const { error } = await supabase.from('classroom_uses').insert({ resource_id: resourceId, note: note.trim() })
    setBusy(false)
    // 이미 눌러 둔 상태(중복)라면 화면만 맞춘다
    if (error && error.code !== '23505') return alert(koError(error))
    setNote('')
    setOpen(false)
    load()
  }

  async function cancel() {
    if (!uid || busy) return
    if (mine?.note && !confirm('남긴 한 줄 후기도 함께 지워져요. 취소할까요?')) return
    setBusy(true)
    const { error } = await supabase.from('classroom_uses').delete().eq('resource_id', resourceId).eq('user_id', uid)
    setBusy(false)
    if (error) return alert(koError(error))
    load()
  }

  const showForm = open && !mine

  return (
    <>
      <button
        onClick={() => (mine ? cancel() : setOpen((o) => !o))}
        disabled={busy || !uses}
        aria-pressed={!!mine}
        aria-expanded={showForm}
        title={mine ? '다시 누르면 취소돼요' : '이 자료를 실제 수업에 써 봤다면 눌러 주세요'}
        className={`btn btn-sm border ${
          mine ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
        }`}
      >
        🏫 수업에 써 봤어요{mine && ' ✓'} {count > 0 && <span className="tabular-nums">{count}</span>}
      </button>

      {(showForm || count > 0) && (
        <div className="order-last basis-full">
          {showForm && (
            <form onSubmit={save} className="card flex flex-wrap items-center gap-2 px-3 py-2">
              <input
                className="input min-w-0 flex-1"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
                autoFocus
                placeholder="한 줄 후기 (선택) 예) 중2 도입 활동으로 20분 정도 썼어요."
              />
              <button className="btn-primary btn-sm" disabled={busy}>
                {busy ? '남기는 중…' : '남기기'}
              </button>
              <button type="button" className="btn-ghost btn-sm" onClick={() => setOpen(false)} disabled={busy}>
                닫기
              </button>
              <p className="basis-full text-xs text-slate-500">후기는 비워 두고 남겨도 돼요. 수업에 썼다는 표시만 남아요.</p>
            </form>
          )}

          {count > 0 && (
            <section className={showForm ? 'mt-3' : ''}>
              <h2 className="text-sm font-bold text-slate-900">
                🏫 수업에 쓴 선생님 <span className="text-brand-600">{count}</span>명
              </h2>
              <ul className="mt-2 space-y-1.5 text-sm">
                {uses?.map((u) => (
                  <li key={u.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <b className="text-slate-700">
                      <AuthorName author={u.author} />
                    </b>
                    <span className="text-xs text-slate-500">{timeAgo(u.created_at)}</span>
                    {u.note ? (
                      <span className="basis-full text-slate-700 sm:basis-auto">{u.note}</span>
                    ) : (
                      <span className="text-slate-400">수업에 써 봤어요</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </>
  )
}
