'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Gate } from '@/components/Gate'
import { Empty, Spinner } from '@/components/ui'
import { LEVEL_LABEL } from '@/lib/curriculum'
import { removeFiles } from '@/lib/files'
import { fullDate, koError, timeAgo } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import type { FileInfo, MemberStatus, Profile, ProfilePrivate } from '@/lib/types'

type Member = Profile & { profile_private: ProfilePrivate | ProfilePrivate[] | null }
type Tab = 'pending' | 'members' | 'reports'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('pending')
  return (
    <Gate admin>
      <h1 className="page-title">관리자</h1>
      <div className="mt-5 flex gap-1 border-b border-slate-200">
        {(
          [
            ['pending', '가입 신청'],
            ['members', '회원'],
            ['reports', '신고'],
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold ${
              tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-5">
        {tab === 'pending' && <Members only="pending" />}
        {tab === 'members' && <Members />}
        {tab === 'reports' && <Reports />}
      </div>
    </Gate>
  )
}

const STATUS_LABEL: Record<MemberStatus, string> = { pending: '대기', approved: '승인', rejected: '거절·정지' }

function privOf(m: Member): ProfilePrivate {
  const p = Array.isArray(m.profile_private) ? m.profile_private[0] : m.profile_private
  return p ?? { email: null, school: null, note: null }
}

function Members({ only }: { only?: MemberStatus }) {
  const myId = useAuth().session?.user.id
  const [items, setItems] = useState<Member[] | null>(null)
  const [filter, setFilter] = useState<MemberStatus | ''>('')
  const [q, setQ] = useState('')

  const load = useCallback(async () => {
    let query = supabase.from('profiles').select('*, profile_private(email, school, note)').order('created_at', { ascending: false })
    if (only) query = query.eq('status', only)
    const { data } = await query
    setItems((data as unknown as Member[]) ?? [])
  }, [only])

  useEffect(() => {
    load()
  }, [load])

  async function set(m: Member, status: MemberStatus, role?: 'member' | 'admin') {
    const verb = role === 'admin' ? '관리자로 지정' : role === 'member' ? '관리자에서 해제' : STATUS_LABEL[status]
    if (status !== 'approved' && !confirm(`${m.name} 선생님을 '${verb}' 할까요?`)) return
    const { error } = await supabase.rpc('admin_set_member', { target: m.id, new_status: status, new_role: role ?? null })
    if (error) return alert(koError(error))
    load()
  }

  if (!items) return <Spinner />

  const shown = items.filter((m) => {
    if (filter && m.status !== filter) return false
    if (!q.trim()) return true
    const p = privOf(m)
    return [m.name, p.email, p.school].some((v) => v?.includes(q.trim()))
  })

  return (
    <div>
      {!only && (
        <div className="mb-4 flex flex-wrap gap-2">
          {(['', 'approved', 'pending', 'rejected'] as const).map((s) => (
            <button key={s || 'all'} onClick={() => setFilter(s)} className={`chip ${filter === s ? 'chip-on' : ''}`}>
              {s ? STATUS_LABEL[s] : '전체'} ({s ? items.filter((m) => m.status === s).length : items.length})
            </button>
          ))}
          <input className="input w-48 py-1" value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름·이메일·학교" />
        </div>
      )}
      {shown.length === 0 ? (
        <Empty>{only ? '기다리는 가입 신청이 없어요.' : '해당하는 회원이 없어요.'}</Empty>
      ) : (
        <ul className="space-y-3">
          {shown.map((m) => {
            const p = privOf(m)
            const me = m.id === myId
            return (
              <li key={m.id} className="card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <b className="text-slate-900">{m.name}</b>
                  <span className="badge">{LEVEL_LABEL[m.school_level]}</span>
                  {m.role === 'admin' && <span className="badge-brand">관리자</span>}
                  <span
                    className={`badge ${
                      m.status === 'approved' ? 'bg-brand-50 text-brand-700' : m.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {STATUS_LABEL[m.status]}
                  </span>
                  {m.status === 'pending' && !p.school && <span className="badge">신청서 작성 전</span>}
                  <span className="ml-auto text-xs text-slate-400" title={fullDate(m.created_at)}>
                    {timeAgo(m.created_at)} 신청
                  </span>
                </div>
                <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[4rem_1fr]">
                  <dt className="text-slate-400">이메일</dt>
                  <dd className="break-all text-slate-700">{p.email}</dd>
                  <dt className="text-slate-400">학교</dt>
                  <dd className="text-slate-700">{p.school || '-'}</dd>
                  <dt className="text-slate-400">한마디</dt>
                  <dd className="whitespace-pre-line text-slate-700">{p.note || '-'}</dd>
                </dl>
                {!me && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.status !== 'approved' && (
                      <button className="btn-primary btn-sm" onClick={() => set(m, 'approved')}>
                        승인
                      </button>
                    )}
                    {m.status !== 'rejected' && (
                      <button className="btn-danger btn-sm" onClick={() => set(m, 'rejected')}>
                        {m.status === 'pending' ? '거절' : '이용 정지'}
                      </button>
                    )}
                    {m.status === 'approved' && (
                      <button
                        className="btn-ghost btn-sm"
                        onClick={() => set(m, 'approved', m.role === 'admin' ? 'member' : 'admin')}
                      >
                        {m.role === 'admin' ? '관리자 해제' : '관리자로 지정'}
                      </button>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

type Report = {
  id: number
  reason: string
  status: 'open' | 'closed'
  created_at: string
  reporter: { name: string } | null
  resource: { id: number; title: string } | null
  post: { id: number; title: string } | null
  comment: { id: number; body: string; resource_id: number | null; post_id: number | null } | null
}

function Reports() {
  const [items, setItems] = useState<Report[] | null>(null)
  const [showClosed, setShowClosed] = useState(false)

  const load = useCallback(async () => {
    let query = supabase
      .from('reports')
      .select(
        'id, reason, status, created_at, reporter:profiles(name), resource:resources(id, title), post:posts(id, title), comment:comments(id, body, resource_id, post_id)',
      )
      .order('created_at', { ascending: false })
    if (!showClosed) query = query.eq('status', 'open')
    const { data } = await query
    setItems((data as unknown as Report[]) ?? [])
  }, [showClosed])

  useEffect(() => {
    load()
  }, [load])

  async function close(r: Report) {
    const { error } = await supabase.from('reports').update({ status: 'closed' }).eq('id', r.id)
    if (error) return alert(koError(error))
    load()
  }

  async function removeTarget(r: Report) {
    if (!confirm('신고된 내용을 지울까요? 되돌릴 수 없어요.')) return
    if (r.resource) {
      const { data } = await supabase.from('resources').select('files').eq('id', r.resource.id).maybeSingle()
      const { error } = await supabase.from('resources').delete().eq('id', r.resource.id)
      if (error) return alert(koError(error))
      await removeFiles(((data?.files ?? []) as FileInfo[]).map((f) => f.path))
    } else {
      const { error } = r.post
        ? await supabase.from('posts').delete().eq('id', r.post.id)
        : await supabase.from('comments').delete().eq('id', r.comment!.id)
      if (error) return alert(koError(error))
    }
    load()
  }

  if (!items) return <Spinner />

  return (
    <div>
      <label className="mb-4 flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" className="accent-brand-600" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />
        처리한 신고도 보기
      </label>
      {items.length === 0 ? (
        <Empty>처리할 신고가 없어요. 👍</Empty>
      ) : (
        <ul className="space-y-3">
          {items.map((r) => {
            const href = r.resource
              ? `/resources/${r.resource.id}`
              : r.post
                ? `/board/${r.post.id}`
                : r.comment?.resource_id
                  ? `/resources/${r.comment.resource_id}`
                  : `/board/${r.comment?.post_id}`
            const what = r.resource ? `자료: ${r.resource.title}` : r.post ? `글: ${r.post.title}` : `댓글: ${r.comment?.body.slice(0, 60)}`
            return (
              <li key={r.id} className={`card p-4 ${r.status === 'closed' ? 'opacity-60' : ''}`}>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="badge bg-red-50 text-red-600">{r.reason}</span>
                  <span>{r.reporter?.name} 선생님 신고</span>
                  <span className="ml-auto">{timeAgo(r.created_at)}</span>
                </div>
                <Link href={href} target="_blank" className="mt-2 block truncate text-sm font-medium text-slate-800 hover:text-brand-700">
                  {what} ↗
                </Link>
                {r.status === 'open' && (
                  <div className="mt-3 flex gap-2">
                    <button className="btn-secondary btn-sm" onClick={() => close(r)}>
                      문제없음 · 처리 완료
                    </button>
                    <button className="btn-danger btn-sm" onClick={() => removeTarget(r)}>
                      {r.resource ? '자료 지우기' : r.post ? '글 지우기' : '댓글 지우기'}
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
