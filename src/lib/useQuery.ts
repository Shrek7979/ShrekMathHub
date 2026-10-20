'use client'

import { useEffect, useState } from 'react'

type Result = { data: unknown; error: unknown }

/**
 * Supabase 에서 한 번 불러오기 + 실패하면 다시 시도.
 * loading: 아직 불러오는 중, data: 결과(못 찾으면 null), failed: 연결 문제 등으로 실패, retry(): 다시 불러오기
 */
export function useQuery<T>(load: () => PromiseLike<Result>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null)
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [round, setRound] = useState(0)

  useEffect(() => {
    let cancelled = false
    setFailed(false)
    setLoading(true)
    Promise.resolve(load()).then(
      ({ data, error }) => {
        if (cancelled) return
        if (error) setFailed(true)
        else setData((data ?? null) as T | null)
        setLoading(false)
      },
      () => {
        if (cancelled) return
        setFailed(true)
        setLoading(false)
      },
    )
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, round])

  return {
    data,
    loading,
    failed,
    retry: () => {
      setData(null)
      setRound((n) => n + 1)
    },
  }
}
