-- 0005_series.sql — 인사이트 「시리즈」 체계(오너 확정 2026-08-05)
-- 배경: 주간 트렌드가 성격 '트렌드'에 계속 쌓여 목록이 회차로 뒤덮인다.
--       시리즈로 묶어 목록 상단 고정 밴드 + 전용 아카이브(?series=<id>)로만 노출하고 메인 그리드에서는 뺀다.
-- 내용: articles.시리즈 컬럼 1개 추가(값 = 레지스트리 id, 예 'weekly'. 소속 없으면 null).
--       레지스트리 원천 = app/src/content/series.js (표시명·설명·주기·고정 커버·슬러그 인식키).
--       md 원천 = frontmatter `시리즈`(선택) 또는 슬러그 자동 인식(`weekly-trend`) → toDbRow(app/src/content/db-map.js).
-- 적용 순서: 0001 → 0002 → 0003 → 0004 → 0005
-- 멱등: if not exists / create or replace 만 사용. 재실행해도 데이터 변화 없음.
-- 파괴 연산: 없음(drop·delete·truncate 0건). enum 제약을 DB에 걸지 않는다 — 레지스트리 추가 때 마이그레이션이 또 필요해지는 것을 피한다.

alter table articles add column if not exists 시리즈 text;

comment on column articles.시리즈 is
  '정기 연재 시리즈 id(app/src/content/series.js 레지스트리 값, 예 weekly). 소속 없으면 null. 목록 밴드·시리즈 아카이브의 귀속 키.';

-- 목록·아카이브가 시리즈로 걸러 읽는다(소속 글만 인덱싱 — 대부분의 행은 null).
create index if not exists articles_시리즈_idx on articles (시리즈) where 시리즈 is not null;
