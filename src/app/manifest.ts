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
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // 안드로이드가 원·둥근 모양으로 잘라도 얼굴이 남도록 그림을 안쪽으로 줄인 것
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
