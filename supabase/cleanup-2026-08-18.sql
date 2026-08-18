-- 정리(2026-08-18) — 시드 SQL(키 null)과 JSON 파이프라인(키 보유)이 같은 공고·일정을 두 번 넣은 중복 제거.
-- 예: "제51회 ADsP" 2건. 기준 = 키 없는 행 중 같은 제목의 키 있는 행이 존재하는 것만 삭제(수기 등록 행은 안 건드림).
-- 적용 = Supabase SQL 에디터에서 1회 실행. 재실행 안전(지울 게 없으면 0행).

delete from postings p
where p."키" is null
  and exists (select 1 from postings q where q."키" is not null and q."제목" = p."제목");

delete from events e
where e."키" is null
  and exists (select 1 from events q where q."키" is not null and q."제목" = e."제목" and q."날짜" = e."날짜");

-- 구 '일정' 종류로 직접 등록해 둔 학사일정이 남아 보이면(제목이 시드와 다른 경우) 아래를 제목 맞춰 수동 실행:
-- delete from events where "키" is null and "제목" in ('<옛 학사일정 제목>');
