import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/** 아이폰 홈 화면 아이콘 (icon.svg 와 같은 모양) */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#527b20' }}>
        <svg width="120" height="120" viewBox="0 0 64 64">
          <path d="M46 20H18l14 12-14 12h28" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    size,
  )
}
