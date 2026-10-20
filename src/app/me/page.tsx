'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Gate } from '@/components/Gate'
import { AuthorName, POST_LIST_COLUMNS, PostItem, RESOURCE_LIST_COLUMNS, ResourceItem } from '@/components/ListItems'
import { Empty, ErrorBox, LoadError, Spinner } from '@/components/ui'
import { LEVEL_LABEL } from '@/lib/curriculum'
import { koError, timeAgo } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@/lib/useQuery'
import type { MemberLevel, Post, ProfilePrivate, Resource } from '@/lib/types'

type Tab = 'comments' | 'resources' | 'posts' | 'saved' | 'profile'
const TABS: [Tab, string][] = [
  ['comments', '받은 댓글'],
  ['resources', '내 자료'],
  ['posts', '내 글'],
  ['saved', '담아 둔 것'],
  ['profile', '내 정보'],
]

export default function MePage() {
  const [tab, setTab] = useState<Tab>('comments')
  return (
    <Gate>
      <h1 className="page-title">내 활동</h1>
      <div className="scrollbar-none mt-5 flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold ${
              tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-5">
        {tab === 'comments' && <ReceivedComments />}
        {tab === 'resources' && <MyResources />}
        {tab === 'posts' && <MyPosts />}
        {tab === 'saved' && <Saved />}
        {tab === 'profile' && <MyProfile />}
      </div>
    </Gate>
  )
}

type Received = {
  id: number
  body: string
  created_at: string
  author: { name: string; role?: string } | null
  resource?: { id: number; title: string } | null
  post?: { id: number; title: string } | null
}

