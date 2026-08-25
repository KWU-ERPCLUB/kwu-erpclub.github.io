-- 0022 — article_nature 3값 → 2값 (오너 2026-08-25, 같은 날 0021 철회)
-- 결정: **인사이트 = 정보성 전용**. 따라 하는 실습·도구 사용법은 기사가 아니라 세미나 특강으로 다룬다.
-- 경위 = 도감 트랙 폐기(roadmap §95): 자동 발행 루틴이 쓰는 한 카드가 공식 문서 요약을 넘지 못했다
--        — 오너 판정 "구글 서치하면 5초면 나오는 정보". 깊이는 실사용 기록·스크린샷을 요구하는데
--        그건 자동 공급과 양립하지 않는다.
-- 승계: '도구·활용' 행 → '심층 분석'.
--       실제 대상 1건 = 2026-07-30-bapzzi-ai-video-tools(파이프라인 구조 분석·사례 수치·흐름 읽기 =
--       해석이 절반 이상 → 심층 분석 판정. 구 '도구·프롬프트' 분류가 오히려 어색했다)
-- ⚠비가역 — 실행 전 백업 권장. 0021과 같은 방식(enum 값 삭제 불가 → 타입 재생성).

begin;

alter table articles alter column 성격 type text;

update articles set 성격 = '심층 분석' where 성격 = '도구·활용';

drop type article_nature;
create type article_nature as enum ('트렌드', '심층 분석');
alter table articles alter column 성격 type article_nature using 성격::article_nature;

commit;

-- 검증(실행 후 확인):
--   select distinct 성격 from articles;        -- {트렌드, 심층 분석} 2값
--   select enum_range(null::article_nature);   -- {트렌드,"심층 분석"}
