-- 0010 — 운영 일정 중요(★) 플래그(2026-08-07 오너): "다가오는 업무"는 지정 항목만 노출.
-- 배경: 학사일정 등 정보가 쌓이면 다가오는 업무가 소음이 됨 — 캘린더는 전부, 리스트는 ★만.
-- 공고(postings)는 별도 컬럼 없이 기존 "고정"이 ★ 역할 겸용(보드 상단 + 다가오는 업무).
-- 적용 = Supabase SQL 에디터에서 1회 실행.

alter table events add column "중요" boolean not null default false;
