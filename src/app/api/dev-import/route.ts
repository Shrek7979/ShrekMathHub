import { devOnly, fileInfo, readManifest } from '@/lib/dev-import'

export const dynamic = 'force-dynamic'

/** 가져올 자료 목록 (파일 경로 대신 이름·크기만) — 개발 모드 + 내 PC 에서만 */
export async function GET(req: Request) {
  if (!devOnly(req)) return new Response('Not found', { status: 404 })
  const items = await readManifest()
  const out = await Promise.all(
    items.map(async (it, i) => ({
      index: i,
      title: it.title,
      school_level: it.school_level,
      subject: it.subject,
      unit: it.unit ?? '',
      resource_type: it.resource_type,
      description: it.description ?? '',
      link_url: it.link_url ?? null,
      featured: !!it.featured,
      replace_id: it.replace_id ?? null,
      files: await Promise.all(it.files.map(fileInfo)),
    })),
  )
  return Response.json({ items: out })
}
