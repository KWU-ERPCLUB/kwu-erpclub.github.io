-- 0016 — 공고 자동 등록 파이프라인용 동기화 키(2026-08-18 오너: "SQL 없이 주간 리서치로 자동 등록").
-- 구조 = 인사이트 md→DB 동형: supabase/postings.json(원천, 루틴이 갱신·push) → CI가 service key로 upsert.
-- upsert 충돌 키 = "키"(파이프라인 항목만 보유). 운영 탭 수기 등록 행은 키 null — unique 인덱스는 null 중복 허용이라 공존.
-- 적용 = 0015 이후 실행. 전 구문 멱등 — 재실행 안전.

alter table postings add column if not exists "키" text;
create unique index if not exists "postings_키_key" on postings ("키");

alter table events add column if not exists "키" text;
create unique index if not exists "events_키_key" on events ("키");
