import { readFile } from 'node:fs/promises'
import { devOnly, pathOf, readManifest } from '@/lib/dev-import'

export const dynamic = 'force-dynamic'

/** 목록에 적힌 파일 하나의 내용 (?i=자료 번호&f=파일 번호) — 개발 모드 + 내 PC 에서만 */
export async function GET(req: Request) {
  if (!devOnly(req)) return new Response('Not found', { status: 404 })
  const url = new URL(req.url)
  const i = Number(url.searchParams.get('i'))
  const f = Number(url.searchParams.get('f'))
  const items = await readManifest()
  const p = items[i]?.files?.[f]
  if (!p) return new Response('Not found', { status: 404 })
  try {
    const buf = await readFile(pathOf(p))
    return new Response(new Uint8Array(buf), { headers: { 'content-type': 'application/octet-stream' } })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
