-- 0018_posting_link_board.sql — 공고 = 링크 모음판 전환(오너 2026-08-19)
-- 배경: 공고 보드의 목적이 "선별 + 왜 유효한가 한 줄"에서 **"여러 채용 사이트에 흩어진 링크를 한 곳에 모아
--       바로 연결해 주는 것"**으로 바뀌었다. 스터디원이 링커리어·잡코리아를 각각 들어가 보지 않아도 되게 하는 것이 목적.
-- 그 결과 두 가지가 달라진다:
--   ① 코멘트 = 필수 → 선택. 자동 수집분은 수백 건이라 한 줄씩 붙일 수 없다(붙이면 양이 수십 건에 묶인다).
--   ② 출처 = 신설. 어느 사이트에서 온 링크인지 화면에 배지로 보여준다.
-- 멱등: 전 구문 if exists / if not exists. 재실행해도 데이터 변화 없음.
-- 파괴 연산 없음 — check 제약 1개 제거 + 컬럼 1개 추가뿐(기존 코멘트 값은 그대로 남는다).

-- ─────────────────────────────────────────────
-- 1. 코멘트 필수 제약 해제 — 값이 있으면 여전히 화면·운영 탭에서 쓸 수 있다(데이터 유실 없음).
--    제약 이름은 0009에서 인라인 check로 만들어 자동 생성됐다 → 이름으로 찾아 지운다.
-- ─────────────────────────────────────────────
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
     where conrelid = 'postings'::regclass and contype = 'c'
       and pg_get_constraintdef(oid) like '%코멘트%'
  loop
    execute format('alter table postings drop constraint %I', c.conname);
  end loop;
end $$;

alter table postings alter column "코멘트" drop not null;

-- ─────────────────────────────────────────────
-- 2. 출처 — 링크를 어디서 가져왔는가(화면 배지 + 필터). null = 운영진 직접 등록.
--    값은 앱 레지스트리(app/src/workspace/postings-taxonomy.js SOURCES)가 고정한다 —
--    DB는 text로 두어 새 사이트 추가 시 마이그레이션이 필요 없게 한다(분류 컬럼과 같은 방침).
-- ─────────────────────────────────────────────
alter table postings add column if not exists "출처" text;

-- 목록 조회 = 마감·출처 기준이 대부분 → 인덱스 2개.
create index if not exists postings_출처_idx on postings ("출처");
create index if not exists postings_접수마감_idx on postings ("접수마감");
