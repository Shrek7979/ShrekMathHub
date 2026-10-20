'use client'

import { useState } from 'react'

/** 휴대폰은 공유 창(카카오톡 등), PC 는 주소 복사 */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href
    if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share({ title: `${title} · Shrek Math Hub`, url })
        return
      } catch {
        // 사용자가 취소함 → 아래 복사로 넘어가지 않고 끝
        return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('이 주소를 복사해 주세요', url)
    }
  }

  return (
    <button type="button" onClick={share} className="btn-secondary btn-sm">
      {copied ? '✔ 주소 복사됨' : '🔗 공유'}
    </button>
  )
}

/** 글을 클립보드에 복사 (안 되면 직접 복사할 수 있게 띄움) */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    window.prompt('아래 내용을 복사해 주세요', text)
    return false
  }
}
