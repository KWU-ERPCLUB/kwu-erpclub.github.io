# CLAUDE.md — kwu-erpclub site app

One-line: KWU ERP연구회 MIS×AI 스터디 허브 — 주=스터디원 작업면(인사이트→세미나 파이프라인), 부=외부 증빙면.
표면명 주의: 페이지 = **AI 인사이트 / INSIGHTS / `/insights/`** — 계약 내부 종류명은 `기사`(content/기사/·schema) 유지.
Deploy: GitHub Pages, org repo `KWU-ERPCLUB/kwu-erpclub.github.io`, main push = auto deploy. Static only (no backend/BaaS).

## Commands
- dev: `npm run dev` (port 5173) / build: `npm run build` (vite build + `scripts/build-rss.mjs` → dist/rss.xml) / preview: `npm run preview`
- test: `npm test` (vitest run — 32 tests / 7 files) / lint: `npm run lint` (oxlint src scripts)
- validate: `npm run validate` (content contract check — node scripts/validate-content.mjs)

## Stack & gotchas
- Vite 5 + React 18 (NOT 19 — older than other apps, don't bump casually), plain CSS (no Tailwind)
- MPA: static entries in vite.config rollupOptions.input = main(하이브리드: v3 소개+최근 활동) +
  insights/seminars + about/log/projects. new page = new dir + `src/*-entry.jsx` + input entry.
  (insights 페이지 컴포넌트 파일명 = `pages/Articles.jsx`·`styles/articles.css` 유지 — 내부명, URL만 insights)
- **labs·reports·join 페이지 제거**(IA 2차 2026-07-23 — labs=세미나 흡수·reports=폐기·join=about 흡수). 재도입 = 오너 재승인.
- 멤버 페이지(목록+개인 auto-glob)는 **전부 제거**(SPEC 2026-07-23 오너 결정). 재도입 = 오너 재승인.
- base '/' (org root site). Fonts via CDN link tags in each entry html (Pretendard + Paperlogy).
- No router, no state lib. Shared nav/footer = `src/shared.jsx`. 메인 = `src/App.jsx`(과거 v3 소개형)/`styles/home.css`. (구 현황판 `pages/Home.jsx`·`styles/hub.css`는 2026-07-23 제거.)
- 지원(CTA·폼) 기능은 전면 보류(owner 2026-07-10) — do not re-add without owner call.

## Content contract & CI (SPEC §5·§6)
- 기고 = `content/<종류>/YYYY-MM-DD-<작성자id>-<슬러그>.md` (종류=**기사·세미나** — 실습 폐지). frontmatter 규칙의
  **유일 원천 = `src/content/schema.js`**(검증기 CLI·앱 로더 공용). 기사=source_url·source_name·`용도`(1~2 필수)+`기술`(0~2 선택) — 구 tags 폐지, 세미나=회차·유형(+선택 발원기사)·**유형=실습이면 본문 필수 헤딩 {## 준비, ## 진행, ## 재현 가이드}**.
- 로더 = `src/content/loader.js`(글롭 로드). 앱·CLI가 같은 스키마를 소비.
- CI = `.github/workflows/deploy.yml`: **validate + test + build 게이트** 통과해야 배포. `guard-shared-paths` 잡 = 비오너(bapzzi 외) push는 `app/content`만 허용(공용 영역 변경은 PR+오너 승인 — CODEOWNERS).

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
