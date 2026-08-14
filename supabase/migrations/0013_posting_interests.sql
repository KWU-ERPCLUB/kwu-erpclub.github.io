-- 0013 — 관심 공고(posting_interests): 공고 카드의 ★ 체크(2026-08-14 오너 — 내정보 상단에 관심 공고 노출).
-- article_bookmarks와 동형(개인×콘텐츠 상호작용): 본인 행만 읽고·켜고·끈다. 총계 노출 없음.
-- 적용 = Supabase SQL 에디터에서 1회 실행(supabase/README.md 절차 동일). 미적용이어도 앱은 강등 동작(관심 목록 빈 배열).

create table posting_interests (
  posting_id uuid not null references postings(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (posting_id, member_id)
);

alter table posting_interests enable row level security;

create policy posting_interests_select_self on posting_interests
  for select to authenticated using (member_id = auth.uid());
create policy posting_interests_insert_self on posting_interests
  for insert to authenticated with check (member_id = auth.uid() and is_member());
create policy posting_interests_delete_self on posting_interests
  for delete to authenticated using (member_id = auth.uid());
