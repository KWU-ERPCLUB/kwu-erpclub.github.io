-- 0001_schema.sql — 워크스페이스·백엔드 M1 스키마
-- 원천: erp-club/docs/specs/2026-08-05-워크스페이스-백엔드.md §2(데이터 모델)
-- 적용 순서: 0001_schema.sql → 0002_rls.sql (반드시 이 순서)
-- 주의: 이 파일은 생성(create)만 한다. drop/truncate/delete 금지(데이터 유실 방지 — adsp-board db:seed 사고 전례).

-- ─────────────────────────────────────────────
-- enum (§2 role·상태 / 기존 schema.js 값 이관 — §4-2 "DB 스키마+제약이 계약을 계승")
-- ─────────────────────────────────────────────
create type member_role   as enum ('운영진', '스터디원');
create type article_status as enum ('초안', '승인대기', '게재');
-- src/content/schema.js NATURES 이관
create type article_nature as enum ('트렌드', '심층 분석', '활용법·튜토리얼', '도구·프롬프트');
-- src/content/schema.js TOPICS 이관
create type article_topic  as enum ('에이전트', '모델·플랫폼', '워크플로·자동화', '거버넌스·리스크', '시장·생태계', '크리에이티브·미디어');
-- src/content/schema.js SEMINAR_TYPES 이관
create type seminar_type   as enum ('인지', '실습');

-- ─────────────────────────────────────────────
-- members — auth.users 1:1. 자가입 차단(§0-4): insert는 운영진만(0002_rls)
-- P5: 학번·전공은 이 테이블에 두지 않는다 → member_private 분리(아래)
-- ─────────────────────────────────────────────
create table members (
  id          uuid primary key references auth.users (id) on delete cascade,
  이름        text        not null check (length(btrim(이름)) > 0),
  role        member_role not null default '스터디원',
  자기소개    text,
  관심사      text[]      not null default '{}',
  가입일      date        not null default current_date,
  created_at  timestamptz not null default now()
);

-- member_private — 학번·전공(§0-5: 운영진만 열람). 분리 이유 = 컬럼 단위 RLS가 없으므로
-- 테이블을 갈라 행 단위 정책으로 P5를 만족시킨다(본인 ∨ 운영진만 select).
create table member_private (
  member_id uuid primary key references members (id) on delete cascade,
  학번      text,
  전공      text
);

-- members_public — 스터디원 조회용 표면(이름·소개·관심사만). 학번·전공 컬럼이 없음 = P5 구조적 보장.
create view members_public
with (security_invoker = true) as
  select id, 이름, role, 자기소개, 관심사, 가입일 from members;

-- ─────────────────────────────────────────────
-- 세션·자료·과제·제출 (§2 / §3 "세션 자료·과제·공지 내부")
-- ─────────────────────────────────────────────
create table sessions (
  id     uuid primary key default gen_random_uuid(),
  회차   integer not null unique check (회차 > 0),
  날짜   date    not null,
  제목   text    not null check (length(btrim(제목)) > 0),
  설명   text,
  created_at timestamptz not null default now()
);

create table session_materials (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions (id) on delete cascade,
  제목       text not null check (length(btrim(제목)) > 0),
  url        text,
  파일경로   text,  -- Supabase Storage 경로(url과 택일)
  created_at timestamptz not null default now(),
  -- 링크 ∨ 파일 중 최소 하나(§2 "파일(Storage)∨링크")
  constraint session_materials_source_present check (url is not null or 파일경로 is not null)
);

create table assignments (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid references sessions (id) on delete set null,
  제목       text not null check (length(btrim(제목)) > 0),
  설명       text,
  마감       timestamptz,
  created_at timestamptz not null default now()
);

-- 제출 = 링크(URL) 방식(§0-7). 과제×멤버 1건.
create table submissions (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments (id) on delete cascade,
  member_id     uuid not null references members (id) on delete cascade,
  url           text not null check (url ~ '^https?://'),
  메모          text,
  제출일시      timestamptz not null default now(),
  unique (assignment_id, member_id)
);

-- ─────────────────────────────────────────────
-- articles — 기존 frontmatter 계약 승계(§2). 상태 하나로 초안→승인대기→게재(§0-8).
-- ─────────────────────────────────────────────
create table articles (
  id          uuid primary key default gen_random_uuid(),
  슬러그      text not null unique,
  제목        text not null check (length(btrim(제목)) > 0),
  설명        text not null check (length(btrim(설명)) > 0),  -- 카드 표시용 1줄(필수 — schema.js 계승)
  본문        text not null default '',
  성격        article_nature not null,
  주제        article_topic  not null,
  상태        article_status not null default '초안',
  작성자      uuid references members (id) on delete set null,
  작성자표기  text,             -- 루틴 발행분 등 멤버 계정이 없는 경우의 표기명
  게재일      date,
  시각        text check (시각 is null or 시각 ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  source_url  text not null,
  source_name text not null,
  태그        text[] not null default '{}' check (array_length(태그, 1) is null or array_length(태그, 1) <= 5),
  지금써먹기  boolean not null default false,
  고정        boolean not null default false,
  이미지      text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- 게재 상태면 게재일 필수(게재일 정직 원칙 §4-1 — 빈 값으로 게재 금지)
  constraint articles_published_needs_date check (상태 <> '게재' or 게재일 is not null)
);
create index articles_상태_게재일_idx on articles (상태, 게재일 desc);

create table article_bookmarks (
  member_id  uuid not null references members (id) on delete cascade,
  article_id uuid not null references articles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (member_id, article_id)
);

create table article_likes (
  member_id  uuid not null references members (id) on delete cascade,
  article_id uuid not null references articles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (member_id, article_id)
);

-- 개인 컬렉션 — 본인 전용(§3, [미정-3] 기본값 = 운영진도 열람 불가)
create table collections (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid not null references members (id) on delete cascade,
  url        text not null check (url ~ '^https?://'),
  메모       text,
  created_at timestamptz not null default now()
);
create index collections_member_idx on collections (member_id, created_at desc);

-- ─────────────────────────────────────────────
-- 공지·운영 로그 — 내부여부=false면 공개면 노출(§2 [미정-2]는 M2 이후 판단, 지금은 플래그만)
-- ─────────────────────────────────────────────
create table notices (
  id         uuid primary key default gen_random_uuid(),
  제목       text not null check (length(btrim(제목)) > 0),
  본문       text not null default '',
  내부여부   boolean not null default true,
  작성자     uuid references members (id) on delete set null,
  created_at timestamptz not null default now()
);

create table ops_log (
  id         uuid primary key default gen_random_uuid(),
  날짜       date not null default current_date,
  제목       text not null check (length(btrim(제목)) > 0),
  본문       text not null default '',
  내부여부   boolean not null default true,
  created_at timestamptz not null default now()
);

-- 세미나 — 내부 진행판 → 공개 아카이브 전환 = 공개여부 플래그(§2)
create table seminars (
  id         uuid primary key default gen_random_uuid(),
  회차       integer not null unique check (회차 > 0),
  날짜       date,
  일정미정   boolean not null default false,
  제목       text not null check (length(btrim(제목)) > 0),
  발제       text,
  유형       seminar_type not null default '인지',
  주제       article_topic,
  본문       text not null default '',
  슬라이드   text,
  장소       text,
  공개여부   boolean not null default false,
  created_at timestamptz not null default now()
);

-- updated_at 자동 갱신(articles만 — 기고 흐름에서 수정 시각이 필요)
create function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger articles_set_updated_at
  before update on articles
  for each row execute function set_updated_at();
