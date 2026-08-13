-- 0012: 세션 본문(차시 상세 — 목표·진행 내용) + 해금 — 2026-08-13
-- 세션(sessions)은 회차·날짜가 캘린더에 늘 보여야 하므로 행을 숨길 수 없다.
-- 본문은 별도 테이블로 두고 자료(0011)와 같은 공개일 게이트를 건다.
-- 멤버 = 공개일 도래 후 열람 / 운영진 = 상시(FOR ALL이 select 포함).

create table session_notes (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references sessions (id) on delete cascade,
  본문       text not null check (length(btrim(본문)) > 0),
  공개일     date,
  created_at timestamptz not null default now()
);

alter table session_notes enable row level security;

create policy notes_select_member on session_notes
  for select to authenticated
  using (is_member() and (공개일 is null or 공개일 <= current_date));
create policy notes_write_staff on session_notes
  for all to authenticated using (is_staff()) with check (is_staff());
