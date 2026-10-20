-- =====================================================================
--  Shrek Math Hub — 데이터베이스 설정
--  Supabase 대시보드 → SQL Editor → 이 파일 내용을 통째로 붙여 넣고 [Run].
--  여러 번 실행해도 안전합니다(이미 있는 것은 건너뛰거나 새로 고칩니다).
--
--  핵심 규칙
--  · 관리자 승인을 받은 선생님(status = 'approved')만 자료·글·댓글을 보고 쓸 수 있습니다.
--  · 가장 먼저 가입한 사람이 자동으로 관리자가 됩니다.
--  · 자료 파일은 비공개 저장소에 두어, 주소를 알아도 승인 회원이 아니면 받을 수 없습니다.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. 회원
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 30),
  school_level text not null default '고' check (school_level in ('중', '고', '중고')),
  role         text not null default 'member' check (role in ('member', 'admin')),
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at   timestamptz not null default now()
);

-- 관리자와 본인만 보는 정보 (이메일, 학교, 가입 때 남긴 교사 확인 메모)
create table if not exists public.profile_private (
  id     uuid primary key references public.profiles (id) on delete cascade,
  email  text,
  school text check (char_length(school) <= 100),
  note   text check (char_length(note) <= 1000)
);

-- RLS 안에서 쓰는 도우미 (security definer: profiles 의 RLS 를 다시 타지 않게)
create or replace function public.is_approved() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and status = 'approved');
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles
                 where id = auth.uid() and status = 'approved' and role = 'admin');
$$;

-- 가입하면 profiles 를 자동으로 만든다. 첫 가입자는 관리자로 바로 승인.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  meta       jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  first_user boolean;
begin
  select not exists (select 1 from public.profiles) into first_user;

  insert into public.profiles (id, name, school_level, role, status)
  values (
    new.id,
    left(coalesce(nullif(trim(meta ->> 'name'), ''), split_part(new.email, '@', 1)), 30),
    case when meta ->> 'school_level' in ('중', '고', '중고') then meta ->> 'school_level' else '고' end,
    case when first_user then 'admin' else 'member' end,
    case when first_user then 'approved' else 'pending' end
  );

  insert into public.profile_private (id, email, school, note)
  values (new.id, new.email, left(meta ->> 'school', 100), left(meta ->> 'note', 1000));

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 관리자: 회원 승인·거절·관리자 지정
create or replace function public.admin_set_member(target uuid, new_status text, new_role text default null)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception '관리자만 할 수 있어요.';
  end if;
  if target = auth.uid() then
    raise exception '내 계정의 상태는 바꿀 수 없어요.';
  end if;
  if new_status not in ('pending', 'approved', 'rejected') then
    raise exception '알 수 없는 상태예요: %', new_status;
  end if;
  if new_role is not null and new_role not in ('member', 'admin') then
    raise exception '알 수 없는 역할이에요: %', new_role;
  end if;

  update public.profiles
     set status = new_status,
         role   = coalesce(new_role, role)
   where id = target;
end $$;

