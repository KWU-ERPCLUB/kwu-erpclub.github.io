-- 0008 — 워크스페이스 개편 2차(2026-08-06 오너 확정): 스터디 흐름 + 자유 디자인 기고.
-- ① flow_weeks: 주차별 스터디 흐름 기록(지난주 뭐 했고·이번주 뭐 하고·다음주 뭐 할지).
--    열람 = 멤버 / 쓰기·삭제 = 운영진(0002 is_member·is_staff 재사용).
-- ② articles."형식": 기고 투트랙 2트랙(본인이 디자인까지 한 단일 HTML) 저장 구분.
--    'md'(기본 — 사이트 서식 렌더) | 'html'(샌드박스 iframe 렌더, 스크립트 차단).
-- 적용 = Supabase SQL 에디터에서 1회 실행.

create table flow_weeks (
  id uuid primary key default gen_random_uuid(),
  "주차" text not null,               -- 표시용(예: '9월 2주')
  "시작일" date not null,             -- 주 판정 기준(시작일~+6일)
  "제목" text not null,               -- 그 주의 한 줄(예: '킥오프 — 개인 주제 확정')
  "내용" text default '',             -- 세부(개조식 여러 줄)
  created_at timestamptz not null default now()
);

alter table flow_weeks enable row level security;

create policy flow_select_member on flow_weeks
  for select to authenticated using (is_member());
create policy flow_write_staff on flow_weeks
  for all to authenticated using (is_staff()) with check (is_staff());

alter table articles add column "형식" text not null default 'md'
  check ("형식" in ('md', 'html'));
