'use client'

import { useEffect, useState } from 'react'

/** 화면 크기 조건. 처음 그릴 때는 null (서버에서는 화면 크기를 모름) */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean | null>(null)
  useEffect(() => {
    const m = window.matchMedia(query)
    setMatches(m.matches)
    const onChange = () => setMatches(m.matches)
    m.addEventListener('change', onChange)
    return () => m.removeEventListener('change', onChange)
  }, [query])
  return matches
}
