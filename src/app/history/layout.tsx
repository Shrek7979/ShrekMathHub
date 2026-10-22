import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '오늘의 수학사',
  description: '중·고 수학 수업에서 꺼내 쓰는 수학 역사 이야기 모음',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
