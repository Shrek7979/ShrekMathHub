-- 2026-10-22 "수업에 써 봤어요" 후기
--   한 사람이 한 자료에 한 번. 한 줄 후기(note)는 선택(200자).
--   규칙은 likes 와 같다: 승인 회원이 보고, 넣기·지우기는 본인만.
create table if not exists public.classroom_uses (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  resource_id bigint not null references public.resources (id) on delete cascade,
  note        text not null default '' check (char_length(note) <= 200),
  created_at  timestamptz not null default now(),
  unique (user_id, resource_id)
);
create index if not exists classroom_uses_resource_idx on public.classroom_uses (resource_id);

alter table public.classroom_uses enable row level security;
revoke all on public.classroom_uses from anon, authenticated;
grant select, delete on public.classroom_uses to authenticated;
grant insert (resource_id, note) on public.classroom_uses to authenticated;

drop policy if exists "classroom_uses 보기" on public.classroom_uses;
create policy "classroom_uses 보기" on public.classroom_uses for select to authenticated
  using (public.is_approved());
drop policy if exists "classroom_uses 남기기" on public.classroom_uses;
create policy "classroom_uses 남기기" on public.classroom_uses for insert to authenticated
  with check (public.is_approved() and user_id = auth.uid());
drop policy if exists "classroom_uses 취소" on public.classroom_uses;
create policy "classroom_uses 취소" on public.classroom_uses for delete to authenticated
  using (user_id = auth.uid());
