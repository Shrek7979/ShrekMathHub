import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Shrek Math Hub 의 Supabase 프로젝트 (서울).
// 둘 다 '공개용' 값이라 방문자 브라우저에 그대로 보이는 것이 정상이다 — 보안은 데이터베이스 규칙(RLS)이 맡는다.
// 다른 프로젝트에 연결하려면 .env.local 이나 Vercel 환경 변수(NEXT_PUBLIC_SUPABASE_URL / _KEY)로 덮어쓴다.
// ※ secret / service_role 키는 절대 여기에 두지 않는다.
const DEFAULT_URL = 'https://pvnqznfnppcszxfbmayx.supabase.co'
const DEFAULT_KEY = 'sb_publishable_cga4xMmG_fui8eHZhUbAwA_GHHxKL4j'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_KEY || DEFAULT_KEY

export const SUPABASE_URL = url
export const SUPABASE_KEY = key

/** .env.local 에 Supabase 주소와 키가 들어 있는지 */
export const isConfigured = /^https:\/\/.+/.test(url) && key.length > 20

// 연결 전에는 로그인된 사람이 없으므로 회원용 화면의 요청은 실행되지 않는다.
// 가입·로그인 화면은 isConfigured 를 먼저 확인한다.
export const supabase: SupabaseClient = isConfigured
  ? createClient(url, key)
  : (null as unknown as SupabaseClient)

export const NOT_CONFIGURED_MESSAGE = '아직 Supabase 가 연결되지 않았어요. 설치가이드.md 를 따라 먼저 연결해 주세요.'

/** 자료 파일 저장소 이름 (supabase/schema.sql 과 같아야 함) */
export const BUCKET = 'resources'
