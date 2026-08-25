-- 0021 — article_nature 4값 → 3값 (오너 2026-08-25)
-- 근거 spec = erp-club/docs/specs/2026-08-25-도구도감-트랙.md D5
--   · '활용법·튜토리얼' 폐지 — 게재 0건. 절차형 내용은 도감 카드 「시작하는 법」 절이 흡수(D2)
--   · '도구·프롬프트' → '도구·활용' 개명 — 도감 트랙의 성격 칩
-- Postgres는 enum 값 삭제가 불가하다 → 컬럼을 text로 내렸다가 새 타입으로 다시 올린다.
-- 의존성 확인 완료(2026-08-25): article_nature 사용처 = articles.성격 1곳. 뷰·RLS 정책·인덱스 참조 0건.
-- ⚠비가역 — 되돌리려면 역방향 마이그레이션이 필요하다. 실행 전 백업 권장.

begin;

-- 1) enum 제약을 잠시 푼다(not null은 유지)
alter table articles alter column 성격 type text;

-- 2) 기존 데이터 승계 — 폐지·개명 2값을 '도구·활용'으로 흡수
update articles set 성격 = '도구·활용' where 성격 in ('도구·프롬프트', '활용법·튜토리얼');

-- 3) 타입 교체
drop type article_nature;
create type article_nature as enum ('트렌드', '심층 분석', '도구·활용');
alter table articles alter column 성격 type article_nature using 성격::article_nature;

commit;

-- 검증(실행 후 확인):
--   select distinct 성격 from articles;            -- 3값 이내
--   select enum_range(null::article_nature);       -- {트렌드,"심층 분석",도구·활용}
