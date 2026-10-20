'use client'

import { useEffect, useState } from 'react'
import { extOf } from '@/lib/files'
import { koError } from '@/lib/format'
import { BUCKET, supabase } from '@/lib/supabase'
import type { FileInfo } from '@/lib/types'

const IMAGE = ['png', 'jpg', 'jpeg', 'gif', 'webp']
const AUDIO = ['mp3', 'm4a']
const VIDEO = ['mp4']
const FRAME = ['pdf', 'txt']

export const canPreview = (f: FileInfo) => [...IMAGE, ...AUDIO, ...VIDEO, ...FRAME].includes(extOf(f.name))

/** 자료 화면 안에서 펼쳐 보는 미리보기 (열 때만 내려받아서 전송량을 아낀다) */
export function FilePreview({ file }: { file: FileInfo }) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.storage
      .from(BUCKET)
      .createSignedUrl(file.path, 60 * 60)
      .then(({ data, error }) => (error || !data ? setError(koError(error)) : setUrl(data.signedUrl)))
  }, [file.path])

  if (error) return <p className="px-4 py-3 text-sm text-red-600">{error}</p>
  if (!url) return <p className="px-4 py-3 text-sm text-slate-400">미리보기를 불러오는 중…</p>

  const ext = extOf(file.name)
  return (
    <div className="border-t border-slate-100 bg-slate-50 p-3">
      {IMAGE.includes(ext) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={file.name} className="mx-auto max-h-[70vh] rounded-md bg-white" />
      )}
      {AUDIO.includes(ext) && <audio src={url} controls className="w-full" />}
      {VIDEO.includes(ext) && <video src={url} controls className="max-h-[70vh] w-full rounded-md bg-black" />}
      {FRAME.includes(ext) && <iframe src={url} title={file.name} className="h-[70vh] w-full rounded-md border border-slate-200 bg-white" />}
    </div>
  )
}
