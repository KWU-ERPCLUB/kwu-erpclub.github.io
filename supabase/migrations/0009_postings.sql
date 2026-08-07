-- 0009 — 공고(postings): 공모전·채용·자격시험·대외활동 일정을 운영진이 스크랩해 전원과 공유(2026-08-07 공고 탭 신설).
-- 열람 = 로그인 멤버 전원 / 쓰기·삭제 = 운영진(is_staff, 0002 정의 재사용). 개인 스크랩(collections)과 별개.
-- 코멘트 = 필수(오너 확정 2026-08-07) — "MIS·AIM 관점에서 왜 유효한가" 한 줄이 이 보드의 존재 이유.
-- 접수마감 null = 상시(컴활·SAP처럼 회차 없는 항목). 모집중/마감 상태는 저장하지 않는다(접수마감에서 파생).
-- 적용 = Supabase SQL 에디터에서 1회 실행(다른 마이그레이션과 동일 절차 — supabase/README.md).

create table postings (
  id uuid primary key default gen_random_uuid(),
  "제목" text not null,
  "종류" text not null check ("종류" in ('공모전', '채용', '자격시험', '대외활동')),
  "주최" text default '',
  url text not null,
  "접수시작" date,
  "접수마감" date,                    -- null = 상시
  "시험일" date,                      -- 시험·행사일(채용·공모전은 보통 null)
  "코멘트" text not null check (length(trim("코멘트")) > 0),
  "고정" boolean not null default false,
  created_at timestamptz not null default now()
);

alter table postings enable row level security;

create policy postings_select_member on postings
  for select to authenticated using (is_member());
create policy postings_write_staff on postings
  for all to authenticated using (is_staff()) with check (is_staff());
