-- 0006_applications.sql — /recruit 온사이트 신청 폼 접수 테이블(오너 결정 2026-08-05)
-- 배경: "지원(CTA·폼) 기능 전면 보류(2026-07-10)"를 오너가 해제 — 신청서를 Supabase로 받는다.
-- 권한(오너 확정): 익명 = insert만 / select·update·delete = 운영진(members.role='운영진')만.
--   판별 = 0002_rls.sql의 is_staff() 헬퍼 그대로(0002 선적용 필수).
-- 적용 순서: 0001 → 0002 → 0003 → 0004 → 0005 → 0006.
-- 파괴 연산: 없음(drop·delete·truncate 0건). 재실행 시 정책 중복 오류 = 이미 적용된 상태(무해).

create table if not exists applications (
  id         uuid primary key default gen_random_uuid(),
  이름       text not null check (length(btrim(이름)) > 0),
  -- 학번 형식 = 로그인 규칙과 동일(숫자 4~12자리 — app/src/data/login-id.js)
  학번       text not null check (학번 ~ '^[0-9]{4,12}$'),
  전공       text not null check (length(btrim(전공)) > 0),
  -- 전화번호 형식 느슨히(오너 확정): 숫자·하이픈만
  전화번호   text not null check (전화번호 ~ '^[0-9-]+$'),
  써본ai     text not null default '',
  관심주제   text not null default '',
  created_at timestamptz not null default now()
);

alter table applications enable row level security;

-- 방문자(익명 포함) = 제출만. select 정책이 없으므로 제출자도 남의(자기 것 포함) 신청서를 못 읽는다.
create policy applications_insert_anyone on applications
  for insert to anon, authenticated with check (true);

-- 열람·수정·삭제 = 운영진만(0002 *_manage_staff 패턴). 앱 화면은 읽기 전용 — 수정·삭제 UI 없음.
create policy applications_manage_staff on applications
  for all to authenticated using (is_staff()) with check (is_staff());

-- 테이블 권한(RLS 이전 단계 grant) — 익명은 insert만.
-- 주의: PostgREST의 return=representation은 select 권한을 요구 → 앱은 이 테이블 insert를
--       Prefer: return=minimal로 보낸다(app/src/data/supabase.js insert opts).
revoke all on applications from anon, authenticated;
grant insert on applications to anon;
grant select, insert, update, delete on applications to authenticated;

-- 운영 탭 목록 = 최신순 조회
create index if not exists applications_created_idx on applications (created_at desc);
