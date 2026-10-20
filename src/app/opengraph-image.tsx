import { ImageResponse } from 'next/og'

export const alt = 'Shrek Math Hub'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** 카카오톡 등에 주소를 보낼 때 나오는 미리보기 그림 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #2d421a 0%, #527b20 60%, #86b447 100%)',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <div style={{ width: 120, height: 120, borderRadius: 28, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="84" height="84" viewBox="0 0 64 64">
              <path d="M46 20H18l14 12-14 12h28" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: -2 }}>Shrek Math Hub</div>
        </div>
        <div style={{ marginTop: 40, fontSize: 40, opacity: 0.9 }}>For middle &amp; high school math teachers</div>
        <div style={{ marginTop: 12, fontSize: 32, opacity: 0.75 }}>Share lessons · Curriculum map · Today&apos;s math news</div>
      </div>
    ),
    size,
  )
}
