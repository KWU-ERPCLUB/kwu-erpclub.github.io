# CLAUDE.md — kwu-erpclub site app

One-line: AIM(광운대 ERP연구회 산하 MIS·AI 스터디) 허브 — 주=스터디원 작업면(인사이트→세미나 파이프라인), 부=외부 증빙면.
브랜드 표기 = **AIM 단독 + 산하 한 줄**(2026-08-05 오너) — 계보(ROADMAP ORIGIN·FAQ 관계 문항)는 유지.
표면명 주의: 페이지 = **AI 인사이트 / INSIGHTS / `/insights/`** — 계약 내부 종류명은 `기사`(content/기사/·schema) 유지.
Deploy: GitHub Pages, org repo `KWU-ERPCLUB/kwu-erpclub.github.io`. **Branches (2026-08-19 beta)**: `main` = release build (push → auto deploy) / `dev` = work branch (push → validate+test+build only, no deploy). Code lands on `dev`; `main` direct = content · typo/fact fix · outage fix only. Version source = `package.json` (injected as `__APP_VERSION__`, shown in footer). Release procedure = `erp-club/docs/specs/2026-08-19-릴리스-체계.md`.
Static bundle + client-side fetch to Supabase (workspace only — 공개 6페이지는 여전히 정적).

## Commands
- dev: `npm run dev` (port 5173) / build: `npm run build` (vite build + `scripts/build-rss.mjs` → dist/rss.xml) / preview: `npm run preview`
- test: `npm test` (vitest run) / lint: `npm run lint` (oxlint src scripts)
- validate: `npm run validate` (content contract check — node scripts/validate-content.mjs)

