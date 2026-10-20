import { BUCKET, supabase } from './supabase'
import type { FileInfo } from './types'

export const MAX_FILE_BYTES = 50 * 1024 * 1024
export const MAX_FILES = 10

// 수업 자료로 흔히 쓰는 형식만 받는다 (실행 파일 차단)
const ALLOWED = new Set([
  'hwp', 'hwpx', 'hwt', 'pdf', 'ppt', 'pptx', 'pps', 'ppsx', 'key', 'show', 'cell',
  'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'md', 'tex',
  'ggb', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'zip',
  'mp3', 'm4a', 'mp4', 'ipynb', 'py',
])
export const ACCEPT = Array.from(ALLOWED, (e) => `.${e}`).join(',')

export function extOf(name: string) {
  const m = /\.([A-Za-z0-9]{1,8})$/.exec(name)
  return m ? m[1].toLowerCase() : ''
}

/** 올릴 수 없는 파일이면 이유를, 괜찮으면 null */
export function checkFile(file: File): string | null {
  if (!ALLOWED.has(extOf(file.name))) return `${file.name}: 올릴 수 없는 형식이에요.`
  if (file.size > MAX_FILE_BYTES) return `${file.name}: 50MB보다 커요.`
  if (file.size === 0) return `${file.name}: 빈 파일이에요.`
  return null
}

// 저장소에 알려 줄 파일 형식은 브라우저가 아니라 확장자로 정한다 (HWP 등은 브라우저마다 제각각).
// 미리보기할 수 있는 것만 진짜 형식으로, 나머지는 모두 '내려받기 전용(octet-stream)'.
// supabase/schema.sql 의 allowed_mime_types 와 맞아야 한다.
// 글 파일: Supabase 가 charset 을 떼고 저장하므로 미리보기는 FilePreview 가 직접 읽어서 글자 코드를 맞춘다
const TEXT = 'text/plain'
const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  txt: TEXT,
  md: TEXT,
  csv: TEXT,
  tex: TEXT,
  py: TEXT,
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  mp4: 'video/mp4',
}
export const mimeOf = (name: string) => MIME[extOf(name)] ?? 'application/octet-stream'

/** 내 폴더에 파일을 올린다. 저장소 이름은 영문 임의 이름, 원래 이름은 FileInfo 에 둔다. */
export async function uploadFile(userId: string, file: File): Promise<FileInfo> {
  const ext = extOf(file.name)
  const path = `${userId}/${crypto.randomUUID()}${ext ? `.${ext}` : ''}`
  const type = mimeOf(file.name)
  // 형식을 확실히 정해 보내려고 같은 내용을 새 Blob 으로 감싼다
  const { error } = await supabase.storage.from(BUCKET).upload(path, new Blob([file], { type }), {
    contentType: type,
    upsert: false,
  })
  if (error) throw error
  return { path, name: file.name, size: file.size, type }
}

/** 자료의 파일을 저장소에서 지운다. 그 자료를 올린 사람 폴더의 파일만 (다른 선생님 파일을 지우지 않게). */
export async function removeFiles(paths: string[], ownerId?: string) {
  const safe = ownerId ? paths.filter((p) => p.startsWith(`${ownerId}/`)) : paths
  if (safe.length === 0) return
  await supabase.storage.from(BUCKET).remove(safe)
}

/** 원래 파일 이름(한글 포함) 그대로 내려받기 */
export async function downloadFile(f: FileInfo) {
  const { data, error } = await supabase.storage.from(BUCKET).download(f.path)
  if (error) throw error
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = f.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}
