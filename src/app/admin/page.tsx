'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Gate } from '@/components/Gate'
import { copyText } from '@/components/ShareButton'
import { Empty, LoadError, Spinner } from '@/components/ui'
import { LEVEL_LABEL } from '@/lib/curriculum'
import { removeFiles } from '@/lib/files'
import { fileSize, fullDate, koError, timeAgo } from '@/lib/format'
import { SITE } from '@/lib/site'
import { BUCKET, supabase } from '@/lib/supabase'
import type { FileInfo, MemberStatus, Profile, ProfilePrivate } from '@/lib/types'

type Member = Profile & { profile_private: ProfilePrivate | ProfilePrivate[] | null }
type Tab = 'stats' | 'pending' | 'members' | 'reports'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('stats')
  return (
    <Gate admin>
      <h1 className="page-title">관리자</h1>
      <div className="mt-5 flex gap-1 border-b border-slate-200">
        {(
          [
            ['stats', '한눈에 보기'],
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
        {tab === 'stats' && <Stats />}
        {tab === 'pending' && (
          <>
            <GoogleTestUserNote />
            <Members only="pending" />
          </>
        )}
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
  const [failed, setFailed] = useState(false)
  const [filter, setFilter] = useState<MemberStatus | ''>('')
  const [q, setQ] = useState('')

  const load = useCallback(async () => {
    let query = supabase.from('profiles').select('*, profile_private(email, school, note)').order('created_at', { ascending: false })
    if (only) query = query.eq('status', only)
    const { data, error } = await query
    setFailed(!!error)
    if (!error) setItems((data as unknown as Member[]) ?? [])
  }, [only])

  useEffect(() => {
    load()
  }, [load])

  async function set(m: Member, status: MemberStatus, role?: 'member' | 'admin') {
    const verb = role === 'admin' ? '관리자로 지정' : role === 'member' ? '관리자에서 해제' : STATUS_LABEL[status]
    // 승인만 바로, 거절·정지·관리자 지정/해제는 한 번 더 묻는다
    if ((status !== 'approved' || role) && !confirm(`${m.name} 선생님을 '${verb}' 할까요?`)) return
    const { error } = await supabase.rpc('admin_set_member', { target: m.id, new_status: status, new_role: role ?? null })
    if (error) return alert(koError(error))
    load()
    // 막 승인했다면 카카오톡 등에 붙여 넣을 안내 문구를 바로 복사해 준다
    if (status === 'approved' && !role && m.status !== 'approved' && (await copyWelcome(m.name))) {
      alert(`${m.name} 선생님을 승인했어요. 안내 문구를 복사했으니 카카오톡이나 메일에 붙여 넣어 알려 주세요.`)
    }
  }

  if (failed) return <LoadError onRetry={load} />
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
                  <span className="ml-auto text-xs text-slate-500" title={fullDate(m.created_at)}>
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
                      <button className="btn-secondary btn-sm" onClick={() => copyWelcome(m.name)}>
                        📋 승인 안내 복사
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
  const [failed, setFailed] = useState(false)
  const [showClosed, setShowClosed] = useState(false)

  const load = useCallback(async () => {
    let query = supabase
      .from('reports')
      .select(
        'id, reason, status, created_at, reporter:profiles(name), resource:resources(id, title), post:posts(id, title), comment:comments(id, body, resource_id, post_id)',
      )
      .order('created_at', { ascending: false })
    if (!showClosed) query = query.eq('status', 'open')
    const { data, error } = await query
    setFailed(!!error)
    if (!error) setItems((data as unknown as Report[]) ?? [])
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
      const { data } = await supabase.from('resources').select('files, author_id').eq('id', r.resource.id).maybeSingle()
      const { error } = await supabase.from('resources').delete().eq('id', r.resource.id)
      if (error) return alert(koError(error))
      if (data) await removeFiles(((data.files ?? []) as FileInfo[]).map((f) => f.path), data.author_id as string)
    } else {
      const { error } = r.post
        ? await supabase.from('posts').delete().eq('id', r.post.id)
        : await supabase.from('comments').delete().eq('id', r.comment!.id)
      if (error) return alert(koError(error))
    }
    load()
  }

  if (failed) return <LoadError onRetry={load} />
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

/** 승인된 선생님에게 보낼 안내 문구 */
function copyWelcome(name: string) {
  return copyText(
    `[Shrek Math Hub] ${name} 선생님, 가입이 승인되었어요! 🎉
` +
      `${window.location.origin} 에 들어가서 처음 가입하신 방법(Google 또는 이메일)으로 로그인하면 ` +
      `자료실·교육과정 지도·게시판을 모두 쓸 수 있어요.`,
  )
}

type StatsData = {
  members: number
  pending: number
  resources: number
  posts: number
  comments: number
  downloads: number
  files: number
  storage_bytes: number
}

function Stats() {
  const [s, setS] = useState<StatsData | null>(null)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    supabase.rpc('admin_stats').then(({ data, error }) => (error ? setError(koError(error)) : setS(data as StatsData)))
  }, [reload])

  if (error)
    return (
      <LoadError
        onRetry={() => {
          setError('')
          setReload((n) => n + 1)
        }}
      >
        {error}
      </LoadError>
    )
  if (!s) return <Spinner />

  const used = s.storage_bytes / SITE.storageLimitBytes
  const tiles: [string, number, string?][] = [
    ['승인 회원', s.members],
    ['가입 대기', s.pending],
    ['자료', s.resources],
    ['게시글', s.posts],
    ['댓글', s.comments],
    ['총 내려받기', s.downloads],
  ]

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map(([label, value]) => (
          <div key={label} className="card p-4">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{value.toLocaleString('ko-KR')}</dd>
          </div>
        ))}
      </dl>

      <section className="card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold text-slate-900">파일 저장 공간</h2>
          <p className="text-sm tabular-nums text-slate-600">
            {fileSize(s.storage_bytes)} / {fileSize(SITE.storageLimitBytes)} 사용 · 파일 {s.files}개
          </p>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(used * 100)}>
          <div
            className={`h-full rounded-full ${used > 0.9 ? 'bg-red-500' : used > 0.7 ? 'bg-amber-500' : 'bg-brand-600'}`}
            style={{ width: `${Math.min(100, Math.max(used * 100, used > 0 ? 1 : 0))}%` }}
          />
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-500">
          <li>Supabase 무료 요금제는 파일 저장 1GB, 한 파일 최대 50MB, 한 달 내려받기 전송량 5GB 까지예요.</li>
          <li>큰 영상·PPT 는 Google 드라이브나 유튜브에 올리고 자료의 [링크] 칸에 주소를 넣으면 저장 공간을 아낄 수 있어요.</li>
          <li>공간이 부족해지면 Supabase Pro 요금제(월 25달러 정도)로 바꾸면 크게 늘어나요.</li>
        </ul>
        <OrphanCleaner onDone={() => setReload((n) => n + 1)} />
      </section>
    </div>
  )
}

