-- 2026-10-20 3차(보안) 검토 반영

-- 1) 가입 방법(google / email) 기록 → 관리자 화면에 보여 준다
alter table public.profile_private add column if not exists provider text;
update public.profile_private p
   set provider = coalesce(u.raw_app_meta_data ->> 'provider', 'email')
  from auth.users u
 where u.id = p.id and p.provider is null;

-- 2) '첫 가입자 = 관리자'는 딱 한 번 (동시 가입, 회원을 다 지운 뒤 다시 생기는 것 막기)
create table if not exists public.app_flags (
  key        text primary key,
  value      text not null,
  created_at timestamptz not null default now()
);
alter table public.app_flags enable row level security;
revoke all on public.app_flags from anon, authenticated;
insert into public.app_flags (key, value)
  select 'admin_bootstrapped', 'yes' where exists (select 1 from public.profiles where role = 'admin')
  on conflict (key) do nothing;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  meta       jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  first_user boolean;
  v_name     text;
begin
  -- 두 사람이 동시에 가입해도 관리자가 둘 생기지 않게 차례로
  perform pg_advisory_xact_lock(hashtext('smh_first_admin'));
  select not exists (select 1 from public.app_flags where key = 'admin_bootstrapped') into first_user;
  if first_user then
    insert into public.app_flags (key, value) values ('admin_bootstrapped', 'yes');
  end if;

  v_name := left(coalesce(nullif(btrim(meta ->> 'name'), ''), split_part(new.email, '@', 1)), 30);
  -- 일반 회원 이름에는 '관리자'·'운영자'를 쓸 수 없다 (profiles_name_valid)
  if not first_user then
    v_name := btrim(regexp_replace(v_name, '(관리자|운영자)', '', 'g'));
  end if;
  if v_name = '' then
    v_name := left(split_part(new.email, '@', 1), 30);
  end if;

  insert into public.profiles (id, name, school_level, role, status)
  values (
    new.id,
    v_name,
    case when meta ->> 'school_level' in ('중', '고', '중고') then meta ->> 'school_level' else '고' end,
    case when first_user then 'admin' else 'member' end,
    case when first_user then 'approved' else 'pending' end
  );

  insert into public.profile_private (id, email, school, note, provider)
  values (new.id, new.email, left(meta ->> 'school', 100), left(meta ->> 'note', 1000),
          coalesce(new.raw_app_meta_data ->> 'provider', 'email'));

  return new;
end $$;

-- 3) 이름: 빈칸만은 안 되고, 관리자가 아니면 '관리자'·'운영자'를 쓸 수 없다
alter table public.profiles drop constraint if exists profiles_name_valid;
alter table public.profiles add constraint profiles_name_valid
  check (char_length(btrim(name)) >= 1 and (role = 'admin' or name !~ '(관리자|운영자)'));

-- 4) 자료 파일 정보: 경로는 사이트가 만드는 모양만, 확장자는 정해진 것만, 보이지 않는 글자 금지
create or replace function public.valid_files(f jsonb, owner uuid) returns boolean
language sql immutable set search_path = '' as $$
  select jsonb_typeof(f) = 'array'
     and jsonb_array_length(f) <= 10
     and coalesce((
       select bool_and(coalesce(
                jsonb_typeof(e) = 'object'
            and jsonb_typeof(e -> 'path') = 'string'
            and (e ->> 'path') ~ ('^' || owner::text || '/[0-9a-f-]{36}(\.[a-z0-9]{1,8})?$')
            and jsonb_typeof(e -> 'name') = 'string'
            and char_length(e ->> 'name') between 1 and 200
            and lower(e ->> 'name') ~ '\.(hwp|hwpx|hwt|pdf|ppt|pptx|pps|ppsx|key|show|cell|doc|docx|xls|xlsx|csv|txt|md|tex|ggb|png|jpg|jpeg|gif|webp|zip|mp3|m4a|mp4|ipynb|py)$'
            and (e ->> 'name') !~ ('[[:cntrl:]' || chr(8203) || '-' || chr(8207) || chr(8234) || '-' || chr(8238) || chr(8294) || '-' || chr(8297) || ']')
            and jsonb_typeof(e -> 'size') = 'number', false))
         from jsonb_array_elements(f) e), true);
$$;
alter table public.resources drop constraint if exists resources_files_valid;
alter table public.resources add constraint resources_files_valid check (public.valid_files(files, author_id));

-- 5) 내려받기 수는 한 사람이 한 자료에 한 번만 센다
-- 자체 id 를 기본 키로 둔다: (user_id, resource_id) 를 기본 키로 하면 PostgREST 가 이 표를
-- resources ↔ profiles 의 다대다 연결로 보고 author:profiles(...) 를 모호하다며 거절한다.
create table if not exists public.downloads (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  resource_id bigint not null references public.resources (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, resource_id)
);
alter table public.downloads enable row level security;
revoke all on public.downloads from anon, authenticated;

create or replace function public.count_download(rid bigint) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_approved() then
    return;
  end if;
  insert into public.downloads (user_id, resource_id) values (auth.uid(), rid) on conflict do nothing;
  if found then
    update public.resources set download_count = download_count + 1 where id = rid;
  end if;
end $$;
revoke all on function public.count_download(bigint) from public, anon;
grant execute on function public.count_download(bigint) to authenticated;

-- 6) 회원 한 사람이 올릴 수 있는 파일 수 (관리자는 제한 없음)
create or replace function public.my_file_count() returns bigint
language sql stable security definer set search_path = '' as $$
  select count(*) from storage.objects
   where bucket_id = 'resources' and name like auth.uid()::text || '/%';
$$;
revoke all on function public.my_file_count() from public, anon;
grant execute on function public.my_file_count() to authenticated;

drop policy if exists "자료 파일 올리기" on storage.objects;
create policy "자료 파일 올리기" on storage.objects for insert to authenticated
  with check (bucket_id = 'resources' and public.is_approved()
              and (storage.foldername(name))[1] = auth.uid()::text
              and (public.is_admin() or public.my_file_count() < 200));
