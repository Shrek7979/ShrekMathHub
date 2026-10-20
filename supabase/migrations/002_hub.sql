-- 2026-10-20 허브 기능: 관리자 추천 자료, 관리자 전용 공지, 질문 "해결됨"
-- 이미 schema.sql 을 실행한 데이터베이스에 이것만 더 실행하면 된다. (schema.sql 에도 같은 내용이 들어 있음)
alter table public.resources add column if not exists featured boolean not null default false;
alter table public.posts add column if not exists solved boolean not null default false;
create index if not exists resources_featured_idx on public.resources (created_at desc) where featured;
create index if not exists posts_category_idx on public.posts (category, created_at desc);

drop trigger if exists resources_touch on public.resources;
create trigger resources_touch before update on public.resources
  for each row when (old.* is distinct from new.* and old.download_count = new.download_count and old.featured = new.featured)
  execute function public.touch_updated_at();
drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row when (old.* is distinct from new.* and old.solved = new.solved)
  execute function public.touch_updated_at();

create or replace function public.admin_feature_resource(rid bigint, on_off boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception '관리자만 할 수 있어요.';
  end if;
  update public.resources set featured = on_off where id = rid;
end $$;
revoke all on function public.admin_feature_resource(bigint, boolean) from public, anon;
grant execute on function public.admin_feature_resource(bigint, boolean) to authenticated;

grant update (category, title, body, solved) on public.posts to authenticated;

drop policy if exists "posts 쓰기" on public.posts;
create policy "posts 쓰기" on public.posts for insert to authenticated
  with check (public.is_approved() and author_id = auth.uid() and (category <> '공지' or public.is_admin()));
drop policy if exists "posts 고치기" on public.posts;
create policy "posts 고치기" on public.posts for update to authenticated
  using (public.is_approved() and author_id = auth.uid())
  with check (author_id = auth.uid() and (category <> '공지' or public.is_admin()));
