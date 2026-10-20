import type { Metadata, Viewport } from 'next'
import 'katex/dist/katex.min.css'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { SetupNotice } from '@/components/SetupNotice'
import { isConfigured } from '@/lib/supabase'

export const metadata: Metadata = {
  title: { default: 'Shrek Math Hub', template: '%s · Shrek Math Hub' },
  description: '중·고등학교 수학 선생님들이 수업 자료와 고민을 나누는 곳',
  icons: { icon: '/icon.svg' },
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
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
            {!isConfigured && <SetupNotice />}
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
