import type { Metadata } from 'next'

export const metadata: Metadata = { title: '내 활동' }

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
