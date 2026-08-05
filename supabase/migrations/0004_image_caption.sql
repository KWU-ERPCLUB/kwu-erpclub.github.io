-- 0004_image_caption.sql — 기사 썸네일 체계 격상(오너 판정 2026-08-05)
-- 배경: 주제 스톡 자동 매핑 = 보여주기식. 기고마다 내용과 실제 관련된 이미지를 지정하고,
--       그 이미지가 무엇인지 기고 맨 위에 한 줄로 밝힌다.
-- 내용: articles.이미지설명 컬럼 1개 추가(상세 히어로 캡션 · 목록 카드 alt).
--       md 원천 = frontmatter `이미지설명`(선택 1줄) → toDbRow(app/src/content/db-map.js).
-- 적용 순서: 0001 → 0002 → 0003 → 0004
-- 멱등: if not exists 만 사용. 재실행해도 데이터 변화 없음.
-- 파괴 연산: 없음(drop·delete·truncate 0건).

alter table articles add column if not exists 이미지설명 text;

comment on column articles.이미지설명 is
  '썸네일·히어로 이미지가 무엇이고 기사와 어떤 관계인지 한 줄. 상세 상단 캡션 + 목록 카드 alt. 이미지가 없으면 null.';
