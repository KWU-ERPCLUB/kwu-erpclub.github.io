-- 0025 — 과제 3종(링크·폼·체크리스트) + 제출 답변 jsonb (2026-09-13 과제 탭 신설)
--
-- 양식(입력 칸 정의)의 원천은 코드다: app/src/data/assignment-forms.js.
-- DB는 그 양식의 '키'만 붙든다(오너 픽 2026-09-13).
--   버린 대안 = assignments.양식 jsonb + 운영 탭 칸 편집기 — 화면이 하나 더 늘고,
--   아직 오너가 칸을 직접 짤 일이 없다. 필요해지면 양식키를 jsonb로 승격한다.
-- 열람 범위 = 현행 그대로(본인 + 운영진, 0002 submissions_select_own_or_staff) — 새 정책 없음.
--
-- 실행 = Supabase erpclub-hub > SQL Editor에 전체 붙여넣기 > Run. 여러 번 실행해도 결과 같음(멱등).

begin;

-- 과제 종류 — 기존 행은 전부 '링크'(지금까지의 유일한 방식).
alter table assignments add column if not exists 종류   text not null default '링크';
alter table assignments add column if not exists 양식키 text;

do $$ begin
  alter table assignments add constraint assignments_kind_enum
    check (종류 in ('링크', '폼', '체크리스트'));
exception when duplicate_object then null; end $$;

-- 폼·체크리스트는 양식키가 있어야 화면이 칸을 그릴 수 있다.
do $$ begin
  alter table assignments add constraint assignments_form_needs_key
    check (종류 = '링크' or (양식키 is not null and length(btrim(양식키)) > 0));
exception when duplicate_object then null; end $$;

-- 제출 — 링크형은 url, 폼·체크리스트형은 답변(jsonb). 둘 중 하나는 있어야 한다.
-- url의 형식 검사(0001 `url ~ '^https?://'`)는 그대로 둔다: null이면 검사가 통과한다.
alter table submissions alter column url drop not null;
alter table submissions add column if not exists 답변 jsonb;

do $$ begin
  alter table submissions add constraint submissions_content_present
    check (url is not null or 답변 is not null);
exception when duplicate_object then null; end $$;

commit;

-- 검증(실행 후):
--   select column_name, is_nullable from information_schema.columns
--    where table_name in ('assignments','submissions') and column_name in ('종류','양식키','url','답변');
--   -- assignments.종류(NO)·양식키(YES) / submissions.url(YES)·답변(YES)
