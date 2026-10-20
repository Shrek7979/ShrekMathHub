'use client'

import Link from 'next/link'
import { useEffect } from 'react'

/** 화면을 그리다 문제가 생겼을 때 (영어 "Application error" 대신) */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <div className="card mx-auto mt-6 max-w-md px-6 py-10 text-center">
      <p className="text-3xl">😵</p>
      <h1 className="mt-3 text-lg font-bold text-slate-900">화면을 보여 주다 문제가 생겼어요</h1>
      <p className="mt-2 text-sm text-slate-600">다시 시도해도 같으면 관리자에게 알려 주세요.</p>
      <div className="mt-5 flex justify-center gap-2">
        <button className="btn-primary btn-sm" onClick={reset}>
          다시 시도
        </button>
        <Link href="/" className="btn-secondary btn-sm">
          처음으로
        </Link>
      </div>
    </div>
  )
}
