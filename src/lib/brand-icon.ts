// 사이트 아이콘 그림 (초록 바탕 + 흰 Σ + 노란 점). app/icon.svg 와 모양이 같아야 한다.
// 홈 화면 아이콘(아이폰·안드로이드)은 휴대폰이 모서리를 알아서 둥글게 깎으므로 네모 그대로(full) 쓴다.

export function iconSvg({ full = false }: { full?: boolean } = {}) {
  const r = full ? 0 : 14
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fb236"/><stop offset="1" stop-color="#46691a"/></linearGradient>
    <radialGradient id="s" cx=".25" cy=".18" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="64" height="64" rx="${r}" fill="url(#g)"/>
  <rect width="64" height="64" rx="${r}" fill="url(#s)"/>
  <path d="M43.5 18H17.5l13 14-13 14h26" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="46" cy="46" r="5" fill="#fbbf24"/>
</svg>`
}

export function iconDataUri(opts?: { full?: boolean }) {
  return `data:image/svg+xml;base64,${Buffer.from(iconSvg(opts)).toString('base64')}`
}
