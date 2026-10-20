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

const PREVIEWABLE = new Set(['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'txt', 'mp3', 'm4a', 'mp4'])
export const canPreview = (f: FileInfo) => PREVIEWABLE.has(extOf(f.name))

/** 내 폴더에 파일을 올린다. 저장소 이름은 영문 임의 이름, 원래 이름은 FileInfo 에 둔다. */
export async function uploadFile(userId: string, file: File): Promise<FileInfo> {
  const ext = extOf(file.name)
  const path = `${userId}/${crypto.randomUUID()}${ext ? `.${ext}` : ''}`
  const type = file.type || 'application/octet-stream'
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    // 미리보기에서 한글이 깨지지 않도록 텍스트 파일은 UTF-8 로 표시
    contentType: type.startsWith('text/') && !/charset/i.test(type) ? `${type};charset=utf-8` : type,
    upsert: false,
  })
  if (error) throw error
  return { path, name: file.name, size: file.size, type: file.type }
}

export async function removeFiles(paths: string[]) {
  if (paths.length === 0) return
  await supabase.storage.from(BUCKET).remove(paths)
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

/** 새 탭에서 미리보기 (5분짜리 임시 주소) */
export async function previewFile(f: FileInfo) {
  // 팝업 차단을 피하려고 클릭 순간에 창부터 연다
  const w = window.open('', '_blank')
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(f.path, 300)
  if (error || !data) {
    w?.close()
    throw error ?? new Error('미리보기 주소를 만들지 못했어요.')
  }
  if (w) {
    w.opener = null
    w.location.href = data.signedUrl
  } else {
    window.location.href = data.signedUrl
  }
}
