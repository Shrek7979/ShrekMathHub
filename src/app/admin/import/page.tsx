'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Gate } from '@/components/Gate'
import { Empty, Spinner } from '@/components/ui'
import { checkFile, uploadFile } from '@/lib/files'
import { fileSize, koError } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import type { FileInfo } from '@/lib/types'

type Item = {
  index: number
  title: string
  school_level: '중' | '고'
  subject: string
  unit: string
  resource_type: string
  description: string
  link_url: string | null
  featured: boolean
  files: { name: string; size: number; exists: boolean }[]
}
type State = { status: 'wait' | 'busy' | 'done' | 'skip' | 'fail'; note?: string; id?: number }

const DONE_KEY = 'smh-import-done'

/** 내 PC(.import/manifest.json)의 자료를 관리자 계정으로 한꺼번에 올린다 — 개발 모드 전용 */
export default function ImportPage() {
  return (
    <Gate admin>
      <Importer />
    </Gate>
  )
}

function Importer() {
  const { session } = useAuth()
  const [items, setItems] = useState<Item[] | null>(null)
  const [unavailable, setUnavailable] = useState(false)
  const [state, setState] = useState<Record<number, State>>({})
  const [running, setRunning] = useState(false)

  useEffect(() => {
    fetch('/api/dev-import')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setItems(d.items as Item[])
        // 이미 올린 것은 다시 올리지 않게 표시
        try {
          const done = JSON.parse(localStorage.getItem(DONE_KEY) ?? '{}') as Record<string, number>
          const s: Record<number, State> = {}
          for (const it of d.items as Item[]) if (done[it.title]) s[it.index] = { status: 'done', id: done[it.title] }
          setState(s)
        } catch {}
      })
      .catch(() => setUnavailable(true))
  }, [])

  async function importOne(it: Item) {
    const uid = session!.user.id
    const set = (s: State) => setState((m) => ({ ...m, [it.index]: s }))
    set({ status: 'busy' })
    const uploaded: FileInfo[] = []
    try {
      for (const [f, info] of it.files.entries()) {
        if (!info.exists) throw new Error(`파일이 없어요: ${info.name}`)
        const blob = await (await fetch(`/api/dev-import/file?i=${it.index}&f=${f}`)).blob()
        const file = new File([blob], info.name)
        const problem = checkFile(file)
        if (problem) throw new Error(problem)
        uploaded.push(await uploadFile(uid, file))
      }
      const { data, error } = await supabase
        .from('resources')
        .insert({
          title: it.title,
          school_level: it.school_level,
          subject: it.subject,
          unit: it.unit,
          resource_type: it.resource_type,
          description: it.description,
          link_url: it.link_url,
          files: uploaded,
        })
        .select('id')
        .maybeSingle()
      if (error || !data) throw error ?? new Error('저장하지 못했어요.')
      if (it.featured) await supabase.rpc('admin_feature_resource', { rid: data.id, on_off: true })
      try {
        const done = JSON.parse(localStorage.getItem(DONE_KEY) ?? '{}')
        done[it.title] = data.id
        localStorage.setItem(DONE_KEY, JSON.stringify(done))
      } catch {}
      set({ status: 'done', id: data.id })
    } catch (e) {
      if (uploaded.length) await supabase.storage.from('resources').remove(uploaded.map((u) => u.path))
      set({ status: 'fail', note: koError(e) })
    }
  }

  async function runAll() {
    if (!items) return
    setRunning(true)
    for (const it of items) {
      if (state[it.index]?.status === 'done') continue
      await importOne(it)
    }
    setRunning(false)
  }

  if (unavailable)
    return <Empty>이 화면은 내 PC 에서 개발 모드(npm run dev)로 켰을 때만 쓸 수 있어요.</Empty>
  if (!items) return <Spinner />
  if (items.length === 0) return <Empty>.import/manifest.json 에 가져올 자료가 없어요.</Empty>

  const doneCount = items.filter((it) => state[it.index]?.status === 'done').length
  const total = items.reduce((s, it) => s + it.files.reduce((a, f) => a + f.size, 0), 0)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">내 PC 자료 한꺼번에 올리기</h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length}개 자료 · 파일 합계 {fileSize(total)} · 올린 것 {doneCount}개
          </p>
        </div>
        <button className="btn-primary" onClick={runAll} disabled={running || doneCount === items.length}>
          {running ? '올리는 중…' : doneCount === items.length ? '모두 올렸어요' : '남은 자료 모두 올리기'}
        </button>
      </div>
      <ul className="mt-5 space-y-2">
        {items.map((it) => {
          const s = state[it.index] ?? { status: 'wait' }
          return (
            <li key={it.index} className="card flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
              <span className="badge-brand">{it.resource_type}</span>
              <span className="badge">
                {it.subject}
                {it.unit && ` · ${it.unit}`}
              </span>
              {it.featured && <span className="badge bg-amber-100 text-amber-800">⭐ 추천</span>}
              <span className="min-w-0 flex-1 font-medium text-slate-900">{it.title}</span>
              <span className="text-xs text-slate-500">
                {it.files.map((f) => `${f.name}${f.exists ? '' : ' (없음)'}`).join(', ')}
              </span>
              <span className="w-28 text-right text-xs">
                {s.status === 'wait' && <span className="text-slate-500">대기</span>}
                {s.status === 'busy' && <span className="text-sky-700">올리는 중…</span>}
                {s.status === 'done' && (
                  <Link href={`/resources/${s.id}`} target="_blank" className="font-semibold text-brand-700 underline">
                    ✔ 올림
                  </Link>
                )}
                {s.status === 'fail' && <span className="text-red-600">실패</span>}
              </span>
              {s.note && <p className="w-full text-xs text-red-600">{s.note}</p>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
