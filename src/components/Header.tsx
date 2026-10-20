'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthProvider'
import { Logo } from './ui'

export function Header() {
  const { session, profile, isApproved, isAdmin, loading, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const pending = usePendingCount(isAdmin, pathname)

  const nav = [
    { href: '/resources', label: '자료실' },
    { href: '/board', label: '게시판' },
    ...(isAdmin ? [{ href: '/admin', label: '관리자', badge: pending }] : []),
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Logo />
        {isApproved && (
          <nav className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto">
            {nav.map((n) => {
              const on = pathname.startsWith(n.href)
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`relative whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold ${
                    on ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {n.label}
                  {'badge' in n && n.badge ? (
                    <span className="ml-1 rounded-full bg-red-500 px-1.5 text-[11px] text-white">{n.badge}</span>
                  ) : null}
                </Link>
              )
            })}
          </nav>
        )}
        <div className="ml-auto flex items-center gap-2 text-sm">
          {loading ? null : session ? (
            <>
              {isApproved && (
                <Link href="/me" className="btn-ghost btn-sm">
                  <span className="max-w-[8rem] truncate">{profile?.name ?? '내 정보'}</span> 선생님
                </Link>
              )}
              <button
                className="btn-secondary btn-sm"
                onClick={async () => {
                  await signOut()
                  router.push('/')
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost btn-sm">
                로그인
              </Link>
              <Link href="/signup" className="btn-primary btn-sm">
                가입 신청
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

/** 관리자에게 승인 대기 인원을 보여 준다 (화면을 옮길 때마다 새로 셈) */
function usePendingCount(isAdmin: boolean, pathname: string) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!isAdmin) return
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setCount(count ?? 0))
  }, [isAdmin, pathname])
  return isAdmin ? count : 0
}
