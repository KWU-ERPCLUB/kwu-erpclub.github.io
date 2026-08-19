-- 0019 — 공고 종류 '대외활동' → '교내활동' 개명(2026-08-19 오너). 코드(POSTING_KINDS·레지스트리)와 동시 개정.
-- 배경: AIM 자체가 대외활동이라 외부 서포터즈·기자단·봉사단을 또 모을 이유가 없다(오너).
--       대신 이 자리를 **광운대 교내 정보 전용**으로 돌린다 — 비교과·특강·튜터·장학.
-- 0015(자격시험→자격증)와 동형. 기존 행·구독 행까지 함께 옮긴다.
-- 적용 = 0018 이후 실행. 전 구문 멱등 — 재실행 안전.

alter table postings drop constraint if exists "postings_종류_check";
update postings set "종류" = '교내활동' where "종류" = '대외활동';
alter table postings add constraint "postings_종류_check"
  check ("종류" in ('공모전', '채용', '자격증', '교내활동'));

update posting_subscriptions set "종류" = '교내활동' where "종류" = '대외활동';

-- 세부 분류도 함께 정리 — 구 '교내프로그램'은 종류명이 교내활동이 되면서 겹치는 말이 됐다.
update postings set "분류" = '비교과' where "종류" = '교내활동' and "분류" = '교내프로그램';
update posting_subscriptions set "분류" = '비교과' where "종류" = '교내활동' and "분류" = '교내프로그램';

-- 외부 대외활동 행 정리(오너 2026-08-19 "대외활동 그냥 삭제") — 광운대 주최가 아닌 것만 내린다.
-- 자동 동기화(sync-postings-db.mjs)는 upsert만 하므로 원천 JSON에서 빼도 DB 행은 남는다 → 여기서 1회 삭제.
delete from postings where "키" in ('moe-bootcamp-2026', 'seoul-bigdata-camp-2026');
