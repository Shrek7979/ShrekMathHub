'use client'

import { Gate } from '@/components/Gate'
import { ResourceForm } from '@/components/ResourceForm'

export default function NewResourcePage() {
  return (
    <Gate>
      <div className="mx-auto max-w-3xl">
        <h1 className="page-title">자료 올리기</h1>
        <p className="mt-1 text-sm text-slate-500">선생님의 자료가 다른 교실의 수업을 바꿀 수 있어요.</p>
        <div className="card mt-6 p-5 sm:p-6">
          <ResourceForm />
        </div>
      </div>
    </Gate>
  )
}
