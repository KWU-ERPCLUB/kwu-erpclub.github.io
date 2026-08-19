-- 0020 — 운영 일정에 'AIM' 종류 추가 + 잘못 분류된 AIM 일정 회수(2026-08-19 오너 캘린더 색 개편).
-- 배경: 홈 캘린더가 공고를 종류와 무관하게 한 색으로 칠해 분간이 안 됐다 → 색 분류를 6종으로 재정의.
--       색 분류 = AIM · 학사 · 공모전 · 채용 · 자격증 · 교내활동(구독 카테고리와 같은 축).
--       events는 '학사'만 학사색, 나머지 전 종류(일정·세미나·모집·마감)는 화면에서 AIM 색으로 묶인다.
--       그래서 이 마이그레이션 없이도 프론트는 정상 동작한다 — 'AIM'은 세부 구분이 필요 없을 때 쓸 값의 추가.
-- 적용 = Supabase SQL 에디터에서 0019 이후 1회 실행. 전 구문 멱등(drop if exists 후 재생성) — 재실행 안전.

-- ① 종류 값에 'AIM' 추가(기존 5종 유지 — 개명·삭제 없음).
alter table events drop constraint if exists "events_종류_check";
alter table events add constraint "events_종류_check"
  check ("종류" in ('일정', '세미나', '모집', '마감', '학사', 'AIM'));

-- ② 회수 대상 확인(먼저 실행해 눈으로 볼 것) — '학사'로 등록됐지만 실제로는 AIM 활동인 행.
--    학사일정 자동 등록 파이프라인이 넣은 행은 "키"가 있다 → 손으로 넣은 행("키" is null)만 후보다.
select id, "제목", "날짜", "종류"
from events
where "종류" = '학사'
  and "키" is null
  and ("제목" ilike '%AIM%' or "제목" ilike '%세미나%' or "제목" ilike '%차시%'
       or "제목" ilike '%모집%' or "제목" ilike '%기고%' or "제목" ilike '%OT%');

-- ③ 회수 실행 — ②의 결과가 전부 AIM 활동이 맞을 때만 실행한다(아니면 id를 짚어 개별 update).
update events set "종류" = 'AIM'
where "종류" = '학사'
  and "키" is null
  and ("제목" ilike '%AIM%' or "제목" ilike '%세미나%' or "제목" ilike '%차시%'
       or "제목" ilike '%모집%' or "제목" ilike '%기고%' or "제목" ilike '%OT%');
