// 내 PC 의 자료를 한꺼번에 올리기 위한 '개발 모드 전용' 도우미 (서버 쪽).
// .import/manifest.json 에 적힌 파일만 읽는다. 인터넷에 올린 사이트(production)에서는 아무것도 하지 않는다.
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

export type ImportItem = {
  title: string
  school_level: '중' | '고'
  subject: string
  unit?: string
  resource_type: string
  description?: string
  link_url?: string
  featured?: boolean
  /** 내 PC 의 파일 경로들 (사이트에 보일 이름을 바꾸려면 { path, name }) */
  files: (string | { path: string; name: string })[]
}

export function pathOf(f: ImportItem['files'][number]) {
  return typeof f === 'string' ? f : f.path
}

export function nameOf(f: ImportItem['files'][number]) {
  return typeof f === 'string' ? path.basename(f) : f.name
}

export function devOnly(req: Request) {
  if (process.env.NODE_ENV !== 'development') return false
  const host = new URL(req.url).hostname
  return host === 'localhost' || host === '127.0.0.1'
}

export async function readManifest(): Promise<ImportItem[]> {
  const p = path.join(process.cwd(), '.import', 'manifest.json')
  try {
    const json = JSON.parse(await readFile(p, 'utf8'))
    return Array.isArray(json.items) ? json.items : []
  } catch {
    return []
  }
}

export async function fileInfo(f: ImportItem['files'][number]) {
  const name = nameOf(f)
  try {
    const s = await stat(pathOf(f))
    return { name, size: s.size, exists: s.isFile() }
  } catch {
    return { name, size: 0, exists: false }
  }
}
