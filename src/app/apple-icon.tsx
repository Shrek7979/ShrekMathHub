import { ImageResponse } from 'next/og'
import { iconDataUri } from '@/lib/brand-icon'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/** 아이폰 홈 화면 아이콘 (icon.svg 와 같은 모양, 모서리는 아이폰이 둥글게 깎음) */
export default function AppleIcon() {
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={iconDataUri({ full: true })} width={180} height={180} alt="" />
    ),
    size,
  )
}
