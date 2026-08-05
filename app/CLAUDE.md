# CLAUDE.md — kwu-erpclub site app

One-line: KWU ERP연구회 MIS×AI 스터디 허브 — 주=스터디원 작업면(인사이트→세미나 파이프라인), 부=외부 증빙면.
표면명 주의: 페이지 = **AI 인사이트 / INSIGHTS / `/insights/`** — 계약 내부 종류명은 `기사`(content/기사/·schema) 유지.
Deploy: GitHub Pages, org repo `KWU-ERPCLUB/kwu-erpclub.github.io`, main push = auto deploy.
Static bundle + client-side fetch to Supabase (workspace only — 공개 6페이지는 여전히 정적).

## Commands
- dev: `npm run dev` (port 5173) / build: `npm run build` (vite build + `scripts/build-rss.mjs` → dist/rss.xml) / preview: `npm run preview`
- test: `npm test` (vitest run) / lint: `npm run lint` (oxlint src scripts)
- validate: `npm run validate` (content contract check — node scripts/validate-content.mjs)

## Stack & gotchas
- Vite 5 + React 18 (NOT 19 — older than other apps, don't bump casually), plain CSS (no Tailwind)
- MPA: static entries in vite.config rollupOptions.input = main(하이브리드: v3 소개+**모집 밴드**+최근 활동) +
  insights/seminars + **recruit**(IA 3차 2026-07-27 — AIM 기수 안내) + about/log/projects. new page = new dir + `src/*-entry.jsx` + input entry.
  (insights 페이지 컴포넌트 파일명 = `pages/Articles.jsx`·`styles/articles.css` 유지 — 내부명, URL만 insights)
- **모집 카피 규칙(SPEC §4 개정 2026-07-27)**: 사실 서술 허용(요강·기간·참여 방법 — 개조식) / 마케팅 어투 금지
  grep {지금 바로, 놓치지, 마지막 기회, 서두르, 얼른} = 0. 모집 밴드 국면 전환 = `home-logic.js recruitPhase`(창 = RECRUIT_WINDOW 유일 원천).
  [미정] 값(요일·회차 세부주제·주제 풀) 게재 금지 — 원천 = workspace `erp-club/docs/specs/2026-07-27-aim-운영틀.md`.
- **labs·reports·join 페이지 제거**(IA 2차 2026-07-23 — labs=세미나 흡수·reports=폐기·join=about 흡수). 재도입 = 오너 재승인.
- 멤버 페이지(목록+개인 auto-glob)는 **전부 제거**(SPEC 2026-07-23 오너 결정). 재도입 = 오너 재승인.
- base '/' (org root site). Fonts via CDN link tags in each entry html (Pretendard + Paperlogy).
- No router, no state lib. Shared nav/footer = `src/shared.jsx`. 메인 = `src/App.jsx`(과거 v3 소개형)/`styles/home.css`. (구 현황판 `pages/Home.jsx`·`styles/hub.css`는 2026-07-23 제거.)
- 지원(CTA·폼) 기능은 전면 보류(owner 2026-07-10) — do not re-add without owner call.

## Content contract & CI (SPEC §5·§6)
- 기고 = `content/<종류>/YYYY-MM-DD-<작성자id>-<슬러그>.md` (종류=**기사·세미나** — 실습 폐지). frontmatter 규칙의
  **유일 원천 = `src/content/schema.js`**(검증기 CLI·앱 로더 공용). 기사=source_url·source_name·성격·주제·`설명`(필수 — 카드는 본문 발췌 대신 설명만 표시, 2026-07-27)+`태그`(선택 0~5·표시 전용 #해시태그·필터 없음), 세미나=회차·유형(+선택 발원기사)·**유형=실습이면 본문 필수 헤딩 {## 준비, ## 진행, ## 재현 가이드}**.
- 로더 = `src/content/loader.js`(글롭 로드). 앱·CLI가 같은 스키마를 소비.
- CI = `.github/workflows/deploy.yml`: **validate + test + build 게이트** 통과해야 배포(PR에서도 build 실행, deploy는 push만). `guard-shared-paths` 잡 = 비오너(bapzzi 외) 변경은 `app/content`만 허용.
- **권한 구조(2026-07-25 하드 격리)**: GitHub 룰셋(id 19734261) — main 직접 push = repo 관리자만(오너·오너 자격 Claude). 멤버 = 브랜치→PR 필수. `app/content`만 고친 PR = 체크(build) 통과 시 셀프 머지(승인 0) / 공용 영역 터치 = CODEOWNERS(오너) 승인 필수. 룰셋 관리 = repo Settings > Rules.
- **주간 트렌드 자동화**: 클라우드 루틴 `trig_0118sfWk88m1uYZMfcYUTik4`(매주 월 09:00 KST, sonnet-5, 멱등 스킵 규칙 내장) — 관리 = claude.ai/code/routines. 수동 실행 = 로컬 스킬 `weekly-trend`.

## Workspace & data layer (SPEC 2026-08-05 워크스페이스-백엔드, M1 완료)
- `/workspace/` = 로그인 영역. entry = `workspace/index.html` + `src/workspace-entry.jsx` + `src/workspace/`, CSS = `styles/workspace.css`
  (공개 6페이지 코드·CSS와 공유 금지. 공개 nav에 링크 없음 — M3에서 판단).
- **Supabase 접근 = `src/data/` 경유만**(P1). 컴포넌트가 `data/supabase.js`·`repositories.js`를 직접 import 하면
  `src/data/boundary.test.js`가 FAIL — 우회 금지. 화면은 `data/index.js`의 `getRepositories()`만 쓴다.
- env 2종(`VITE_SUPABASE_URL`·`VITE_SUPABASE_ANON_KEY`) 미설정 = 정상 상태 → 목 저장소 폴백 + 대기 화면.
  키 이름 문서 = `.env.example`, 프로비저닝 = `../supabase/README.md`, 스키마·RLS = `../supabase/migrations/`.
- 저장소 계약 변경 시 `REPO_CONTRACT`(repositories.js)와 `mock.js`를 함께 고친다(계약 테스트가 불일치를 잡음).
- service 키 = 이 repo 금지(P2). 외부 패키지 추가 없음 — PostgREST·GoTrue를 fetch로 호출.

## Design (numeric source of truth)
- Rules: `../../docs/디자인규칙-메인.md` **v2** — 실측 고정 수치(버건디 화이트리스트 11형태·빈도 상한·
  버튼 3단 위계·인터랙션 4상태·내부형 밀도). UI 작업 전 필독. 위반=재작업.
- CSS: `src/styles/global.css`(공용 — 566줄, pre-v2 debt >300) + `src/styles/doc.css`(내부형 전용).
- Copy tone: AI-ish phrasing forbidden (규칙 §0-1). 3 viewports 375/768/1440, light-only.

## Docs map
- Project docs live OUTSIDE this repo (workspace `erp-club/docs/` — Tier2): 디자인규칙-메인.md(v2 디자인 규격) ·
  정체성-북극성.md(카피 상위 기준) — 기록·근거 문서는 `erp-club/docs/_archive/`(선행조사=수치 원천·리서치 3종·구 문안 등, 2026-07-25 정리)
- In-repo: `../README.md`(3칸 표면 — 재개 지점). 결정 여정=workspace `erp-club/roadmap.md`(아카이브·비필독).

## File rules
- Max 300 lines/file. Facts only in page copy — every number needs a source (stat-src).
- Content decisions (스터디명·인원·지원 도구) = owner-only placeholders; never invent.
