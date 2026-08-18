-- 0017_application_reason.sql — 신청 폼 마지막 칸 = 지원 계기(오너 2026-08-18, 최대 500자)
-- 적용 전이어도 폼은 무중단: 앱이 컬럼 오류를 잡아 관심주제에 '지원계기: …'로 합성 후 재시도
-- (app/src/pages/apply-source.js submitApplication 폴백). 적용 후 = 전용 컬럼에 저장.
-- 파괴 연산: 없음. 재실행 안전(add column if not exists + 제약은 drop 후 add).

alter table applications add column if not exists 지원계기 text not null default '';

alter table applications drop constraint if exists applications_지원계기_len;
alter table applications add constraint applications_지원계기_len
  check (char_length(지원계기) <= 500);
