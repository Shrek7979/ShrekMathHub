'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Gate } from '@/components/Gate'
import { PostForm } from '@/components/PostForm'
import { Spinner } from '@/components/ui'

export default function NewPostPage() {
  return (
    <Gate>
      <div className="mx-auto max-w-3xl">
        <h1 className="page-title">글쓰기</h1>
        <div className="card mt-6 p-5 sm:p-6">
          <Suspense fallback={<Spinner />}>
            <NewPost />
          </Suspense>
        </div>
      </div>
    </Gate>
  )
}

function NewPost() {
  const params = useSearchParams()
  return <PostForm defaultCategory={params.get('category') ?? undefined} />
}
