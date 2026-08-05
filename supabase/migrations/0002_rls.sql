-- 0002_rls.sql — RLS 정책(권한 매트릭스 §3) + 판정 P3·P5의 구현
-- 원천: erp-club/docs/specs/2026-08-05-워크스페이스-백엔드.md §3
-- 원칙: 클라이언트에는 anon key만 나간다(§1 키 규칙) → 방어선 전부가 이 파일이다.
--       정책 없는 테이블 = 익명에게 전부 거부(RLS 활성 + 정책 부재 = deny).

-- ─────────────────────────────────────────────
-- 역할 판별 헬퍼 — members 자신에 대한 정책이 members를 다시 조회하면 무한 재귀가 되므로
-- security definer 함수로 RLS를 우회해 role만 읽는다(표준 패턴).
-- ─────────────────────────────────────────────
create function is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from members m where m.id = auth.uid());
$$;

create function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from members m where m.id = auth.uid() and m.role = '운영진');
$$;

revoke execute on function is_member(), is_staff() from anon;
grant  execute on function is_member(), is_staff() to authenticated;

alter table members           enable row level security;
alter table member_private    enable row level security;
alter table sessions          enable row level security;
alter table session_materials enable row level security;
alter table assignments       enable row level security;
alter table submissions       enable row level security;
alter table articles          enable row level security;
alter table article_bookmarks enable row level security;
alter table article_likes     enable row level security;
alter table collections       enable row level security;
alter table notices           enable row level security;
alter table ops_log           enable row level security;
alter table seminars          enable row level security;

-- ─────────────────────────────────────────────
-- members (§3 "멤버 명단·프로필": 익명 —, 스터디원 이름·소개·관심사, 운영진 +관리)
-- 익명 정책 없음 → 익명 select 전부 실패(P3)
-- ─────────────────────────────────────────────
create policy members_select_member on members
  for select to authenticated using (is_member());
create policy members_update_self on members
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and role = (select m.role from members m where m.id = auth.uid()));
create policy members_manage_staff on members
  for all to authenticated using (is_staff()) with check (is_staff());
-- 자가입 차단(§0-4): insert 정책은 운영진(members_manage_staff)뿐 — 본인 insert 경로 없음

-- member_private (§0-5 학번·전공 = 운영진만 열람 → P5)
-- 본인은 자기 값을 쓰고 읽을 수 있으나, 타 스터디원 행은 조회 불가.
create policy member_private_select_self_or_staff on member_private
  for select to authenticated using (member_id = auth.uid() or is_staff());
create policy member_private_write_self on member_private
  for insert to authenticated with check (member_id = auth.uid());
create policy member_private_update_self on member_private
  for update to authenticated using (member_id = auth.uid()) with check (member_id = auth.uid());
create policy member_private_manage_staff on member_private
  for all to authenticated using (is_staff()) with check (is_staff());

-- ─────────────────────────────────────────────
-- 세션·자료·과제 (§3: 익명 — / 스터디원 읽기 / 운영진 쓰기)
-- ─────────────────────────────────────────────
create policy sessions_select_member on sessions
  for select to authenticated using (is_member());
create policy sessions_write_staff on sessions
  for all to authenticated using (is_staff()) with check (is_staff());

create policy materials_select_member on session_materials
  for select to authenticated using (is_member());
create policy materials_write_staff on session_materials
  for all to authenticated using (is_staff()) with check (is_staff());

create policy assignments_select_member on assignments
  for select to authenticated using (is_member());
create policy assignments_write_staff on assignments
  for all to authenticated using (is_staff()) with check (is_staff());

-- 제출 = 본인 쓰기 / 열람은 본인 + 운영진(§3 "제출=본인 쓰기")
create policy submissions_select_own_or_staff on submissions
  for select to authenticated using (member_id = auth.uid() or is_staff());
create policy submissions_insert_own on submissions
  for insert to authenticated with check (member_id = auth.uid());
create policy submissions_update_own on submissions
  for update to authenticated using (member_id = auth.uid()) with check (member_id = auth.uid());
create policy submissions_delete_own on submissions
  for delete to authenticated using (member_id = auth.uid());
create policy submissions_manage_staff on submissions
  for all to authenticated using (is_staff()) with check (is_staff());

-- ─────────────────────────────────────────────
-- articles (§3: 게재분 = 익명 읽기 / 초안·기고 = 본인 작성·수정 / 승인·게재 전환 = 운영진)
-- ─────────────────────────────────────────────
create policy articles_select_published_anon on articles
  for select to anon using (상태 = '게재');
create policy articles_select_published_auth on articles
  for select to authenticated using (상태 = '게재' or 작성자 = auth.uid() or is_staff());
create policy articles_insert_own_draft on articles
  for insert to authenticated with check (is_member() and 작성자 = auth.uid() and 상태 in ('초안', '승인대기'));
-- 본인 글 수정 가능하나 '게재'로는 못 올림 → 게재 전환은 운영진 정책으로만(§0-8)
create policy articles_update_own_draft on articles
  for update to authenticated
  using (작성자 = auth.uid() and 상태 in ('초안', '승인대기'))
  with check (작성자 = auth.uid() and 상태 in ('초안', '승인대기'));
create policy articles_manage_staff on articles
  for all to authenticated using (is_staff()) with check (is_staff());

-- 북마크·좋아요 = 로그인 멤버 본인 행만(D3)
create policy bookmarks_own on article_bookmarks
  for all to authenticated using (member_id = auth.uid()) with check (member_id = auth.uid());
create policy likes_own on article_likes
  for all to authenticated using (member_id = auth.uid()) with check (member_id = auth.uid());

-- 개인 컬렉션 = 본인만(운영진도 열람 불가 — §8 [미정-3] 기본 권고값)
create policy collections_own on collections
  for all to authenticated using (member_id = auth.uid()) with check (member_id = auth.uid());

-- ─────────────────────────────────────────────
-- 공지·운영 로그 — 내부여부=false = 공개 요약(§2). 내부 상세는 멤버만.
-- ─────────────────────────────────────────────
create policy notices_select_public_anon on notices
  for select to anon using (내부여부 = false);
create policy notices_select_member on notices
  for select to authenticated using (내부여부 = false or is_member());
create policy notices_write_staff on notices
  for all to authenticated using (is_staff()) with check (is_staff());

create policy ops_log_select_public_anon on ops_log
  for select to anon using (내부여부 = false);
create policy ops_log_select_member on ops_log
  for select to authenticated using (내부여부 = false or is_member());
create policy ops_log_write_staff on ops_log
  for all to authenticated using (is_staff()) with check (is_staff());

-- 세미나 — 공개여부=true면 익명 열람, 내부 진행판은 멤버만(§2)
create policy seminars_select_public_anon on seminars
  for select to anon using (공개여부 = true);
create policy seminars_select_member on seminars
  for select to authenticated using (공개여부 = true or is_member());
create policy seminars_write_staff on seminars
  for all to authenticated using (is_staff()) with check (is_staff());

-- ─────────────────────────────────────────────
-- 테이블 권한(RLS 이전 단계의 grant) — 익명에게는 select만, 그것도 위 정책이 걸러낸다.
-- ─────────────────────────────────────────────
revoke all on all tables in schema public from anon, authenticated;
grant select on articles, notices, ops_log, seminars to anon;
grant select on members_public to authenticated;
grant select, insert, update, delete on
  members, member_private, sessions, session_materials, assignments, submissions,
  articles, article_bookmarks, article_likes, collections, notices, ops_log, seminars
  to authenticated;
