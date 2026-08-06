-- 0007 — 운영 일정(events): 워크스페이스 홈 캘린더의 운영진 등록 일정(2026-08-06 워크스페이스 홈 개편).
-- 열람 = 로그인 멤버 전원 / 쓰기·삭제 = 운영진(is_staff, 0002 정의 재사용).
-- 적용 = Supabase SQL 에디터에서 1회 실행(다른 마이그레이션과 동일 절차 — supabase/README.md).

create table events (
  id uuid primary key default gen_random_uuid(),
  "제목" text not null,
  "날짜" date not null,
  "시간" text default '',            -- 표시용 자유 텍스트(예: '19:00') — 정렬은 날짜만 쓴다
  "설명" text default '',
  "종류" text not null default '일정' check ("종류" in ('일정', '세미나', '모집', '마감')),
  created_at timestamptz not null default now()
);

alter table events enable row level security;

create policy events_select_member on events
  for select to authenticated using (is_member());
create policy events_write_staff on events
  for all to authenticated using (is_staff()) with check (is_staff());
