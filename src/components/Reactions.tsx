'use client'

import { useEffect, useState } from 'react'
import { koError } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import { targetColumns, type Target } from '@/lib/types'
import { useAuth } from './AuthProvider'

/** 좋아요(개수 공개)와 담아 두기(나만 보임) */
export function Reactions({ target }: { target: Target }) {
  const { session } = useAuth()
  const uid = session?.user.id
  const cols = targetColumns(target)
  const [key, id] = Object.entries(cols)[0] as [string, number]
  const [likeCount, setLikeCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!uid) return
    Promise.all([
      supabase.from('likes').select('id', { count: 'exact', head: true }).eq(key, id),
      supabase.from('likes').select('id').eq(key, id).eq('user_id', uid).maybeSingle(),
      supabase.from('bookmarks').select('id').eq(key, id).eq('user_id', uid).maybeSingle(),
    ]).then(([all, mine, bm]) => {
      setLikeCount(all.count ?? 0)
      setLiked(!!mine.data)
      setSaved(!!bm.data)
    })
  }, [uid, key, id])

  async function toggle(table: 'likes' | 'bookmarks', on: boolean) {
    if (!uid || busy) return
    setBusy(true)
    const { error } = on
      ? await supabase.from(table).delete().eq(key, id).eq('user_id', uid)
      : await supabase.from(table).insert(cols)
    setBusy(false)
    // 이미 눌러 둔 상태(중복)라면 화면만 맞춘다
    if (error && error.code !== '23505') return alert(koError(error))
    if (table === 'likes') {
      setLiked(!on)
      setLikeCount((c) => Math.max(0, c + (on ? -1 : 1)))
    } else {
      setSaved(!on)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => toggle('likes', liked)}
        disabled={busy}
        aria-pressed={liked}
        className={`btn btn-sm border ${
          liked ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
        }`}
      >
        {liked ? '♥' : '♡'} 좋아요 {likeCount > 0 && <span className="tabular-nums">{likeCount}</span>}
      </button>
      <button
        onClick={() => toggle('bookmarks', saved)}
        disabled={busy}
        aria-pressed={saved}
        className={`btn btn-sm border ${
          saved ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
        }`}
      >
        {saved ? '★ 담아 둠' : '☆ 담아 두기'}
      </button>
    </div>
  )
}
