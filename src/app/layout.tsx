import type { Metadata, Viewport } from 'next'
import 'katex/dist/katex.min.css'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { NewsPanel } from '@/components/NewsPanel'
import { ShrekMathPanel } from '@/components/ShrekMathPanel'
import { SetupNotice } from '@/components/SetupNotice'
import { isConfigured } from '@/lib/supabase'

// 링크 미리보기 그림 등의 주소 기준: 직접 정한 주소 → Vercel 이 알려 주는 주소 → 내 PC
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Shrek Math Hub', template: '%s · Shrek Math Hub' },
  description: '중·고등학교 수학 선생님들이 수업 자료와 고민을 나누는 곳',
  openGraph: {
    title: 'Shrek Math Hub',
    description: '중·고 수학 선생님들의 나눔터 — 수업 자료, 교육과정 지도, 오늘의 수학 뉴스',
    locale: 'ko_KR',
    type: 'website',
  },
  appleWebApp: { title: 'Math Hub', statusBarStyle: 'default' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#527b20',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <Header />
          {/* 왼쪽: Shrek Edu Insight 수학 뉴스 (늘 보임), 가운데: 사이트 화면, 오른쪽: 학생용 ShrekMath (아주 넓은 화면) */}
          <div className="flex w-full flex-1">
            <NewsPanel />
            <div className="flex min-w-0 flex-1 flex-col">
              {/* 좁은 화면에서는 오른쪽 아래 "수학 뉴스" 버튼에 가리지 않게 아래 여백을 넉넉히 */}
              <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-6 sm:pt-8 lg:pb-8">
                {!isConfigured && <SetupNotice />}
                {children}
              </main>
              <Footer />
            </div>
            <ShrekMathPanel />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
