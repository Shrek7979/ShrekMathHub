-- 2026-10-20 교육과정 지도(과목·단원별 자료 수)와 관리자 통계
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
