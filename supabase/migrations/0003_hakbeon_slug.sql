-- 0003_hakbeon_slug.sql — 학번 로그인(§0-4 개정) + 동기화 키·상호작용 카운트(§0-6·§3 D3)
-- 원천: erp-club/docs/specs/2026-08-05-워크스페이스-백엔드.md
--   §0-4 인증 = 학번+비밀번호(학번↔가상 이메일 매핑, 입력 UI는 학번만)
--   §0-5 프로필 = 학번은 로그인 ID → members로 이동 / 전공은 member_private 잔류(운영진만 열람)
--   §0-6 콘텐츠 저장 = 서빙 원천 DB + CI가 md→DB 동기화(upsert 키 = md 파일명 스템)
--   §3 권한 매트릭스 = 열람 공개 / 상호작용(북마크·좋아요) = 로그인 멤버
-- 적용 순서: 0001 → 0002 → 0003
-- 멱등: 전 구문 if not exists / or replace. 재실행해도 데이터 변화 없음.
-- 파괴 연산: member_private.학번 컬럼 1개 제거뿐 — 값을 members로 **복사한 뒤** 제거한다(아래 3번).
--            truncate·drop table·delete 없음(0001 주석의 원칙 유지).

-- ─────────────────────────────────────────────
-- 1. members.학번 — 로그인 ID(§0-4·§0-5)
--    nullable = 오너·운영진 계정은 이메일 로그인 유지(학번 없음 허용).
--    unique = 학번 1개당 계정 1개(가상 이메일 s<학번>@member.erpclub와 1:1).
-- ─────────────────────────────────────────────
alter table members add column if not exists 학번 text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'members_학번_key') then
    alter table members add constraint members_학번_key unique (학번);
  end if;
end $$;

-- 숫자열만 허용(가상 이메일 매핑 규칙과 동형 — 앱 상수 = app/src/data/login-id.js)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'members_학번_숫자') then
    alter table members add constraint members_학번_숫자 check (학번 is null or 학번 ~ '^[0-9]{4,12}$');
  end if;
end $$;

-- ─────────────────────────────────────────────
-- 2. 기존 값 이관 — member_private.학번 → members.학번 (컬럼 제거 전 복사)
-- ─────────────────────────────────────────────
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'member_private' and column_name = '학번'
  ) then
    execute $mig$
      update members m
         set 학번 = p.학번
        from member_private p
       where p.member_id = m.id and p.학번 is not null and m.학번 is null
    $mig$;
  end if;
end $$;

-- ─────────────────────────────────────────────
-- 3. member_private에서 학번 제거 — 전공만 잔류(§0-5: 전공 = 운영진만 열람 유지)
--    2번 복사 이후에만 실행되므로 값 유실 없음.
-- ─────────────────────────────────────────────
alter table member_private drop column if exists 학번;

-- ─────────────────────────────────────────────
-- 4. members_public 뷰 갱신 — 학번 포함(워크스페이스 명단용)
--    P5 재해석(§0-5 개정): 학번은 더 이상 사적 필드가 아니라 로그인 ID·명단 식별자다.
--    사적 필드로 남는 것은 전공 하나 → member_private + RLS(본인 ∨ 운영진)가 계속 방어한다.
--    뷰 자체는 security_invoker = true 유지 → members RLS(멤버만 select)가 그대로 적용된다(익명 차단).
-- ─────────────────────────────────────────────
create or replace view members_public
with (security_invoker = true) as
  select id, 이름, role, 학번, 자기소개, 관심사, 가입일 from members;

grant select on members_public to authenticated;

-- ─────────────────────────────────────────────
-- 5. articles 동기화 키 = 기존 `슬러그` 컬럼(md 파일명 스템)
--    0001에서 이미 `슬러그 text not null unique`로 존재한다 → 동명의 영문 slug 컬럼을 추가하지 않는다
--    (컬럼 2개 = 원천 2개 → upsert 키 모호. spec의 "slug" = 이 컬럼을 가리킨다).
--    아래는 0001 이전 스키마에서 올라오는 경우를 위한 멱등 보강일 뿐이다.
-- ─────────────────────────────────────────────
alter table articles add column if not exists 슬러그 text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'articles_슬러그_key') then
    alter table articles add constraint articles_슬러그_key unique (슬러그);
  end if;
end $$;

-- 동기화 스크립트(scripts/sync-content-db.mjs)의 조회 경로 = 슬러그 단건 lookup + 게재 목록.
create index if not exists articles_슬러그_idx on articles (슬러그);

-- ─────────────────────────────────────────────
-- 6. 상호작용 카운트 뷰 — 익명도 "총계만" 읽는다(§3: 열람=공개, 상호작용=로그인 멤버)
--    article_likes·article_bookmarks의 RLS는 본인 행만 허용 → 총계를 낼 수 없다.
--    security_invoker를 켜지 않은 뷰 = 소유자 권한으로 집계 → 개별 member_id는 노출되지 않고 집계만 나간다.
--    게재 기사에 한정(초안·승인대기 기사의 존재 자체가 새지 않게).
-- ─────────────────────────────────────────────
create or replace view article_interaction_counts as
  select a.id as article_id,
         a.슬러그 as 슬러그,
         (select count(*) from article_likes    l where l.article_id = a.id)::int as 좋아요수,
         (select count(*) from article_bookmarks b where b.article_id = a.id)::int as 북마크수
    from articles a
   where a.상태 = '게재';

grant select on article_interaction_counts to anon, authenticated;
