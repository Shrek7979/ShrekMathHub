-- 2026-10-20 005 의 downloads 표를 자체 id 기본 키로 바꾼다 (자료의 작성자 불러오기가 모호해지던 문제)
-- 이미 바뀐 표(id 칸이 있음)에는 아무것도 하지 않는다.
do $$
begin
  if not exists (select 1 from information_schema.columns
                  where table_schema = 'public' and table_name = 'downloads' and column_name = 'id') then
    drop table if exists public.downloads;
    create table public.downloads (
      id          bigint generated always as identity primary key,
      user_id     uuid not null references public.profiles (id) on delete cascade,
      resource_id bigint not null references public.resources (id) on delete cascade,
      created_at  timestamptz not null default now(),
      unique (user_id, resource_id)
    );
    alter table public.downloads enable row level security;
    revoke all on public.downloads from anon, authenticated;
  end if;
end $$;
