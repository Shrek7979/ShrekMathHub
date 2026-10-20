'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Gate } from '@/components/Gate'
import { ResourceForm } from '@/components/ResourceForm'
import { Spinner } from '@/components/ui'
import { subjectsOf } from '@/lib/curriculum'
import type { SchoolLevel } from '@/lib/types'

export default function NewResourcePage() {
  return (
    <Gate>
      <div className="mx-auto max-w-3xl">
        <h1 className="page-title">자료 올리기</h1>
        <p className="mt-1 text-sm text-slate-500">선생님의 자료가 다른 교실의 수업을 바꿀 수 있어요.</p>
        <div className="card mt-6 p-5 sm:p-6">
          <Suspense fallback={<Spinner />}>
            <FormWithPreset />
          </Suspense>
        </div>
      </div>
    </Gate>
  )
}

/** ?level=고&subject=대수&unit=수열 처럼 오면 과목·단원을 미리 골라 둔다 */
function FormWithPreset() {
  const params = useSearchParams()
  const raw = params.get('level')
  const level: SchoolLevel | null = raw === '중' || raw === '고' ? raw : null
  const subject = params.get('subject') ?? ''
  const unit = (params.get('unit') ?? '').slice(0, 40)
  const preset = level && subjectsOf(level).includes(subject) ? { level, subject, unit } : undefined
  return <ResourceForm preset={preset} />
}
