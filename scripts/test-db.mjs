// supabase/schema.sql 의 권한·보안 규칙을 내 PC 안의 Postgres(PGlite)로 검사한다.
// Supabase 가 미리 만들어 두는 auth·storage 부분만 흉내 낸 뒤 schema.sql 을 그대로 실행한다.
//   npm run test:db
import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'node:fs'

const SUPABASE_STUBS = `
  create role anon nologin;
  create role authenticated nologin;
  grant usage on schema public to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant all on functions to anon, authenticated;
  alter default privileges in schema public grant all on sequences to anon, authenticated;

  create schema auth;
  grant usage on schema auth to anon, authenticated;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant execute on function auth.uid() to anon, authenticated;

  create schema storage;
  grant usage on schema storage to anon, authenticated;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint);
  create table storage.objects (
    id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner uuid default auth.uid());
  alter table storage.objects enable row level security;
  grant select, insert, update, delete on storage.objects to anon, authenticated;
  create function storage.foldername(name text) returns text[] language sql immutable as
    $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
`

const A = '00000000-0000-0000-0000-00000000000a' // 첫 가입자 → 관리자
const B = '00000000-0000-0000-0000-00000000000b' // 승인받을 선생님
const C = '00000000-0000-0000-0000-00000000000c' // 승인 대기 선생님

