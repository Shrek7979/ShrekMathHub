'use client'

import { useEffect, useState } from 'react'
import { extOf } from '@/lib/files'
import { koError } from '@/lib/format'
import { BUCKET, supabase } from '@/lib/supabase'
import type { FileInfo } from '@/lib/types'

const IMAGE = ['png', 'jpg', 'jpeg', 'gif', 'webp']
const AUDIO = ['mp3', 'm4a']
const VIDEO = ['mp4']
const TEXT = ['txt', 'md', 'csv', 'tex', 'py']
const PDF = ['pdf']

export const canPreview = (f: FileInfo) => [...IMAGE, ...AUDIO, ...VIDEO, ...TEXT, ...PDF].includes(extOf(f.name))

/** 자료 화면 안에서 펼쳐 보는 미리보기 (열 때만 내려받아서 전송량을 아낀다) */
export function FilePreview({ file }: { file: FileInfo }) {
  const ext = extOf(file.name)
  const [url, setUrl] = useState<string | null>(null)
  const [text, setText] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [touch, setTouch] = useState(false)

  useEffect(() => setTouch(window.matchMedia('(pointer: coarse)').matches), [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(file.path, 60 * 60)
      if (cancelled) return
      if (error || !data) return setError(koError(error))
      if (!TEXT.includes(ext)) return setUrl(data.signedUrl)
      // 글 파일은 직접 읽어서 보여 준다 (UTF-8 이 아니면 학교에서 흔한 EUC-KR 로)
      const res = await fetch(data.signedUrl)
      if (!res.ok) throw new Error(res.status === 400 || res.status === 404 ? 'Object not found' : `HTTP ${res.status}`)
      const buf = await res.arrayBuffer()
      if (cancelled) return
      let decoded: string
      try {
        decoded = new TextDecoder('utf-8', { fatal: true }).decode(buf)
      } catch {
        decoded = new TextDecoder('euc-kr').decode(buf)
      }
      setText(decoded.slice(0, 200_000))
    }
    load().catch((e) => !cancelled && setError(koError(e)))
    return () => {
      cancelled = true
    }
  }, [file.path, ext])

  if (error) return <p className="border-t border-slate-100 px-4 py-3 text-sm text-red-600">{error}</p>
  if (!url && text === null) return <p className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">미리보기를 불러오는 중…</p>

  return (
    <div className="border-t border-slate-100 bg-slate-50 p-3">
      {text !== null && (
        <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap break-words rounded-md border border-slate-200 bg-white p-4 font-mono text-sm leading-relaxed text-slate-800">
          {text}
        </pre>
      )}
      {url && IMAGE.includes(ext) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={file.name} className="mx-auto max-h-[70vh] rounded-md bg-white" />
      )}
      {url && AUDIO.includes(ext) && <audio src={url} controls className="w-full" />}
      {url && VIDEO.includes(ext) && <video src={url} controls className="max-h-[70vh] w-full rounded-md bg-black" />}
      {url && PDF.includes(ext) && touch && (
        // 안드로이드 휴대폰은 화면 안 PDF 를 빈칸으로 보여 주므로 바로 열기
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary w-full">
          PDF 열기 ↗
        </a>
      )}
      {url && PDF.includes(ext) && !touch && (
        <>
          <iframe src={url} title={file.name} className="h-[70vh] w-full rounded-md border border-slate-200 bg-white" />
          <p className="mt-2 text-right text-xs">
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-slate-500 underline hover:text-slate-800">
              새 창에서 크게 보기 ↗
            </a>
          </p>
        </>
      )}
    </div>
  )
}
