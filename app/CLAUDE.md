# CLAUDE.md — kwu-erpclub site app

One-line: KWU ERP연구회 통합 허브 — 메인(/)=소개 간판(외부), 세부 페이지=내부자 활용(운영 기록·로드맵·성과).
Deploy: GitHub Pages, org repo `KWU-ERPCLUB/kwu-erpclub.github.io`, main push = auto deploy. Static only (no backend/BaaS).

## Commands
- dev: `npm run dev` (port 5173) / build: `npm run build` / preview: `npm run preview`
- test: `npm test` (vitest run — 18 tests / 8 files) / lint: `npm run lint` (oxlint src scripts)
- validate: `npm run validate` (content contract check — node scripts/validate-content.mjs)

## Stack & gotchas
- Vite 5 + React 18 (NOT 19 — older than other apps, don't bump casually), plain CSS (no Tailwind)
- MPA: static entries in vite.config rollupOptions.input = main(현황판) + articles/seminars/labs +
  membersIndex + about/join/log/reports/projects. new page = new dir + `src/*-entry.jsx` + input entry.
- **멤버 개인 페이지 = auto-glob**: `members/<id>/index.html` 폴더만 추가하면 vite가 `member-<id>` 엔트리 자동 생성(SPEC §7). 개인 페이지는 **공용 src/ import 금지**(격리 — 스타일은 그 파일 안 로컬).
- base '/' (org root site). Fonts via CDN link tags in each entry html (Pretendard + Paperlogy).
- No router, no state lib. Shared nav/footer = `src/shared.jsx`. 메인 = `src/pages/Home.jsx`(현황판) — 구 `App.jsx`/`styles/home.css`는 재사용 대비 보존.
- 지원(CTA·폼) 기능은 전면 보류(owner 2026-07-10) — do not re-add without owner call.

## Content contract & CI (SPEC §5·§6)
- 기고 = `content/<종류>/YYYY-MM-DD-<작성자id>-<슬러그>.md` (종류=기사·세미나·실습). frontmatter 규칙의
  **유일 원천 = `src/content/schema.js`**(검증기 CLI·앱 로더 공용). 기사=source_url·source_name·tags(enum) 필수, 세미나=회차·유형, 실습=연계회차·tools.
- 로더 = `src/content/loader.js`(글롭 로드). 앱·CLI가 같은 스키마를 소비.
- CI = `.github/workflows/deploy.yml`: **validate + test + build 게이트** 통과해야 배포. `guard-shared-paths` 잡 = 비오너(bapzzi 외) push는 `app/content`·`app/members`만 허용(공용 영역 변경은 PR+오너 승인 — CODEOWNERS).

## Design (numeric source of truth)
- Rules: `../../docs/디자인규칙-메인.md` **v2** — 실측 고정 수치(버건디 화이트리스트 10형태·빈도 상한·
  버튼 3단 위계·인터랙션 4상태·내부형 밀도). UI 작업 전 필독. 위반=재작업.
- CSS: `src/styles/global.css`(공용 — 566줄, pre-v2 debt >300) + `src/styles/doc.css`(내부형 전용).
- Copy tone: AI-ish phrasing forbidden (규칙 §0-1). 3 viewports 375/768/1440, light-only.

## Docs map
- Project docs live OUTSIDE this repo (workspace `erp-club/docs/` — Tier2): 디자인규칙-메인.md(v2 디자인 규격) ·
  문안-메인.md(카피 원천, 6차) · specs/2026-07-10-portfolio-mainpage-design.md(IA spec) · 선행조사-2026-07-10.md(팩트 원천)
- In-repo: `../README.md`(3칸 표면 — 재개 지점). 결정 여정=workspace `erp-club/roadmap.md`(아카이브·비필독).

## File rules
- Max 300 lines/file. Facts only in page copy — every number needs a source (stat-src).
- Content decisions (스터디명·인원·지원 도구) = owner-only placeholders; never invent.
