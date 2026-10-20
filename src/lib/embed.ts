/** GeoGebra · Desmos · 유튜브 링크를 자료 화면 안에서 바로 보이게 바꾼다 */
export type Embed = { kind: string; src: string }

export function embedOf(raw: string | null): Embed | null {
  if (!raw) return null
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return null
  }
  const host = u.hostname.replace(/^www\./, '')
  const parts = u.pathname.split('/').filter(Boolean)

  if (host === 'geogebra.org') {
    // /m/ID, /classic/ID, /calculator/ID, /graphing/ID, /geometry/ID, /3d/ID, /material/show/id/ID
    const id =
      parts[0] === 'material' ? parts[parts.indexOf('id') + 1] : ['m', 'classic', 'calculator', 'graphing', 'geometry', '3d'].includes(parts[0]) ? parts[1] : null
    if (id && /^[A-Za-z0-9]+$/.test(id)) return { kind: 'GeoGebra', src: `https://www.geogebra.org/material/iframe/id/${id}` }
  }

  if (host === 'desmos.com' && ['calculator', 'geometry', '3d'].includes(parts[0]) && parts[1] && /^[A-Za-z0-9]+$/.test(parts[1])) {
    return { kind: 'Desmos', src: `https://www.desmos.com/${parts[0]}/${parts[1]}?embed` }
  }

  let yt: string | null = null
  if (host === 'youtu.be') yt = parts[0] ?? null
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    yt = u.searchParams.get('v') ?? (['shorts', 'embed', 'live'].includes(parts[0]) ? parts[1] : null)
  }
  if (yt && /^[A-Za-z0-9_-]{11}$/.test(yt)) return { kind: 'YouTube', src: `https://www.youtube-nocookie.com/embed/${yt}` }

  return null
}