-- ---------------------------------------------------------------------
-- 2. 자료실 · 게시판 · 댓글 · 좋아요 · 북마크 · 신고
-- ---------------------------------------------------------------------
create table if not exists public.resources (
  id             bigint generated always as identity primary key,
  author_id      uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title          text not null check (char_length(title) between 1 and 120),
  description    text not null default '' check (char_length(description) <= 20000),
  school_level   text not null check (school_level in ('중', '고')),
  subject        text not null check (char_length(subject) between 1 and 40),
  unit           text not null default '' check (char_length(unit) <= 60),
  resource_type  text not null check (char_length(resource_type) between 1 and 40),
  link_url       text check (link_url is null or (link_url ~* '^https?://' and char_length(link_url) <= 500)),
  files          jsonb not null default '[]'::jsonb check (jsonb_typeof(files) = 'array'),
  download_count integer not null default 0,
  featured       boolean not null default false,  -- 관리자 추천 자료
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists resources_created_idx on public.resources (created_at desc);
create index if not exists resources_filter_idx on public.resources (school_level, subject, resource_type);
create index if not exists resources_author_idx on public.resources (author_id);

create table if not exists public.posts (
  id         bigint generated always as identity primary key,
  author_id  uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  category   text not null check (char_length(category) between 1 and 20),
  title      text not null check (char_length(title) between 1 and 120),
  body       text not null default '' check (char_length(body) <= 30000),
  solved     boolean not null default false,  -- 질문 글: 해결됨
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists posts_created_idx on public.posts (created_at desc);
create index if not exists posts_author_idx on public.posts (author_id);

-- 예전에 만든 데이터베이스에도 새 칸을 더한다 (이미 있으면 건너뜀)
alter table public.resources add column if not exists featured boolean not null default false;
alter table public.posts add column if not exists solved boolean not null default false;
create index if not exists resources_featured_idx on public.resources (created_at desc) where featured;
create index if not exists posts_category_idx on public.posts (category, created_at desc);

create table if not exists public.comments (
  id          bigint generated always as identity primary key,
  author_id   uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  resource_id bigint references public.resources (id) on delete cascade,
  post_id     bigint references public.posts (id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 5000),
  created_at  timestamptz not null default now(),
  check (num_nonnulls(resource_id, post_id) = 1)
);
create index if not exists comments_resource_idx on public.comments (resource_id);
create index if not exists comments_post_idx on public.comments (post_id);

create table if not exists public.likes (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  resource_id bigint references public.resources (id) on delete cascade,
  post_id     bigint references public.posts (id) on delete cascade,
  created_at  timestamptz not null default now(),
  check (num_nonnulls(resource_id, post_id) = 1)
);
create unique index if not exists likes_resource_uniq on public.likes (user_id, resource_id) where resource_id is not null;
create unique index if not exists likes_post_uniq on public.likes (user_id, post_id) where post_id is not null;
create index if not exists likes_resource_idx on public.likes (resource_id);
create index if not exists likes_post_idx on public.likes (post_id);

create table if not exists public.bookmarks (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  resource_id bigint references public.resources (id) on delete cascade,
  post_id     bigint references public.posts (id) on delete cascade,
  created_at  timestamptz not null default now(),
  check (num_nonnulls(resource_id, post_id) = 1)
);
create unique index if not exists bookmarks_resource_uniq on public.bookmarks (user_id, resource_id) where resource_id is not null;
create unique index if not exists bookmarks_post_uniq on public.bookmarks (user_id, post_id) where post_id is not null;

create table if not exists public.reports (
  id          bigint generated always as identity primary key,
  reporter_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  resource_id bigint references public.resources (id) on delete cascade,
  post_id     bigint references public.posts (id) on delete cascade,
  comment_id  bigint references public.comments (id) on delete cascade,
  reason      text not null check (char_length(reason) between 1 and 500),
  status      text not null default 'open' check (status in ('open', 'closed')),
  created_at  timestamptz not null default now(),
  check (num_nonnulls(resource_id, post_id, comment_id) = 1)
);

-- 수정 시각 자동 기록
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- 내용을 고쳤을 때만 (내려받기 수·추천·해결됨 표시는 "고침"으로 치지 않음)
drop trigger if exists resources_touch on public.resources;
create trigger resources_touch before update on public.resources
  for each row when (old.* is distinct from new.*
                     and old.download_count = new.download_count and old.featured = new.featured)
  execute function public.touch_updated_at();

drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row when (old.* is distinct from new.* and old.solved = new.solved)
  execute function public.touch_updated_at();

-- 관리자: 추천 자료 지정·해제
create or replace function public.admin_feature_resource(rid bigint, on_off boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception '관리자만 할 수 있어요.';
  end if;
  update public.resources set featured = on_off where id = rid;
end $$;

-- 내려받기 횟수 (작성자가 아니어도 +1 만 할 수 있게)
create or replace function public.count_download(rid bigint) returns void
language sql security definer set search_path = '' as $$
  update public.resources set download_count = download_count + 1
   where id = rid and public.is_approved();
$$;

-- ---------------------------------------------------------------------
-- 3. 권한 (어떤 칸을 고칠 수 있는지)
--    Supabase 는 기본으로 모든 칸 권한을 주므로, 필요한 것만 다시 준다.
-- ---------------------------------------------------------------------
revoke all on public.profiles, public.profile_private, public.resources, public.posts,
              public.comments, public.likes, public.bookmarks, public.reports
  from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (name, school_level) on public.profiles to authenticated;

grant select on public.profile_private to authenticated;
grant update (school, note) on public.profile_private to authenticated;

grant select, delete on public.resources to authenticated;
grant insert (title, description, school_level, subject, unit, resource_type, link_url, files)
  on public.resources to authenticated;
grant update (title, description, school_level, subject, unit, resource_type, link_url, files)
  on public.resources to authenticated;

grant select, delete on public.posts to authenticated;
grant insert (category, title, body) on public.posts to authenticated;
grant update (category, title, body, solved) on public.posts to authenticated;

grant select, delete on public.comments to authenticated;
grant insert (resource_id, post_id, body) on public.comments to authenticated;
grant update (body) on public.comments to authenticated;

grant select, delete on public.likes to authenticated;
grant insert (resource_id, post_id) on public.likes to authenticated;

grant select, delete on public.bookmarks to authenticated;
grant insert (resource_id, post_id) on public.bookmarks to authenticated;

grant select, delete on public.reports to authenticated;
grant insert (resource_id, post_id, comment_id, reason) on public.reports to authenticated;
grant update (status) on public.reports to authenticated;

revoke all on function public.admin_set_member(uuid, text, text) from public, anon;
revoke all on function public.count_download(bigint) from public, anon;
revoke all on function public.admin_feature_resource(bigint, boolean) from public, anon;
grant execute on function public.admin_feature_resource(bigint, boolean) to authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.admin_set_member(uuid, text, text) to authenticated;
grant execute on function public.count_download(bigint) to authenticated;
grant execute on function public.is_approved() to authenticated;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------
-- 4. 행 보안 규칙 (RLS: 누가 어떤 줄을 보고 고칠 수 있는지)
-- ---------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.profile_private enable row level security;
alter table public.resources       enable row level security;
alter table public.posts           enable row level security;
alter table public.comments        enable row level security;
alter table public.likes           enable row level security;
alter table public.bookmarks       enable row level security;
alter table public.reports         enable row level security;

-- profiles: 본인·관리자는 늘, 승인 회원은 다른 승인 회원 이름만
drop policy if exists "profiles 보기" on public.profiles;
create policy "profiles 보기" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin() or (status = 'approved' and public.is_approved()));
drop policy if exists "profiles 내 정보 고치기" on public.profiles;
create policy "profiles 내 정보 고치기" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "private 보기" on public.profile_private;
create policy "private 보기" on public.profile_private for select to authenticated
  using (id = auth.uid() or public.is_admin());
drop policy if exists "private 내 정보 고치기" on public.profile_private;
create policy "private 내 정보 고치기" on public.profile_private for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- resources / posts: 승인 회원은 보고 쓰기, 고치기는 작성자, 지우기는 작성자·관리자
drop policy if exists "resources 보기" on public.resources;
create policy "resources 보기" on public.resources for select to authenticated
  using (public.is_approved());
drop policy if exists "resources 쓰기" on public.resources;
create policy "resources 쓰기" on public.resources for insert to authenticated
  with check (public.is_approved() and author_id = auth.uid());
drop policy if exists "resources 고치기" on public.resources;
create policy "resources 고치기" on public.resources for update to authenticated
  using (public.is_approved() and author_id = auth.uid())
  with check (author_id = auth.uid());
drop policy if exists "resources 지우기" on public.resources;
create policy "resources 지우기" on public.resources for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

drop policy if exists "posts 보기" on public.posts;
create policy "posts 보기" on public.posts for select to authenticated
  using (public.is_approved());
-- '공지' 분류는 관리자만 쓸 수 있다
drop policy if exists "posts 쓰기" on public.posts;
create policy "posts 쓰기" on public.posts for insert to authenticated
  with check (public.is_approved() and author_id = auth.uid() and (category <> '공지' or public.is_admin()));
drop policy if exists "posts 고치기" on public.posts;
create policy "posts 고치기" on public.posts for update to authenticated
  using (public.is_approved() and author_id = auth.uid())
  with check (author_id = auth.uid() and (category <> '공지' or public.is_admin()));
drop policy if exists "posts 지우기" on public.posts;
create policy "posts 지우기" on public.posts for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

drop policy if exists "comments 보기" on public.comments;
create policy "comments 보기" on public.comments for select to authenticated
  using (public.is_approved());
drop policy if exists "comments 쓰기" on public.comments;
create policy "comments 쓰기" on public.comments for insert to authenticated
  with check (public.is_approved() and author_id = auth.uid());
drop policy if exists "comments 고치기" on public.comments;
create policy "comments 고치기" on public.comments for update to authenticated
  using (public.is_approved() and author_id = auth.uid())
  with check (author_id = auth.uid());
drop policy if exists "comments 지우기" on public.comments;
create policy "comments 지우기" on public.comments for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- likes: 개수는 승인 회원 모두가 보고, 누르기·취소는 본인
drop policy if exists "likes 보기" on public.likes;
create policy "likes 보기" on public.likes for select to authenticated
  using (public.is_approved());
drop policy if exists "likes 누르기" on public.likes;
create policy "likes 누르기" on public.likes for insert to authenticated
  with check (public.is_approved() and user_id = auth.uid());
drop policy if exists "likes 취소" on public.likes;
create policy "likes 취소" on public.likes for delete to authenticated
  using (user_id = auth.uid());

-- bookmarks: 본인만
drop policy if exists "bookmarks 보기" on public.bookmarks;
create policy "bookmarks 보기" on public.bookmarks for select to authenticated
  using (user_id = auth.uid());
drop policy if exists "bookmarks 담기" on public.bookmarks;
create policy "bookmarks 담기" on public.bookmarks for insert to authenticated
  with check (public.is_approved() and user_id = auth.uid());
drop policy if exists "bookmarks 빼기" on public.bookmarks;
create policy "bookmarks 빼기" on public.bookmarks for delete to authenticated
  using (user_id = auth.uid());

-- reports: 승인 회원이 신고, 관리자가 처리
drop policy if exists "reports 보기" on public.reports;
create policy "reports 보기" on public.reports for select to authenticated
  using (reporter_id = auth.uid() or public.is_admin());
drop policy if exists "reports 신고" on public.reports;
create policy "reports 신고" on public.reports for insert to authenticated
  with check (public.is_approved() and reporter_id = auth.uid());
drop policy if exists "reports 처리" on public.reports;
create policy "reports 처리" on public.reports for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "reports 지우기" on public.reports;
create policy "reports 지우기" on public.reports for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- 5. 자료 파일 저장소 (비공개, 파일 하나 최대 50MB)
--    파일 경로는 "<올린 사람 id>/<임의 이름>.<확장자>"
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('resources', 'resources', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists "자료 파일 받기" on storage.objects;
create policy "자료 파일 받기" on storage.objects for select to authenticated
  using (bucket_id = 'resources' and public.is_approved());
drop policy if exists "자료 파일 올리기" on storage.objects;
create policy "자료 파일 올리기" on storage.objects for insert to authenticated
  with check (bucket_id = 'resources' and public.is_approved()
              and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "자료 파일 지우기" on storage.objects;
create policy "자료 파일 지우기" on storage.objects for delete to authenticated
  using (bucket_id = 'resources'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ---------------------------------------------------------------------
-- 6. 교육과정 지도·관리자 통계
-- ---------------------------------------------------------------------
-- 과목·단원별 자료 수: 부른 사람 권한으로 실행되므로 승인 회원만 결과를 받는다
create or replace function public.resource_counts()
returns table (school_level text, subject text, unit text, n bigint)
language sql stable security invoker set search_path = '' as $$
  select r.school_level, r.subject, r.unit, count(*) from public.resources r group by 1, 2, 3;
$$;
revoke all on function public.resource_counts() from public, anon;
grant execute on function public.resource_counts() to authenticated;

-- 관리자 통계: 회원·자료·글 수, 총 내려받기, 실제 파일 저장 용량
create or replace function public.admin_stats() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception '관리자만 볼 수 있어요.';
  end if;
  return jsonb_build_object(
    'members', (select count(*) from public.profiles where status = 'approved'),
    'pending', (select count(*) from public.profiles where status = 'pending'),
    'resources', (select count(*) from public.resources),
    'posts', (select count(*) from public.posts),
    'comments', (select count(*) from public.comments),
    'downloads', (select coalesce(sum(download_count), 0) from public.resources),
    'files', (select count(*) from storage.objects where bucket_id = 'resources'),
    'storage_bytes', (select coalesce(sum((metadata ->> 'size')::bigint), 0) from storage.objects where bucket_id = 'resources')
  );
end $$;
revoke all on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;
