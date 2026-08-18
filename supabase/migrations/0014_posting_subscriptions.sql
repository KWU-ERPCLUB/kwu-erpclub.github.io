-- 0014 — 공고 구독·개인화(spec 2026-08-18): ①postings 세부 분류 ②events '학사' 종류 ③멤버별 카테고리 구독.
-- 목적 = 홈 캘린더 오염 차단: 공고 일정은 구독한 카테고리만 합류(기본 = 학사+AIM, 공고류는 opt-in).
-- 세부 분류 값의 원천 = 앱 코드 레지스트리(src/workspace/postings-taxonomy.js) — DB는 text(신규 값 = 코드 1곳 수정).
-- 적용 = Supabase SQL 에디터에서 실행. 전 구문 멱등(if exists/if not exists) — 부분 적용 후 재실행해도 안전(2026-08-18 실행 충돌 수리).

-- ① 공고 세부 분류(자격증=자격증명·채용=규모유형·공모전=주최유형). '' = 미분류.
alter table postings add column if not exists "분류" text not null default '';

-- ② 운영 일정에 '학사' 추가 — 학사일정을 events에 담는다(AIM 일정 = 기존 4종으로 파생, 저장 안 함).
alter table events drop constraint if exists "events_종류_check";
alter table events add constraint "events_종류_check"
  check ("종류" in ('일정', '세미나', '모집', '마감', '학사'));

-- ③ 멤버별 캘린더 구독(개인×카테고리 — posting_interests와 동형 위생).
-- 종류 = 공모전·채용·자격증·대외활동·학사·AIM / 분류 '' = 해당 종류 전체 구독, 값 = 그 세부 분류만.
-- 구독 행 0건 멤버 = {학사, AIM} 기본 해석(클라이언트가 첫 토글 때 기본 2행을 실체화).
create table if not exists posting_subscriptions (
  member_id uuid not null references members(id) on delete cascade,
  "종류" text not null,
  "분류" text not null default '',
  created_at timestamptz not null default now(),
  primary key (member_id, "종류", "분류")
);

alter table posting_subscriptions enable row level security;

drop policy if exists posting_subscriptions_select_self on posting_subscriptions;
create policy posting_subscriptions_select_self on posting_subscriptions
  for select to authenticated using (member_id = auth.uid());
drop policy if exists posting_subscriptions_insert_self on posting_subscriptions;
create policy posting_subscriptions_insert_self on posting_subscriptions
  for insert to authenticated with check (member_id = auth.uid() and is_member());
drop policy if exists posting_subscriptions_delete_self on posting_subscriptions;
create policy posting_subscriptions_delete_self on posting_subscriptions
  for delete to authenticated using (member_id = auth.uid());
