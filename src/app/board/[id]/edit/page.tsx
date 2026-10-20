'use client'

import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Gate } from '@/components/Gate'
import { PostForm } from '@/components/PostForm'
import { Empty, LoadError, Spinner } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@/lib/useQuery'
import type { Post } from '@/lib/types'

export default function EditPostPage() {
  return (
    <Gate>
      <Edit />
    </Gate>
  )
}

function Edit() {
  const { id } = useParams<{ id: string }>()
  const { session } = useAuth()
  const { data: p, loading, failed, retry } = useQuery<Post | null>(
    () => supabase.from('posts').select('*').eq('id', Number(id)).maybeSingle(),
    [id],
  )
  if (failed) return <LoadError onRetry={retry} />
  if (loading) return <Spinner />
  if (p === null || p.author_id !== session?.user.id) return <Empty>고칠 수 있는 글이 아니에요.</Empty>
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="page-title">글 고치기</h1>
      <div className="card mt-6 p-5 sm:p-6">
        <PostForm initial={p} />
      </div>
    </div>
  )
}
