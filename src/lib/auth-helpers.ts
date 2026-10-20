/** 로그인 뒤 원래 보던 화면으로 돌아가기 + 카카오톡 등 앱 안 브라우저 감지 */

const RETURN_KEY = 'smh-return-to'

/** 로그인하러 가기 전에 지금 화면을 기억한다 (로그인·가입 화면 자체는 빼고) */
export function rememberReturnPath(path = window.location.pathname + window.location.search) {
  if (/^\/(login|signup|forgot|reset)(\/|$|\?)/.test(path)) return
  try {
    sessionStorage.setItem(RETURN_KEY, path)
  } catch {}
}

function safe(p: string | null) {
  return p && p.startsWith('/') && !p.startsWith('//') ? p : null
}

/** 기억해 둔 화면을 보기만 한다 (지우지 않음) */
export function peekReturnPath(): string | null {
  try {
    return safe(sessionStorage.getItem(RETURN_KEY))
  } catch {
    return null
  }
}

/** 기억해 둔 화면 (같은 사이트 안의 주소만) — 한 번 꺼내면 지운다 */
export function takeReturnPath(): string | null {
  try {
    const p = sessionStorage.getItem(RETURN_KEY)
    sessionStorage.removeItem(RETURN_KEY)
    return safe(p)
  } catch {
    return null
  }
}

/** Google 이 로그인을 막는 앱 안 브라우저(카카오톡·네이버·인스타그램·페이스북·라인 등) */
export function inAppBrowser(): 'kakao' | 'other' | null {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent
  if (/KAKAOTALK/i.test(ua)) return 'kakao'
  if (/NAVER\(inapp|Instagram|FBAN|FBAV|Line\/|everytimeApp|DaumApps|; wv\)/i.test(ua)) return 'other'
  return null
}

/** 카카오톡에서는 바깥 브라우저로 다시 연다 */
export function openInExternalBrowser() {
  window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(window.location.href)}`
}
