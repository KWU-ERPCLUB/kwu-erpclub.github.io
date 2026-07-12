# CLAUDE.md — kwu-erpclub site app

One-line: KWU ERP연구회 통합 허브 — 메인(/)=소개 간판(외부), 세부 페이지=내부자 활용(운영 기록·로드맵·성과).
Deploy: GitHub Pages, org repo `KWU-ERPCLUB/kwu-erpclub.github.io`, main push = auto deploy. Static only (no backend/BaaS).

## Commands
- dev: `npm run dev` (port 5173) / build: `npm run build` / preview: `npm run preview`
- ⚠ no test/lint yet (§8 debt — vitest/oxlint install needs owner gate; set up on approval)

## Stack & gotchas
- Vite 5 + React 18 (NOT 19 — older than other apps, don't bump casually), plain CSS (no Tailwind)
- MPA: entries `index.html` + `about/` + `join/` + `log/` in vite.config rollupOptions.input —
  new page = new dir + `src/*-entry.jsx` + input entry. GitHub Pages serves dir index.
- base '/' (org root site). Fonts via CDN link tags in each entry html (Pretendard + Paperlogy).
- No router, no state lib. Shared nav/footer = `src/shared.jsx`.
- 지원(CTA·폼) 기능은 전면 보류(owner 2026-07-10) — do not re-add without owner call.

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
