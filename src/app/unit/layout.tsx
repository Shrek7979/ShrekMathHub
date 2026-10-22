import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '단원 페이지',
  description: '한 단원의 자료·질문·수학사·앞뒤 단원을 한 화면에',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