const db = new PGlite()
await db.exec(SUPABASE_STUBS)
await db.exec(readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8'))
// 두 번 실행해도 안전한지
await db.exec(readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8'))

async function as(uid, sql, params = []) {
  await db.exec('reset role')
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [uid ?? ''])
  await db.exec(uid ? 'set role authenticated' : 'set role anon')
  try {
    return await db.query(sql, params)
  } finally {
    await db.exec('reset role')
  }
}
const rows = async (uid, sql, params) => (await as(uid, sql, params)).rows
const one = async (uid, sql, params) => (await rows(uid, sql, params))[0]

let passed = 0
let failed = 0
async function test(name, fn) {
  try {
    await fn()
    passed++
    console.log(`  ✓ ${name}`)
  } catch (e) {
    failed++
    console.log(`  ✗ ${name}\n      ${e.message}`)
  }
}
function eq(actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error(`기대 ${JSON.stringify(expected)}, 실제 ${JSON.stringify(actual)}`)
}
async function fails(promise, pattern) {
  try {
    await promise
  } catch (e) {
    if (pattern && !pattern.test(e.message)) throw new Error(`다른 오류: ${e.message}`)
    return
  }
  throw new Error('막혀야 하는데 통과됨')
}

const signUp = (id, email, meta) =>
  db.query('insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)', [id, email, meta])

console.log('\n회원가입·승인')
await signUp(A, 'admin@test.kr', { name: '관리자' })
await signUp(B, 'kim@test.kr', { name: '김수학', school_level: '중', school: '테스트중', note: '중학교 수학 교사' })
await signUp(C, 'lee@test.kr', { name: '이대기', school_level: '해커' })

await test('첫 가입자는 관리자로 바로 승인', async () => {
  eq(await one(A, 'select role, status from profiles where id = $1', [A]), { role: 'admin', status: 'approved' })
})
await test('그다음 가입자는 승인 대기, 학교급 이상한 값은 기본값', async () => {
  eq(await one(B, 'select role, status, school_level from profiles where id = $1', [B]),
    { role: 'member', status: 'pending', school_level: '중' })
  eq(await one(C, 'select school_level from profiles where id = $1', [C]), { school_level: '고' })
})
await test('대기 회원이 스스로 승인·관리자로 바꿀 수 없음', async () => {
  await fails(as(B, `update profiles set status = 'approved' where id = $1`, [B]), /permission denied/)
  await fails(as(B, `update profiles set role = 'admin' where id = $1`, [B]), /permission denied/)
  await fails(as(B, `select admin_set_member($1, 'approved')`, [B]), /관리자만/)
})
await test('내 이름은 고칠 수 있음', async () => {
  eq((await as(B, `update profiles set name = '김수학' where id = $1 returning name`, [B])).rows, [{ name: '김수학' }])
})
await test('이메일·학교·메모는 본인과 관리자만', async () => {
  eq(await rows(B, 'select email from profile_private'), [{ email: 'kim@test.kr' }])
  eq((await rows(A, 'select id from profile_private')).length, 3)
})
await test('관리자는 자기 자신을 바꿀 수 없음', async () => {
  await fails(as(A, `select admin_set_member($1, 'rejected')`, [A]), /내 계정/)
})
const G = '00000000-0000-0000-0000-00000000000d' // Google 로 처음 들어온 선생님
await test('Google 로그인: 구글 이름으로 대기 회원이 되고, 신청서(학교·메모)는 비어 있음', async () => {
  await signUp(G, 'park@gmail.com', { name: '박구글', full_name: '박구글', avatar_url: 'https://x/y.png', email_verified: true })
  eq(await one(G, 'select name, status from profiles where id = $1', [G]), { name: '박구글', status: 'pending' })
  eq(await one(G, 'select school, note from profile_private where id = $1', [G]), { school: null, note: null })
})
await test('대기 회원이 가입 신청서를 직접 채울 수 있음 (승인 상태는 그대로)', async () => {
  await as(G, `update profiles set name = '박수학', school_level = '중고' where id = $1`, [G])
  await as(G, `update profile_private set school = 'OO중', note = '중2 담당' where id = $1`, [G])
  eq(await one(A, 'select p.name, p.status, v.school from profiles p join profile_private v using (id) where p.id = $1', [G]),
    { name: '박수학', status: 'pending', school: 'OO중' })
  eq(await rows(G, `update profile_private set note = 'x' where id = $1 returning id`, [B]), [])
})

console.log('\n자료실')
const ins = `insert into resources (title, school_level, subject, unit, resource_type, files)
             values ($1, '고', '공통수학1', '다항식', '학습지·활동지', '[]') returning id, author_id`
let rA
await test('관리자가 자료를 올림', async () => {
  rA = await one(A, ins, ['다항식 학습지'])
  eq(rA.author_id, A)
})
await test('대기 회원은 자료를 못 보고 못 올림', async () => {
  eq(await rows(B, 'select id from resources'), [])
  await fails(as(B, ins, ['몰래']), /row-level security/)
})
await test('관리자가 승인하면 볼 수 있음', async () => {
  await as(A, `select admin_set_member($1, 'approved')`, [B])
  eq((await rows(B, 'select id from resources')).length, 1)
})
let rB
await test('승인 회원이 자료를 올리면 작성자가 자동으로 본인', async () => {
  rB = await one(B, ins, ['인수분해 활동지'])
  eq(rB.author_id, B)
})
await test('작성자나 내려받기 수를 마음대로 넣을 수 없음', async () => {
  await fails(as(B, `insert into resources (title, school_level, subject, resource_type, author_id)
                     values ('x', '고', '대수', '기타', $1)`, [A]), /permission denied/)
  await fails(as(B, `update resources set download_count = 999 where id = $1`, [rB.id]), /permission denied/)
})
await test('남의 자료는 못 고치고 못 지움', async () => {
  eq(await rows(B, `update resources set title = '바꿈' where id = $1 returning id`, [rA.id]), [])
  eq(await rows(B, `delete from resources where id = $1 returning id`, [rA.id]), [])
})
await test('내 자료는 고칠 수 있고 수정 시각이 바뀜', async () => {
  const before = await one(B, 'select updated_at from resources where id = $1', [rB.id])
  await new Promise((r) => setTimeout(r, 5))
  const after = await one(B, `update resources set title = '인수분해 활동지(수정)' where id = $1 returning updated_at`, [rB.id])
  if (!(after.updated_at > before.updated_at)) throw new Error('updated_at 이 그대로')
})
await test('내려받기 수: 승인 회원은 +1, 대기 회원은 무시, 수정 시각은 그대로', async () => {
  const before = await one(A, 'select updated_at from resources where id = $1', [rA.id])
  await as(B, 'select count_download($1)', [rA.id])
  await as(C, 'select count_download($1)', [rA.id])
  const after = await one(A, 'select download_count, updated_at from resources where id = $1', [rA.id])
  eq(after.download_count, 1)
  eq(String(after.updated_at), String(before.updated_at))
})
await test('로그인 안 한 사람은 아무것도 못 봄', async () => {
  await fails(as(null, 'select id from resources'), /permission denied/)
  await fails(as(null, 'select id from profiles'), /permission denied/)
})

console.log('\n게시판·댓글·좋아요·북마크')
let p
await test('글쓰기·수정', async () => {
  p = await one(B, `insert into posts (category, title, body) values ('질문', '이차함수 도입 어떻게?', '$y=x^2$') returning id, author_id`)
  eq(p.author_id, B)
  eq(await rows(A, `update posts set title = '관리자가 바꿈' where id = $1 returning id`, [p.id]), [])
})
await test('댓글: 대기 회원은 못 봄, 관리자는 지울 수 있음', async () => {
  const c = await one(B, `insert into comments (post_id, body) values ($1, '좋아요!') returning id`, [p.id])
  eq(await rows(C, 'select id from comments'), [])
  await fails(as(B, `insert into comments (post_id, resource_id, body) values ($1, $2, 'x')`, [p.id, rA.id]), /check/)
  eq((await rows(A, 'delete from comments where id = $1 returning id', [c.id])).length, 1)
})
await test('좋아요: 한 번만, 개수는 모두에게 보임', async () => {
  await as(B, 'insert into likes (resource_id) values ($1)', [rA.id])
  await fails(as(B, 'insert into likes (resource_id) values ($1)', [rA.id]), /duplicate/)
  eq((await rows(A, 'select id from likes where resource_id = $1', [rA.id])).length, 1)
})
await test('북마크는 본인만 보임', async () => {
  await as(B, 'insert into bookmarks (post_id) values ($1)', [p.id])
  eq(await rows(A, 'select id from bookmarks'), [])
  eq((await rows(B, 'select id from bookmarks')).length, 1)
})

console.log('\n신고')
await test('승인 회원이 신고, 관리자만 처리', async () => {
  const r = await one(B, `insert into reports (resource_id, reason) values ($1, '저작권') returning id`, [rA.id])
  await fails(as(C, `insert into reports (resource_id, reason) values ($1, 'x')`, [rA.id]), /row-level security/)
  eq(await rows(B, `update reports set status = 'closed' where id = $1 returning id`, [r.id]), [])
  eq((await rows(A, `update reports set status = 'closed' where id = $1 returning id`, [r.id])).length, 1)
})

console.log('\n파일 저장소')
await test('내 폴더에만 올릴 수 있음', async () => {
  await as(B, `insert into storage.objects (bucket_id, name) values ('resources', $1)`, [`${B}/a.pdf`])
  await fails(as(B, `insert into storage.objects (bucket_id, name) values ('resources', $1)`, [`${A}/b.pdf`]), /row-level security/)
})
await test('대기 회원은 파일을 못 받음', async () => {
  eq(await rows(C, 'select name from storage.objects'), [])
  eq((await rows(A, 'select name from storage.objects')).length, 1)
})
await test('남의 파일은 못 지우지만 관리자는 지울 수 있음', async () => {
  await as(A, `insert into storage.objects (bucket_id, name) values ('resources', $1)`, [`${A}/c.pdf`])
  eq(await rows(B, `delete from storage.objects where name = $1 returning name`, [`${A}/c.pdf`]), [])
  eq((await rows(A, `delete from storage.objects where name = $1 returning name`, [`${B}/a.pdf`])).length, 1)
})

console.log('\n이용 제한')
await test('거절(정지)된 회원은 다시 못 봄', async () => {
  await as(A, `select admin_set_member($1, 'rejected')`, [B])
  eq(await rows(B, 'select id from resources'), [])
  eq(await rows(B, 'select id from posts'), [])
})
await test('승인 회원은 대기 회원 이름을 못 봄', async () => {
  await as(A, `select admin_set_member($1, 'approved')`, [B])
  const names = (await rows(B, 'select name from profiles order by name')).map((r) => r.name)
  eq(names, ['관리자', '김수학'])
})

console.log(`\n${passed}개 통과, ${failed}개 실패\n`)
process.exit(failed ? 1 : 0)
