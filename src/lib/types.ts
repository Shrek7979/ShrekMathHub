export type SchoolLevel = '중' | '고'
export type MemberLevel = SchoolLevel | '중고'
export type MemberStatus = 'pending' | 'approved' | 'rejected'

export type Profile = {
  id: string
  name: string
  school_level: MemberLevel
  role: 'member' | 'admin'
  status: MemberStatus
  created_at: string
}

export type ProfilePrivate = {
  email: string | null
  school: string | null
  note: string | null
  /** 가입 방법: google / email */
  provider?: string | null
}

export type FileInfo = {
  path: string
  name: string
  size: number
  type: string
}

type Count = { count: number }[]
type Author = { name: string; role?: string } | null

/** 자료 출처: 직접 만듦 / 다른 자료를 고침(출처 필수) / 공개 자료 링크 */
export type SourceKind = 'own' | 'adapted' | 'linked'

export const SOURCE_KINDS: { value: SourceKind; label: string; short: string; icon: string; help: string }[] = [
  { value: 'own', label: '직접 만들었어요', short: '직접 만듦', icon: '✍️', help: '내가 만든 자료예요.' },
  { value: 'adapted', label: '다른 자료를 고쳐 만들었어요', short: '다른 자료 고침', icon: '🔧', help: '어떤 자료를 바탕으로 했는지 출처를 꼭 적어 주세요.' },
  { value: 'linked', label: '공개 자료 링크예요', short: '공개 자료', icon: '🔗', help: '누구나 볼 수 있게 공개된 자료의 주소를 나누는 거예요.' },
]

export function sourceKindOf(k?: string | null) {
  return SOURCE_KINDS.find((s) => s.value === k) ?? SOURCE_KINDS[0]
}

/** "수업에 써 봤어요" 한 건 */
export type ClassroomUse = {
  id: number
  user_id: string
  resource_id: number
  note: string
  created_at: string
  author?: Author
}

export type Resource = {
  id: number
  author_id: string
  title: string
  description: string
  school_level: SchoolLevel
  subject: string
  unit: string
  resource_type: string
  link_url: string | null
  files: FileInfo[]
  download_count: number
  /** 관리자 추천 자료 */
  featured: boolean
  /** 출처 구분 (예전 자료는 'own') */
  source_kind: SourceKind
  /** 출처 설명 (adapted 면 필수) */
  source_note: string | null
  created_at: string
  updated_at: string
  author?: Author
  likes?: Count
  comments?: Count
  /** 수업에 써 봤어요 수 */
  classroom_uses?: Count
}

export type Post = {
  id: number
  author_id: string
  category: string
  title: string
  body: string
  /** 질문 글: 해결됨 */
  solved: boolean
  created_at: string
  updated_at: string
  author?: Author
  likes?: Count
  comments?: Count
}

export type Comment = {
  id: number
  author_id: string
  resource_id: number | null
  post_id: number | null
  body: string
  created_at: string
  author?: Author
}

/** 좋아요·북마크·댓글·신고가 가리키는 대상 */
export type Target = { resourceId: number } | { postId: number }

export function targetColumns(t: Target): Record<string, number> {
  return 'resourceId' in t ? { resource_id: t.resourceId } : { post_id: t.postId }
}

export function countOf(c?: Count) {
  return c?.[0]?.count ?? 0
}
