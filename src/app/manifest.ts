import type { MetadataRoute } from 'next'

/** 휴대폰 "홈 화면에 추가" 할 때 쓰는 정보 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Shrek Math Hub',
    short_name: 'Math Hub',
    description: '중·고등학교 수학 선생님들이 수업 자료와 고민을 나누는 곳',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#527b20',
    lang: 'ko',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/pwa-icon/192', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-icon/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icon/512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
