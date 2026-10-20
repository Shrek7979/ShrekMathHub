const dateFmt = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

/** "방금", "5분 전", "3시간 전", "어제", "2026년 10월 20일" */
export function timeAgo(iso: string) {
  const d = new Date(iso)
  const sec = (Date.now() - d.getTime()) / 1000
  if (sec < 60) return '방금'
  if (sec < 3600) return `${Math.floor(sec / 60)}분 전`
  if (sec < 86400) return `${Math.floor(sec / 3600)}시간 전`
  if (sec < 172800) return '어제'
  if (sec < 604800) return `${Math.floor(sec / 86400)}일 전`
  return dateFmt.format(d)
}

export function fullDate(iso: string) {
  return dateFmt.format(new Date(iso))
}

export function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)}GB`
}

/** 검색어에서 Supabase 필터 문법을 깨는 글자를 뺀다 */
export function cleanSearch(q: string) {
  return q.replace(/[,()%*\\"'.:]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 50)
}

/** Supabase 오류를 선생님이 읽을 수 있는 말로 */
export function koError(e: unknown): string {
  const msg = typeof e === 'string' ? e : (e as { message?: string })?.message ?? ''
  if (/Invalid login credentials/i.test(msg)) return '이메일 또는 비밀번호가 맞지 않아요.'
  if (/already registered|already been registered/i.test(msg)) return '이미 가입된 이메일이에요. 로그인해 주세요.'
  if (/Email not confirmed/i.test(msg)) return '이메일 인증이 아직 안 됐어요. 메일함의 확인 링크를 눌러 주세요.'
  if (/Password should be at least/i.test(msg)) return '비밀번호는 6자 이상이어야 해요.'
  if (/rate limit|too many/i.test(msg)) return '요청이 너무 많아요. 잠시 뒤에 다시 해 주세요.'
  if (/row-level security|permission denied/i.test(msg)) return '권한이 없어요. 승인된 회원인지 확인해 주세요.'
  if (/exceeded the maximum allowed size|Payload too large/i.test(msg)) return '파일이 너무 커요. 한 파일에 50MB까지 올릴 수 있어요.'
  if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) return '인터넷 연결을 확인해 주세요.'
  if (/mime type|invalid_mime/i.test(msg)) return '올릴 수 없는 파일 형식이에요.'
  if (/Object not found/i.test(msg)) return '파일을 찾을 수 없어요. 지워졌을 수 있어요.'
  if (/Cannot coerce|multiple \(or no\) rows|PGRST116/i.test(msg)) return '권한이 없거나 이미 지워진 내용이에요.'
  if (/check constraint/i.test(msg)) return '입력한 내용의 길이나 형식이 맞지 않아요. 다시 확인해 주세요.'
  if (/JWT|refresh token|session/i.test(msg)) return '로그인이 만료됐어요. 다시 로그인해 주세요.'
  // 데이터베이스에서 보낸 한국어 안내는 그대로, 그 밖의 영어 오류는 쉬운 말 + 참고용 원문
  if (!msg) return '알 수 없는 오류가 났어요.'
  if (/[가-힣]/.test(msg)) return msg
  return `문제가 생겼어요. 잠시 뒤 다시 해 주세요. (${msg.slice(0, 80)})`
}
