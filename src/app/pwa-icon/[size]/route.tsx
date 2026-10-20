import { ImageResponse } from 'next/og'

const SIZES = [192, 512]

export function generateStaticParams() {
  return SIZES.map((s) => ({ size: String(s) }))
}

/** 안드로이드 '홈 화면에 추가'용 아이콘 (192·512 px) */
export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const n = SIZES.includes(Number((await params).size)) ? Number((await params).size) : 192
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#527b20' }}>
        <svg width={n * 0.62} height={n * 0.62} viewBox="0 0 64 64">
          <path d="M46 20H18l14 12-14 12h28" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    { width: n, height: n },
  )
}
