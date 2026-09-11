-- 0023 — 인사이트 개편(오너 2026-09-11, spec = erp-club/docs/specs/2026-09-11-인사이트-개편.md)
-- 결정: 심층 선정에 사람 판단을 두지 않는다 — 주간 보고가 유일 입구, 후보 표 T/F 5항 통과분만 심층(주 ≤3).
--       분류 = 주제 6값 → **축 3값**(AI활용·AI×취업·AI×MIS). 기준 밖 기존 글 = **보관**(목록 제외·URL 유지).
-- 추가 열 3개(전부 nullable/기본값 — md 동기화(sync-content-db)가 채운다). 기존 `주제` 열은 남긴다(레거시 표시·되돌리기).
-- 미적용 상태 = 화면은 md 글롭 폴백으로 동작하지만 CI sync-content가 upsert 시 열 없음 오류 → 다음 main push 전 실행.
-- 가역: alter table articles drop column 축, 보관, 후보출처;

begin;

alter table articles add column if not exists 축 text;                          -- 'AI활용' | 'AI×취업' | 'AI×MIS' (enum 원천 = app/src/content/schema.js AXES)
alter table articles add column if not exists 보관 boolean not null default false; -- true = 공개 목록·홈·RSS·건수 제외
alter table articles add column if not exists 후보출처 text;                     -- 'weekly-trend-wNN#k' | '요청' (심층 전용)

create index if not exists articles_public_idx on articles (게재일 desc) where 보관 = false;

commit;

-- 검증(실행 후 확인):
--   select column_name from information_schema.columns where table_name = 'articles' and column_name in ('축','보관','후보출처');  -- 3행
--   select 축, count(*) from articles group by 축;   -- md 동기화 뒤 AI활용/AI×취업/AI×MIS/null