/** 앱을 Google 에 '게시'하기 전까지는 테스트 사용자로 등록된 계정만 Google 로그인이 된다 */
function GoogleTestUserNote() {
  return (
    <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-relaxed text-sky-900">
      <b>Google 로그인 안내</b> — 지금은 Google 로그인이 &lsquo;테스트 모드&rsquo;라서, 가입하려는 선생님의 Gmail 주소를 먼저{' '}
      <a href={SITE.googleAudienceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
        Google Cloud 테스트 사용자
      </a>
      에 추가해야 로그인할 수 있어요. (최대 100명, 사이트를 인터넷에 올린 뒤 &lsquo;앱 게시&rsquo;를 하면 필요 없어져요)
    </div>
  )
}

/** 어느 자료에도 연결되지 않은 파일(올리다 창을 닫은 경우 등)을 찾아 지운다 */
function OrphanCleaner({ onDone }: { onDone: () => void }) {
  const [names, setNames] = useState<string[] | null>(null)
  const [busy, setBusy] = useState(false)

  async function find() {
    setBusy(true)
    const { data, error } = await supabase.rpc('admin_orphan_files')
    setBusy(false)
    if (error) return alert(koError(error))
    setNames(((data as (string | { name: string })[]) ?? []).map((x) => (typeof x === 'string' ? x : x.name)))
  }

  async function clean() {
    if (!names || !confirm(`연결 안 된 파일 ${names.length}개를 지울까요? 자료에 붙어 있는 파일은 지우지 않아요.`)) return
    setBusy(true)
    for (let i = 0; i < names.length; i += 100) {
      const { error } = await supabase.storage.from(BUCKET).remove(names.slice(i, i + 100))
      if (error) {
        setBusy(false)
        return alert(koError(error))
      }
    }
    setBusy(false)
    setNames([])
    onDone()
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-sm">
      <button className="btn-secondary btn-sm" onClick={find} disabled={busy}>
        연결 안 된 파일 찾기
      </button>
      {names !== null &&
        (names.length === 0 ? (
          <span className="text-slate-500">정리할 파일이 없어요. 👍</span>
        ) : (
          <>
            <span className="text-slate-600">하루 넘게 어느 자료에도 연결되지 않은 파일 {names.length}개</span>
            <button className="btn-danger btn-sm" onClick={clean} disabled={busy}>
              정리하기
            </button>
          </>
        ))}
    </div>
  )
}
