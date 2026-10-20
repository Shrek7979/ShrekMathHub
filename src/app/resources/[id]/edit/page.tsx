'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Gate } from '@/components/Gate'
import { ResourceForm } from '@/components/ResourceForm'
import { Empty, Spinner } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import type { Resource } from '@/lib/types'

export default function EditResourcePage() {
  return (
    <Gate>
      <Edit />
    </Gate>
  )
}

function Edit() {
  const { id } = useParams<{ id: string }>()
  const { session } = useAuth()
  const [r, setR] = useState<Resource | null | undefined>(undefined)

  useEffect(() => {
    supabase
      .from('resources')
      .select('*')
      .eq('id', Number(id))
      .maybeSingle()
      .then(({ data }) => setR((data as Resource | null) ?? null))
  }, [id])

  if (r === undefined) return <Spinner />
  if (r === null || r.author_id !== session?.user.id) return <Empty>고칠 수 있는 자료가 아니에요.</Empty>
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="page-title">자료 고치기</h1>
      <div className="card mt-6 p-5 sm:p-6">
        <ResourceForm initial={r} />
      </div>
    </div>
  )
}
