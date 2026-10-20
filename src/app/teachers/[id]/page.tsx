'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Gate } from '@/components/Gate'
import { POST_LIST_COLUMNS, PostItem, RESOURCE_LIST_COLUMNS, ResourceItem } from '@/components/ListItems'
import { Empty, Spinner } from '@/components/ui'
import { LEVEL_LABEL } from '@/lib/curriculum'
import { fullDate } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import type { Post, Profile, Resource } from '@/lib/types'

export default function TeacherPage() {
  return (
    <Gate>
      <Teacher />
    </Gate>
  )
}

/** 한 선생님이 나눈 자료와 글 */
function Teacher() {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined)
  const [resources, setResources] = useState<Resource[]>([])
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*').eq('id', id).maybeSingle(),
      supabase.from('resources').select(RESOURCE_LIST_COLUMNS).eq('author_id', id).order('created_at', { ascending: false }).limit(50),
      supabase.from('posts').select(POST_LIST_COLUMNS).eq('author_id', id).order('created_at', { ascending: false }).limit(30),
    ]).then(([p, r, b]) => {
      setProfile((p.data as Profile | null) ?? null)
      setResources((r.data as unknown as Resource[]) ?? [])
      setPosts((b.data as unknown as Post[]) ?? [])
    })
  }, [id])

  if (profile === undefined) return <Spinner />
  if (profile === null) return <Empty>찾을 수 없는 선생님이에요.</Empty>

  const downloads = resources.reduce((s, r) => s + r.download_count, 0)

  return (
    <div>
      <div className="card flex flex-wrap items-center gap-4 p-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
          {profile.name.slice(0, 1)}
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {profile.name} 선생님 {profile.role === 'admin' && <span className="badge-brand ml-1 align-middle">관리자</span>}
          </h1>
          <p className="text-sm text-slate-500">
            {LEVEL_LABEL[profile.school_level]} · {fullDate(profile.created_at)} 가입
          </p>
        </div>
        <dl className="ml-auto flex gap-6 text-center">
          <Stat label="자료" value={resources.length} />
          <Stat label="글" value={posts.length} />
          <Stat label="내려받기" value={downloads} />
        </dl>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <h2 className="mb-3 font-bold text-slate-900">나눈 자료</h2>
          {resources.length === 0 ? (
            <Empty>아직 나눈 자료가 없어요.</Empty>
          ) : (
            <ul className="space-y-2">
              {resources.map((r) => (
                <ResourceItem key={r.id} r={r} />
              ))}
            </ul>
          )}
        </section>
        <section className="lg:col-span-2">
          <h2 className="mb-3 font-bold text-slate-900">쓴 글</h2>
          {posts.length === 0 ? (
            <Empty>아직 쓴 글이 없어요.</Empty>
          ) : (
            <ul className="card divide-y divide-slate-100 overflow-hidden">
              {posts.map((p) => (
                <PostItem key={p.id} p={p} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dd className="text-xl font-bold tabular-nums text-slate-900">{value}</dd>
      <dt className="text-xs text-slate-500">{label}</dt>
    </div>
  )
}
