-- 2026-10-20 1차 검토 반영: 자료 파일 정보 검사, 게시판 분류 고정, 파일 형식 제한, 연결 안 된 파일 찾기

-- 자료의 files 칸: 10개 이하, 각 항목은 {path, name, size} 이고 path 는 반드시 "올린 사람 id/" 로 시작
create or replace function public.valid_files(f jsonb, owner uuid) returns boolean
language sql immutable set search_path = '' as $$
  select jsonb_typeof(f) = 'array'
     and jsonb_array_length(f) <= 10
     and coalesce((
       -- 칸이 빠져 결과가 NULL 이면 통과가 아니라 거절로 친다
       select bool_and(coalesce(
                jsonb_typeof(e) = 'object'
            and jsonb_typeof(e -> 'path') = 'string'
            and starts_with(e ->> 'path', owner::text || '/')
            and position('..' in (e ->> 'path')) = 0
            and jsonb_typeof(e -> 'name') = 'string'
            and char_length(e ->> 'name') between 1 and 200
            and jsonb_typeof(e -> 'size') = 'number', false))
         from jsonb_array_elements(f) e), true);
$$;
alter table public.resources drop constraint if exists resources_files_valid;
alter table public.resources add constraint resources_files_valid check (public.valid_files(files, author_id));

-- 게시판 분류는 정해진 것만 ('📢 공지' 같은 가짜 공지 막기)
alter table public.posts drop constraint if exists posts_category_valid;
alter table public.posts add constraint posts_category_valid
  check (category in ('공지', '질문', '수업 나눔', '평가·수행평가', '교육과정·연수', '업무·생활', '자유'));

-- 파일 형식: 사이트가 정해서 보내는 것만 받는다 (HTML·스크립트 등은 저장소에서 거절)
update storage.buckets
   set allowed_mime_types = array[
     'application/octet-stream', 'application/pdf',
     'image/png', 'image/jpeg', 'image/gif', 'image/webp',
     'text/plain', 'text/plain;charset=utf-8',
     'audio/mpeg', 'audio/mp4', 'video/mp4']
 where id = 'resources';

-- 관리자: 어느 자료에도 연결되지 않은 지 하루 넘은 파일 (올리다 창을 닫았거나, 회원 삭제 뒤 남은 것)
create or replace function public.admin_orphan_files() returns setof text
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception '관리자만 할 수 있어요.';
  end if;
  return query
    select o.name from storage.objects o
     where o.bucket_id = 'resources'
       and o.created_at < now() - interval '1 day'
       and not exists (
         select 1 from public.resources r, jsonb_array_elements(r.files) e
          where e ->> 'path' = o.name);
end $$;
revoke all on function public.admin_orphan_files() from public, anon;
grant execute on function public.admin_orphan_files() to authenticated;
