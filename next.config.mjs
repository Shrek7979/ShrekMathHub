/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 기본 보안 머리글: 다른 사이트가 우리 화면을 몰래 감싸지 못하게, 파일 형식 추측 금지, 주소 유출 줄이기
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