/** 내 자료·내 글(오래된 것 포함)에 다른 선생님이 남긴 댓글 (최근 30개) */
function ReceivedComments() {
  const uid = useAuth().session?.user.id
  const { data: items, failed, retry } = useQuery<Received[]>(async () => {
    const base = 'id, body, created_at, author:profiles!author_id(name, role)'
    const [a, b] = await Promise.all([
      supabase
        .from('comments')
        .select(`${base}, resource:resources!inner(id, title, author_id)`)
        .eq('resource.author_id', uid)
        .neq('author_id', uid)
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('comments')
        .select(`${base}, post:posts!inner(id, title, author_id)`)
        .eq('post.author_id', uid)
        .neq('author_id', uid)
        .order('created_at', { ascending: false })
        .limit(30),
    ])
    const all = [...((a.data ?? []) as unknown as Received[]), ...((b.data ?? []) as unknown as Received[])]
    all.sort((x, y) => y.created_at.localeCompare(x.created_at))
    return { data: all.slice(0, 30), error: a.error ?? b.error }
  }, [uid])

  if (failed) return <LoadError onRetry={retry} />
  if (!items) return <Spinner />
  if (items.length === 0) return <Empty>아직 받은 댓글이 없어요. 자료를 나누면 선생님들의 이야기가 여기에 모여요.</Empty>
  return (
    <ul className="card divide-y divide-slate-100 overflow-hidden">
      {items.map((c) => {
        const href = c.resource ? `/resources/${c.resource.id}` : `/board/${c.post?.id}`
        const where = c.resource?.title ?? c.post?.title ?? ''
        return (
          <li key={`${c.resource ? 'r' : 'p'}${c.id}`}>
            <Link href={href} className="block px-4 py-3 hover:bg-slate-50">
              <p className="text-xs text-slate-500">
                <b className="text-slate-700">
                  <AuthorName author={c.author} />
                </b>{' '}
                선생님 · {c.resource ? '자료' : '글'} &lsquo;{where}&rsquo; · {timeAgo(c.created_at)}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-800">{c.body}</p>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function MyResources() {
  const uid = useAuth().session?.user.id
  const { data: items, failed, retry } = useQuery<Resource[]>(
    () => supabase.from('resources').select(RESOURCE_LIST_COLUMNS).eq('author_id', uid).order('created_at', { ascending: false }),
    [uid],
  )
  if (failed) return <LoadError onRetry={retry} />
  if (!items) return <Spinner />
  if (items.length === 0)
    return (
      <Empty
        action={
          <Link href="/resources/new" className="btn-primary btn-sm">
            자료 올리기
          </Link>
        }
      >
        아직 올린 자료가 없어요.
      </Empty>
    )
  return (
    <ul className="space-y-2">
      {items.map((r) => (
        <ResourceItem key={r.id} r={r} />
      ))}
    </ul>
  )
}

function MyPosts() {
  const uid = useAuth().session?.user.id
  const { data: items, failed, retry } = useQuery<Post[]>(
    () => supabase.from('posts').select(POST_LIST_COLUMNS).eq('author_id', uid).order('created_at', { ascending: false }),
    [uid],
  )
  if (failed) return <LoadError onRetry={retry} />
  if (!items) return <Spinner />
  if (items.length === 0) return <Empty>아직 쓴 글이 없어요.</Empty>
  return (
    <ul className="card divide-y divide-slate-100 overflow-hidden">
      {items.map((p) => (
        <PostItem key={p.id} p={p} />
      ))}
    </ul>
  )
}

type SavedRow = {
  id: number
  created_at: string
  resource: { id: number; title: string; resource_type: string; subject: string } | null
  post: { id: number; title: string; category: string } | null
}

function Saved() {
  const { data: items, failed, retry } = useQuery<SavedRow[]>(
    () =>
      supabase
        .from('bookmarks')
        .select('id, created_at, resource:resources(id, title, resource_type, subject), post:posts(id, title, category)')
        .order('created_at', { ascending: false }),
    [],
  )
  if (failed) return <LoadError onRetry={retry} />
  if (!items) return <Spinner />
  const rows = items.filter((b) => b.resource || b.post)
  if (rows.length === 0) return <Empty>자료나 글에서 ☆ 담아 두기를 누르면 여기에 모여요.</Empty>
  return (
    <ul className="card divide-y divide-slate-100 overflow-hidden">
      {rows.map((b) => (
        <li key={b.id}>
          <Link
            href={b.resource ? `/resources/${b.resource.id}` : `/board/${b.post!.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
          >
            <span className={b.resource ? 'badge-brand' : 'badge'}>{b.resource ? `자료 · ${b.resource.resource_type}` : b.post!.category}</span>
            <span className="min-w-0 flex-1 truncate font-medium text-slate-900">{b.resource?.title ?? b.post?.title}</span>
            <span className="text-xs text-slate-500">{timeAgo(b.created_at)}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function MyProfile() {
  const { session, profile, refreshProfile } = useAuth()
  const uid = session!.user.id
  const [name, setName] = useState(profile?.name ?? '')
  const [level, setLevel] = useState<MemberLevel>(profile?.school_level ?? '고')
  const [priv, setPriv] = useState<ProfilePrivate | null>(null)
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('profile_private')
      .select('email, school, note')
      .eq('id', uid)
      .maybeSingle()
      .then(({ data }) => setPriv((data as ProfilePrivate) ?? { email: session?.user.email ?? '', school: '', note: '' }))
    // session 객체는 토큰이 새로 고쳐질 때마다 바뀌므로 uid 만 본다 (적던 내용이 지워지지 않게)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    setError('')
    if (!name.trim()) return setError('이름을 넣어 주세요.')
    const a = await supabase.from('profiles').update({ name: name.trim(), school_level: level }).eq('id', uid)
    const b = await supabase.from('profile_private').update({ school: priv?.school ?? '', note: priv?.note ?? '' }).eq('id', uid)
    if (a.error || b.error) return setError(koError(a.error ?? b.error))
    await refreshProfile()
    setMsg('저장했어요.')
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    setError('')
    if (password.length < 8) return setError('비밀번호는 8자 이상으로 정해 주세요.')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return setError(koError(error))
    setPassword('')
    setMsg('비밀번호를 바꿨어요.')
  }

  if (!priv) return <Spinner />

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={save} className="card space-y-4 p-5">
        <h2 className="font-bold text-slate-900">기본 정보</h2>
        <div>
          <span className="label">이메일</span>
          <p className="text-sm text-slate-600">{priv.email}</p>
        </div>
        <div>
          <label className="label" htmlFor="name">
            이름
          </label>
          <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} />
        </div>
        <div>
          <span className="label">학교급</span>
          <div className="flex gap-2">
            {(['중', '고', '중고'] as const).map((l) => (
              <button key={l} type="button" onClick={() => setLevel(l)} className={`chip flex-1 justify-center ${level === l ? 'chip-on' : ''}`}>
                {LEVEL_LABEL[l]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="school">
            학교 <span className="font-normal text-slate-400">(관리자만 봐요)</span>
          </label>
          <input
            id="school"
            className="input"
            value={priv.school ?? ''}
            onChange={(e) => setPriv({ ...priv, school: e.target.value })}
            maxLength={100}
          />
        </div>
        <button className="btn-primary">저장</button>
      </form>

      <form onSubmit={changePassword} className="card h-fit space-y-4 p-5">
        <h2 className="font-bold text-slate-900">비밀번호 바꾸기</h2>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="새 비밀번호 (8자 이상)"
          autoComplete="new-password"
        />
        <button className="btn-secondary">바꾸기</button>
      </form>

      <div className="md:col-span-2">
        <ErrorBox>{error}</ErrorBox>
        {msg && <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">{msg}</p>}
      </div>
    </div>
  )
}
