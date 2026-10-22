-- 2026-10-22 자료 출처·저작권 구분
--   source_kind : own(직접 만듦) / adapted(다른 자료를 고침) / linked(공개 자료 링크)
--   source_note : 출처 설명 (200자). '다른 자료를 고침'이면 꼭 적어야 한다.
alter table public.resources add column if not exists source_kind text not null default 'own';
alter table public.resources add column if not exists source_note text;
alter table public.resources drop constraint if exists resources_source_valid;
alter table public.resources add constraint resources_source_valid
  check (source_kind in ('own', 'adapted', 'linked')
     and (source_note is null or char_length(source_note) <= 200)
     and (source_kind <> 'adapted' or char_length(btrim(coalesce(source_note, ''))) >= 1));

-- 올리기·고치기 화면에서 두 칸을 쓸 수 있게 (칸 단위 권한은 더해진다)
grant insert (source_kind, source_note) on public.resources to authenticated;
grant update (source_kind, source_note) on public.resources to authenticated;
