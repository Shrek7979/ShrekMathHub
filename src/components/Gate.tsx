'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { rememberReturnPath } from '@/lib/auth-helpers'
import { supabase } from '@/lib/supabase'
import { ApplicationForm } from './Application'
import { useAuth } from './AuthProvider'
import { GoogleButton } from './GoogleButton'
import { LoadError, Spinner } from './ui'

/** 승인된 선생님(admin 이면 관리자)에게만 children 을 보여 준다 */
export function Gate({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const { session, profile, loading, isApproved, isAdmin, profileError, refreshProfile, signOut } = useAuth()

  if (loading) return <Spinner />
  if (!session) return <LoginNeeded />
  if (!profile && profileError)
    return <LoadError onRetry={refreshProfile}>회원 정보를 불러오지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.</LoadError>
  if (!profile)
    return (
      <StatusCard title="회원 정보를 찾지 못했어요">
        <p>잠시 뒤 다시 시도하거나, 계속 이러면 관리자에게 알려 주세요.</p>
        <div className="mt-5 flex justify-center gap-2">
          <button className="btn-secondary btn-sm" onClick={refreshProfile}>
            다시 시도
          </button>
          <button className="btn-ghost btn-sm" onClick={signOut}>
            로그아웃
          </button>
        </div>
      </StatusCard>
    )
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
  useEffect(() => rememberReturnPath(), [])
  return (
    <StatusCard title="선생님 전용 공간이에요">
      <p>로그인하면 자료실과 게시판을 이용할 수 있어요.</p>
      <div className="mx-auto mt-5 max-w-xs">
        <GoogleButton />
        <Link href="/signup" className="mt-3 inline-block text-sm text-slate-500 hover:text-slate-800">
          처음이신가요? 가입 안내 보기
        </Link>
      </div>
    </StatusCard>
  )
}

export function PendingCard({ name }: { name: string }) {
  const uid = useAuth().session?.user.id
  // Google 로 처음 들어온 선생님은 아직 학교·확인 정보를 적지 않았다
  const [applied, setApplied] = useState<boolean | null>(null)

  useEffect(() => {
    supabase
      .from('profile_private')
      .select('school')
      .eq('id', uid)
      .maybeSingle()
      .then(({ data }) => setApplied(!!data?.school))
  }, [uid])

  if (applied === null) return <Spinner />
  if (!applied)
    return (
      <StatusCard title="가입 신청서를 적어 주세요">
        <p>관리자가 수학 선생님인지 확인할 수 있도록 학교와 담당 정보를 알려 주세요.</p>
        <div className="mt-6">
          <ApplicationForm onDone={() => setApplied(true)} />
        </div>
      </StatusCard>
    )

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
