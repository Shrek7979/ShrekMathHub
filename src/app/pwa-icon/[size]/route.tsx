import { ImageResponse } from 'next/og'
import { iconDataUri } from '@/lib/brand-icon'

const SIZES = [192, 512]

export function generateStaticParams() {
  return SIZES.map((s) => ({ size: String(s) }))
}

/** 안드로이드 '홈 화면에 추가'용 아이콘 (192·512 px, 휴대폰이 모양에 맞게 깎아도 그림이 안쪽에 있어 잘리지 않음) */
export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const n = SIZES.includes(Number((await params).size)) ? Number((await params).size) : 192
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={iconDataUri({ full: true })} width={n} height={n} alt="" />
    ),
    { width: n, height: n },
  )
}
