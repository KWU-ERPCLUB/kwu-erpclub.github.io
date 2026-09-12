-- 0024 — articles.주제 not null 해제 (2026-09-12, 인사이트 개편 후속)
-- 배경: 0023으로 축·보관·후보출처 열을 추가했지만 0001의 `주제 article_topic not null`은 그대로였다.
--       개편(spec 2026-09-11 §2-1)에서 기사의 `주제`는 폐지 → 새 형식 글은 주제 값이 없어
--       CI sync-content(v0.18.0 첫 배포)가 23502(not-null 위반)로 upsert 전건 실패(배치 단위라 보관 플래그도 미반영).
-- 조치: not null만 해제(열·enum 타입·기존 값 전부 유지 — 레거시 표시·되돌리기용).
-- 가역: alter table articles alter column 주제 set not null;  (단, 주제 null 행이 있으면 실패 — 먼저 채워야 함)

begin;

alter table articles alter column 주제 drop not null;

commit;

-- 검증(실행 후 확인):
--   select is_nullable from information_schema.columns where table_name = 'articles' and column_name = '주제';  -- YES
