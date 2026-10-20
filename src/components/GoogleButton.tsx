'use client'

import { useEffect, useState } from 'react'
import { inAppBrowser, openInExternalBrowser, takeReturnPath } from '@/lib/auth-helpers'
import { koError } from '@/lib/format'
import { NOT_CONFIGURED_MESSAGE, SUPABASE_KEY, SUPABASE_URL, isConfigured, supabase } from '@/lib/supabase'

const NOT_ENABLED = '아직 Google 로그인이 설정되지 않았어요. 관리자에게 알려 주세요.'

/** Google 계정으로 로그인 (처음이면 가입 신청이 함께 된다) */
export function GoogleButton({ label = 'Google로 계속하기' }: { label?: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [inApp, setInApp] = useState<'kakao' | 'other' | null>(null)

  useEffect(() => setInApp(inAppBrowser()), [])

  async function go() {
    setError('')
    if (!isConfigured) return setError(NOT_CONFIGURED_MESSAGE)
    setBusy(true)
    // Supabase 에서 Google 로그인을 아직 안 켰다면 영어 오류 화면으로 넘어가지 않게 미리 확인
    const settings = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_KEY } })
      .then((r) => r.json())
      .catch(() => null)
    if (settings?.external && !settings.external.google) {
      setBusy(false)
      return setError(NOT_ENABLED)
    }
    // 로그인하고 돌아올 곳: 지금 보던 화면 (로그인·가입 화면에서 눌렀다면 그 전에 보던 화면)
    const here = window.location.pathname + window.location.search
    const back = /^\/(login|signup)/.test(window.location.pathname) ? (takeReturnPath() ?? '/') : here
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${back}`,
        // 학교 계정·개인 계정 중 고를 수 있게
        queryParams: { prompt: 'select_account' },
      },
    })
    // 성공하면 Google 화면으로 넘어가므로 여기로 돌아오는 건 실패했을 때뿐
    if (error) {
      setBusy(false)
      setError(/provider is not enabled/i.test(error.message) ? NOT_ENABLED : koError(error))
    }
  }

  // 카카오톡 등 앱 안 브라우저에서는 Google 이 로그인을 막는다 → 바깥 브라우저로 안내
  if (inApp)
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
        <p className="font-semibold">이 화면(앱 안 브라우저)에서는 Google 로그인이 막혀 있어요.</p>
        {inApp === 'kakao' ? (
          <button type="button" className="btn-primary mt-3 w-full" onClick={openInExternalBrowser}>
            Chrome·Safari 로 열기
          </button>
        ) : (
          <p className="mt-1">
            오른쪽 위(또는 아래) <b>⋮ 메뉴 → 다른 브라우저로 열기</b>를 눌러 Chrome·Safari 에서 열어 주세요.
          </p>
        )}
      </div>
    )

  return (
    <div>
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className="btn w-full border border-slate-300 bg-white py-3 text-base text-slate-800 shadow-sm hover:bg-slate-50"
      >
        <GoogleLogo />
        {busy ? 'Google로 이동하는 중…' : label}
      </button>
      {error && (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

/** Google 테스트 모드 동안 등록 안 된 계정이 보는 '액세스 차단됨' 안내 */
export function GoogleBlockedNote() {
  return (
    <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
      Google 화면에 <b>&lsquo;액세스 차단됨&rsquo;</b>이 나오면 아직 관리자가 등록하지 않은 계정이에요. 관리자에게 Gmail 주소를 알려
      주시거나, 아래 <b>이메일</b>로 가입·로그인해 주세요.
    </p>
  )
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}
