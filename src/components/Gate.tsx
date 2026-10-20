'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { Spinner } from './ui'

/** 승인된 선생님(admin 이면 관리자)에게만 children 을 보여 준다 */
export function Gate({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const { session, profile, loading, isApproved, isAdmin } = useAuth()

  if (loading) return <Spinner />
  if (!session) return <LoginNeeded />
  if (!profile) return <StatusCard title="회원 정보를 찾지 못했어요">관리자에게 알려 주세요.</StatusCard>
  if (profile.status === 'pending') return <PendingCard name={profile.name} />
  if (profile.status === 'rejected')
    return (
      <StatusCard title="이용이 제한된 계정이에요">
        가입이 승인되지 않았거나 이용이 정지되었어요. 궁금한 점은 관리자에게 문의해 주세요.
      </StatusCard>
    )
  if (!isApproved) return null
  if (admin && !isAdmin) return <StatusCard title="관리자만 볼 수 있어요">이 화면은 관리자 전용이에요.</StatusCard>
  return <>{children}</>
}

export function LoginNeeded() {
  return (
    <StatusCard title="선생님 전용 공간이에요">
      <p>로그인하면 자료실과 게시판을 이용할 수 있어요.</p>
      <div className="mt-5 flex justify-center gap-2">
        <Link href="/login" className="btn-secondary">
          로그인
        </Link>
        <Link href="/signup" className="btn-primary">
          가입 신청
        </Link>
      </div>
    </StatusCard>
  )
}

export function PendingCard({ name }: { name: string }) {
  return (
    <StatusCard title={`${name} 선생님, 가입 신청이 접수됐어요`}>
      <p>관리자가 선생님 정보를 확인한 뒤 승인해 드려요.</p>
      <p className="mt-1">승인되면 이 화면을 새로 고쳤을 때 자료실과 게시판이 열려요.</p>
      <button className="btn-secondary mt-5" onClick={() => window.location.reload()}>
        새로 고침
      </button>
    </StatusCard>
  )
}

function StatusCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card mx-auto mt-6 max-w-lg px-6 py-10 text-center">
      <h1 className="text-lg font-bold text-slate-900">{title}</h1>
      <div className="mt-3 text-sm leading-relaxed text-slate-600">{children}</div>
    </div>
  )
}
