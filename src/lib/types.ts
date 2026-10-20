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
}

export type FileInfo = {
  path: string
  name: string
  size: number
  type: string
}

type Count = { count: number }[]
type Author = { name: string } | null

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
  created_at: string
  updated_at: string
  author?: Author
  likes?: Count
  comments?: Count
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
