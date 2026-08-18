-- 0015 — 공고 종류 '자격시험' → '자격증' 개명(2026-08-18 오너). 코드(POSTING_KINDS·레지스트리)와 동시 개정.
-- 기존 행·구독 행까지 함께 옮긴다(개명은 원래 금지 원칙이나 초기라 데이터가 적어 1회 정리 — 이후 개명 금지 유지).
-- 적용 = Supabase SQL 에디터에서 1회 실행(0014 이후). 0014 미적용 상태면 posting_subscriptions 구문만 실패하니 0014 먼저.

alter table postings drop constraint "postings_종류_check";
update postings set "종류" = '자격증' where "종류" = '자격시험';
alter table postings add constraint "postings_종류_check"
  check ("종류" in ('공모전', '채용', '자격증', '대외활동'));

update posting_subscriptions set "종류" = '자격증' where "종류" = '자격시험';