## Stack & gotchas
- Vite 5 + React 18 (NOT 19 — older than other apps, don't bump casually), plain CSS (no Tailwind)
- MPA: static entries in vite.config rollupOptions.input = main(하이브리드: v3 소개+**모집 밴드**) +
  insights/seminars + **recruit**(AIM 기수 안내 + **운영 증빙** — 구 about Proof 이관) + projects + workspace.
  new page = new dir + `src/*-entry.jsx` + input entry. 나브 = INSIGHTS·SEMINARS·PROJECTS·RECRUIT(+로그인 시 WORKSPACE).
  (insights 페이지 컴포넌트 파일명 = `pages/Articles.jsx`·`styles/articles.css` 유지 — 내부명, URL만 insights)
- **모집 카피 규칙(SPEC §4 개정 2026-07-27)**: 사실 서술 허용(요강·기간·참여 방법 — 개조식) / 마케팅 어투 금지
  grep {지금 바로, 놓치지, 마지막 기회, 서두르, 얼른} = 0. 모집 밴드 국면 전환 = `home-logic.js recruitPhase`(창 = RECRUIT_WINDOW 유일 원천).
  [미정] 값(요일·회차 세부주제·주제 풀) 게재 금지 — 원천 = workspace `erp-club/docs/specs/2026-07-27-aim-운영틀.md`.
- **labs·reports·join 페이지 제거**(IA 2차 2026-07-23). **about·log 제거**(IA 4차 2026-08-05 — about 증빙→recruit 하단,
  log 데이터 `src/data/log.js`→워크스페이스 공지 탭 '운영 기록'(OpsLog) 읽기 전용 내부화). 재도입 = 오너 재승인.
- 멤버 페이지(목록+개인 auto-glob)는 **전부 제거**(SPEC 2026-07-23 오너 결정). 재도입 = 오너 재승인.
- base '/' (org root site). Fonts via CDN link tags in each entry html (Pretendard + Paperlogy).
- No router, no state lib. Shared nav/footer = `src/shared.jsx`. 메인 = `src/App.jsx`(과거 v3 소개형)/`styles/home.css`. (구 현황판 `pages/Home.jsx`·`styles/hub.css`는 2026-07-23 제거.)
- 신청 폼 = /recruit 온사이트 폼(2026-08-05 오너 해제·Supabase `applications`) — 어댑터 = `pages/apply-source.js`,
  RLS = 익명 insert만·열람 = 운영진(migration 0006). env 미설정 = 폼 대신 제출 불가 안내(목 폴백 성공 연출 금지).

## Content contract & CI (SPEC §5·§6)
- 기고 = `content/<종류>/YYYY-MM-DD-<작성자id>-<슬러그>.md` (종류=**기사·세미나** — 실습 폐지). frontmatter 규칙의
  **유일 원천 = `src/content/schema.js`**(검증기 CLI·앱 로더 공용). 기사=source_url·source_name·성격·주제·`설명`(필수 — 카드는 본문 발췌 대신 설명만 표시, 2026-07-27)+`태그`(선택 0~5·표시 전용 #해시태그·필터 없음), 세미나=회차·유형(+선택 발원기사)·**유형=실습이면 본문 필수 헤딩 {## 준비, ## 진행, ## 재현 가이드}**.
- 로더 = `src/content/loader.js`(글롭 로드). 앱·CLI가 같은 스키마를 소비.
- **시리즈(2026-08-05)** = 정기 연재 묶음. 레지스트리 단일원천 = `src/content/series.js`(id·표시명·설명·주기·고정 커버·슬러그키).
  frontmatter `시리즈`(선택) 또는 **슬러그 자동 인식**(`weekly-trend` → `weekly`)으로 귀속 — 정규화 지점 = loader.js·`fromDbRow` 2곳.
  화면 = **필터 칩 1개**(오너 재판정 2026-08-05 — 밴드·전용 아카이브 폐지). 칩 소재 = `insights-logic.js seriesOptions`,
  조건 = `filterArticles({ series })`(다른 필터와 AND), URL = `?series=<id>`. 시리즈 글도 피처·그리드·카운트에 일반 기사와 동일 포함.
  썸네일·히어로 = 고정 커버가 개별 `이미지`보다 우선(thumb-resolver ⓪). DB 컬럼 = `articles.시리즈`(migration 0005 — 미적용이어도 슬러그 인식으로 동작).
- **md→DB 동기화(M2)** = `scripts/sync-content-db.mjs`: `content/기사/*.md` → `articles` upsert(키=`슬러그`=파일명 스템, **삭제 없음**).
  매핑 단일원천 = `src/content/db-map.js`(toDbRow/fromDbRow). 파일 읽기 공용 = `scripts/content-files.mjs`(validate와 공유).
  로컬 확인 = `node scripts/sync-content-db.mjs --dry`(네트워크 0). 실행 env = `SUPABASE_URL`·`SUPABASE_SERVICE_KEY`(**repo 금지·secret만**).
  CI 잡 = deploy.yml `sync-content`(main push·build 이후·deploy 비차단).
- CI = `.github/workflows/deploy.yml`: **validate + test + build 게이트** 통과해야 배포(PR·dev push에서도 build 실행, deploy는 `main` push만 — `github.ref` 조건). `guard-shared-paths` 잡 = 비오너(bapzzi 외) 변경은 `app/content`만 허용.
- **권한 구조(2026-07-25 하드 격리)**: GitHub 룰셋(id 19734261) — main 직접 push = repo 관리자만(오너·오너 자격 Claude). 멤버 = 브랜치→PR 필수. `app/content`만 고친 PR = 체크(build) 통과 시 셀프 머지(승인 0) / 공용 영역 터치 = CODEOWNERS(오너) 승인 필수. 룰셋 관리 = repo Settings > Rules.
- **주간 트렌드 자동화**: 클라우드 루틴 `trig_0118sfWk88m1uYZMfcYUTik4`(매주 월 09:00 KST, sonnet-5, 멱등 스킵 규칙 내장) — 관리 = claude.ai/code/routines. 수동 실행 = 로컬 스킬 `weekly-trend`.

## Workspace & data layer (SPEC 2026-08-05 워크스페이스-백엔드, M1·M2·M3 완료)
- `/workspace/` = 로그인 영역. entry = `workspace/index.html` + `src/workspace-entry.jsx` + `src/workspace/`, CSS = `styles/workspace.css`
  (공개 6페이지 코드·CSS와 공유 금지).
- **앱형 셸(2026-08-06 재구성)**: 로그인 후 = 문서형(히어로 헤드·ws-panel·푸터) 제거 → 전폭 앱 레이아웃(`.ws-main.ws-app`,
  max 1760px). 사이드바 232px sticky + 하단 계정 블록(`.ws-side-me`), 홈 외 탭 = 소형 헤더(`.ws-content-head`).
  로그인 전 화면만 문서형(PageHead+패널) 유지. 근거 리서치(Notion·Slack·Classroom·Canvas 문법) = roadmap 2026-08-06 항.
- **탭(2026-08-14 재편) = 좌측 사이드바 6종: 홈·로드맵(구 스터디 흐름)·공고·인사이트 기고·내정보 + 운영(운영진만)**.
  북마크 = 단독 탭 폐지 → 내정보 안 섹션(정사각 카드 그리드 = 인사이트 축소판, `Collections.jsx`를 MyPage가 렌더).
  탭 설명 문구 폐지 — 아이콘(`TAB_ICONS`)이 대신. 원천 = `Workspace.jsx`의 `WS_TABS`·`visibleTabs()`. 구 탭명 딥링크 = `LEGACY_TAB_MAP`.
  **내정보 구성(2026-08-14)**: 상단 = 내 북마크·**관심 공고**(공고 카드 ★ 체크 — `posting_interests`, migration **0013**·미적용 = 빈 목록 강등) /
  하단 = 접힘 설정(`.ws-settings` details — 프로필 수정·비밀번호 변경) / 레일 = 활동내역. 내정보 전용 CSS = `workspace-mypage.css`(분할).
- **AIM 커리큘럼 로드맵 단일원천(2026-08-14) = `src/data/aim-roadmap.js`** — 워크스페이스 로드맵 탭(`workspace/Roadmap.jsx`)과
  공개 /recruit 로드맵(`data/recruit.js` AIM_ROADMAP 파생)이 이 파일 하나를 소비. **로드맵 개정 = 이 파일 1곳 수정**(표면별 하드코딩 금지).
  구간 표기 = '시험기간'(구 '시험 휴지' 폐기, 오너 2026-08-14). 로드맵 탭 CSS = `workspace-roadmap.css`(분할).
  홈(`Home.jsx`) = 요약 헤더(이름+7일 내 일정·마감 — Classroom '할 일' 문법) + **대형 월 캘린더 + 다가오는 업무**(계산 = `calendar-logic.js` 순수 함수) + 과제 제출·공지·세션 흡수(구 탭명 딥링크는 매핑).
  캘린더 원천 = 운영 일정(`events`, **0007 적용됨**) + 과제 마감 자동 + 세션 날짜 자동 + 공고 마감·시험일(0009). 주간 기고 반복 핀 = `WEEKLY_CONTRIB.dueDay`(현재 null=[미정] — 오너 확정 시 값 1개).
  **다가오는 업무 = ★ 지정만**(오너 2026-08-07 — 전량 노출은 소음): `events.중요`(**0010**)·`postings.고정` 겸용, `upcoming()`이 필터. 캘린더는 전 항목 유지.
  흐름(`Flow.jsx`) = 주차별 스터디 흐름(지난·이번 주·예정 — `weekStatus` 순수), 원천 = `flow_weeks`(**0008**), 운영진 인라인 CRUD.
  공고(`Postings.jsx`, 2026-08-07) = 공모전·채용·자격시험·대외활동 스크랩 보드(개인 스크랩과 별개 — 운영진 등록·전원 열람).
  원천 = `postings`(**0009**), 등록·삭제 = 운영 탭 > 공고(`AdminPostings.jsx`), **코멘트("왜 유효한가" 한 줄) 필수**(DB check+폼).
  상태(접수중·접수전·상시·마감) = 저장 안 함 — `postings-logic.js` 파생(마감 = 접힘·흐림). 접수마감·시험일 = 홈 캘린더 합류(`postingAgendaItems`).
  기고(`Contribute.jsx`) = **투트랙**: 기본(키트+폼, `형식='md'`) / 자유(단일 HTML 붙여넣기, `형식='html'`(0008) — 공개 상세가 `sandbox=""` iframe(srcdoc)으로 렌더, 스크립트 차단. 분기 = `ArticleDetail.jsx`).
  북마크(`Collections.jsx`) = **북마크한 인사이트 모음만**(링크 스크랩 UI 폐지 2026-08-07 — collections 데이터 계층은 유지) / 내정보(`MyPage.jsx`) = 프로필 수정 + 활동내역 + 비밀번호 변경.
  홈 캘린더 칩·선택일 목록 클릭 = **세부 팝업**(`ItemPopup` — 둥근 카드, 공고면 원문 링크. 2026-08-07).
  운영(`Admin.jsx`) = 승인대기(`Review.jsx`)·**제출 현황(`AdminSubmissions.jsx` — 멤버×과제 배지 매트릭스, `submissions.listAll`)**·지원자·멤버(`AdminMembers.jsx`)·콘텐츠(`AdminContent.jsx`+`AdminForm.jsx`)·**일정(`AdminEvents.jsx` — events CRUD)**·**공고(`AdminPostings.jsx` — postings CRUD)**. 삭제 화이트리스트(DELETABLE) = +events·flow_weeks·postings.
- **운영 영역 이중 차단**: ①RLS(`*_write_staff`) ②화면 — 비운영진 탭 미노출 + 직접 진입(`?tab=운영`)은 `Denied` 안내.
  초대(계정 생성)는 앱에서 불가(service key 필요) → 화면엔 절차 안내만(`supabase/README.md` 3·3-1단계).
- **공개 헤더의 워크스페이스 링크 = 상시 노출**(오너 개정 2026-08-07 — 구 세션 게이트·`data/session-flag.js` 폐지:
  링크가 없으면 로그인 화면 입구가 없다). 세션 키 상수 원천 = `data/session-key.js`(소비 = supabase.js만).
- 세션 자료·과제 제출 = **링크 기반**. 파일 업로드(Storage 버킷) = M4.
- **로그인 ID = 학번**(§0-4 개정). 매핑 = `src/data/login-id.js`(학번 → `s<학번>@member.erpclub`, `@` 포함 = 이메일 폴백).
- **인사이트 카드 배지 3종(2026-08-07)**: 작성자(이름 3글자·검은 타원, 원천 = author/작성자표기) · 미열람 **N**(빨간 원 —
  게재 7일 이내 ∧ 기기 미열람, 원천 = `pages/seen-store.js` localStorage) · 좋아요·북마크 수(우하단, 0/0 = 생략).
- **공개 인사이트 = DB 서빙**(M2): 데이터 출처 = `src/pages/insights-source.js`(`useArticles`·`useInteractions`).
  env 미설정이면 md 글롭 폴백. 공개면에서 `data/index.js`를 import 해도 되는 파일은 이 어댑터 1곳뿐(boundary 테스트가 고정).
- **Supabase 접근 = `src/data/` 경유만**(P1). 컴포넌트가 `data/supabase.js`·`repositories.js`를 직접 import 하면
  `src/data/boundary.test.js`가 FAIL — 우회 금지. 화면은 `data/index.js`의 `getRepositories()`만 쓴다.
  공개면이 쓸 수 있는 data 모듈 = 화이트리스트 2쌍(`insights-source.js→index`, `apply-source.js→index`) + 정적 상수(recruit·faq).
- 행 삭제는 `db.remove` + `DELETABLE` 화이트리스트(article_likes·article_bookmarks·collections·events·flow_weeks·postings)에서만. 콘텐츠·멤버 테이블은 삭제 경로 없음.
- env 2종(`VITE_SUPABASE_URL`·`VITE_SUPABASE_ANON_KEY`) 미설정 = 정상 상태 → 목 저장소 폴백 + 대기 화면.
  키 이름 문서 = `.env.example`, 프로비저닝 = `../supabase/README.md`, 스키마·RLS = `../supabase/migrations/`.
- 저장소 계약 변경 시 `REPO_CONTRACT`(repositories.js)와 `mock.js`를 함께 고친다(계약 테스트가 불일치를 잡음).
- service 키 = 이 repo 금지(P2). 외부 패키지 추가 없음 — PostgREST·GoTrue를 fetch로 호출.

## Design (numeric source of truth)
- Rules: `../../docs/디자인규칙-메인.md` **v2 + 2026-08-06 4차 개편**(좌 라벨 레일 폐지→중앙 정렬·가로줄→면 교대·검정 pill) —
  실측 고정 수치(버건디 화이트리스트·빈도 상한·버튼 3단 위계·인터랙션 4상태·§2 타이포 실값 표). UI 작업 전 필독. 위반=재작업.
- **PageHead 강제(3차, 4차 개정)**: 페이지 헤드 = `src/shared.jsx` `PageHead` 1개(**중앙 정렬** — 눈썹 + h1 + 서브 + children,
  갱신 메타 = 인사이트만). 페이지별 head CSS 신설 금지. (구 좌 라벨 레일·`--rail-w` 토큰 = 4차 폐지·제거됨.)
- CSS 18개(`src/styles/`): global(토큰·nav·PageHead·푸터·버튼) · home · home-sections ·
  pages(공용 셸) · hub-md(도판 브레이크아웃) · articles · insights-detail · seminars · projects ·
  project-adsp + project-adsp-viz(ADsP 인터랙티브 상세) · recruit · workspace ·
  workspace-home(사이드바·앱 셸 — 2026-08-06 분할) + workspace-calendar(홈 캘린더·팝업·범례 — 2026-08-14 분할) ·
  workspace-postings(공고 보드 — 2026-08-07 분할) ·
  workspace-mypage + workspace-roadmap(내정보·로드맵 탭 — 2026-08-14 분할).
  (`doc.css` = 2026-07-25 폐지 — 내부형 doc 셸·DocSide와 함께 제거됨.)
- 3차 신설 토큰(현행): `--tint-accent` · `--accent-on-dark` · `--focus-on-dark` · `--btn-hover`.
- Copy tone: AI-ish phrasing forbidden (규칙 §0-1). 3 viewports 375/768/1440, light-only(`color-scheme: light`).

## Docs map
- Project docs live OUTSIDE this repo (workspace `erp-club/docs/` — Tier2): 디자인규칙-메인.md(v2 디자인 규격) ·
  정체성-북극성.md(카피 상위 기준) — 구 기록·근거 문서(`erp-club/docs/_archive/`)는 2026-08-12 삭제, 침전처 지도 = `erp-club/roadmap.md` §59
- In-repo: `../README.md`(3칸 표면 — 재개 지점) · `../CHANGELOG.md`(릴리스별 변경 이력 — 화면 기준 서술, 파일명·함수명 금지). 결정 여정=workspace `erp-club/roadmap.md`(아카이브·비필독).

## File rules
- Max 300 lines/file. Facts only in page copy — every number needs a source (stat-src).
- Content decisions (스터디명·인원·지원 도구) = owner-only placeholders; never invent.
