import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const key = process.env.NEXT_PUBLIC_SUPABASE_KEY ?? ''

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
