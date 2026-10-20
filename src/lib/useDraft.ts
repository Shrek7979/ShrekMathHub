'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * 쓰던 글을 이 브라우저에 잠깐 저장해 두고(임시 저장), 다시 열면 불러온다.
 * 저장하지 않고 창을 닫으려 하면 한 번 묻는다.
 * - enabled 가 false(예: 고치기 화면)면 아무것도 하지 않는다.
 * - 올리기에 성공하면 clear() 를 불러 지운다.
 */
export function useDraft<T extends object>(key: string, value: T, restore: (v: T) => void, enabled = true) {
  const [restored, setRestored] = useState(false)
  const dirty = useRef(false)
  // 처음 연 모습(또는 불러온 모습)과 달라졌을 때만 '쓰는 중'으로 본다 (미리 채운 과목·단원은 쓰는 중이 아님)
  const baseline = useRef<string | null>(null)
  const justRestored = useRef(false)

  // 처음 한 번: 저장된 것이 있으면 불러오기
  useEffect(() => {
    if (!enabled) return
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        justRestored.current = true
        restore(JSON.parse(raw) as T)
        setRestored(true)
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled])

  // 바뀔 때마다 잠시 뒤 저장
  const json = JSON.stringify(value)
  useEffect(() => {
    if (!enabled) return
    if (baseline.current === null || justRestored.current) {
      baseline.current = json
      justRestored.current = false
      return
    }
    if (json === baseline.current) return
    dirty.current = true
    const t = setTimeout(() => {
      try {
        localStorage.setItem(key, json)
      } catch {}
    }, 500)
    return () => clearTimeout(t)
  }, [key, json, enabled])

  // 저장 안 하고 나가려 하면 묻기
  useEffect(() => {
    if (!enabled) return
    const onLeave = (e: BeforeUnloadEvent) => {
      if (!dirty.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onLeave)
    return () => window.removeEventListener('beforeunload', onLeave)
  }, [enabled])

  return {
    /** 임시 저장된 내용을 불러왔는지 */
    restored,
    /** 올리기 성공·버리기 때 */
    clear: () => {
      dirty.current = false
      setRestored(false)
      try {
        localStorage.removeItem(key)
      } catch {}
    },
  }
}
