// ADsP 인터랙티브 상세 — 핵심 렌더·수치 정합 테스트(고도화 2026-08-13: 레퍼런스 5종 복합 + P-A~C).
// ①챕터 앵커(실패 포함) ②히어로=단일원천 ③도트 필드 정합 ④토글·캐러셀·타일 골격 ⑤실패/판정 콘텐츠
// ⑥보드 링크 0 ⑦재구성 라벨 ⑧타인 실명 0 ⑨목록 연결. 렌더 = renderToString(사이트 표준 — jsdom 없음).
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import ProjectAdsp from './ProjectAdsp.jsx'
import { MetricTable, ToolCarousel, BuildLoop, BuildEvidence, BuildPrinciples, ToolTiles, CodeStats, LogRail } from './project-adsp-parts.jsx'
import { DotField, ToggleCompare, FailCards, VerdictSplit, dotLayouts } from './project-adsp-viz.jsx'
import {
  HERO_STATS, WEEKLY_ANSWERS, METRICS, CHAPTERS, TOOL_SLIDES, BUILD_STEPS, BUILD_TILES,
  BUILD_PRINCIPLES, CODE_STATS, MINOR_ITEMS, PROMPTS, FAILS, VERDICT, DOT_SCALE,
} from '../data/project-adsp-data.js'
import { INTERACTIVE_PAGES } from '../Projects.jsx'

// flat = 주석 제거 + HTML 엔티티 복원(따옴표 포함 문안을 원문 그대로 대조하기 위함)
const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')
  .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&')
const page = flat(<ProjectAdsp />)

test('챕터 10개(제작·실패 포함) 전부 앵커 섹션 + 로컬 나브 링크로 렌더', () => {
  expect(CHAPTERS.map((c) => c.id)).toContain('build')
  expect(CHAPTERS.map((c) => c.id)).toContain('fail')
  for (const c of CHAPTERS) {
    expect(page, `#${c.id} 섹션`).toContain(`id="${c.id}"`)
    expect(page, `#${c.id} 나브 링크`).toContain(`href="#${c.id}"`)
  }
})

test('보드 링크 0건(로그인 불가) + 히어로 = 스터디 1기 + 제작 축 수치 = 단일원천', () => {
  expect(page).not.toContain('erpstudy.vercel.app')
  expect(page).toContain('ADsP 스터디')
  for (const s of HERO_STATS) {
    expect(page).toContain(s.value)
    expect(page).toContain(s.label)
  }
})

test('도트 필드 — 주별 합 7,976 정합 · 도트 수 = 값/10 합 · 스텝 3 · SSR = 최종 상태(주 라벨·52.7%)', () => {
  expect(WEEKLY_ANSWERS.reduce((a, d) => a + d.value, 0)).toBe(7976)
  const expected = WEEKLY_ANSWERS.reduce((a, d) => a + Math.round(d.value / DOT_SCALE), 0)
  const { scatter, stack } = dotLayouts()
  expect(scatter.length).toBe(expected)
  expect(stack.length).toBe(expected)
  const d = flat(<DotField />)
  expect((d.match(/pa-fdot[ "]/g) || []).length).toBeGreaterThanOrEqual(expected)
  expect(d).toContain('52.7%') // no-JS·reduced-motion에서도 결론이 보인다
  for (const w of WEEKLY_ANSWERS) expect(d).toContain(w.week)
  expect((d.match(/pa-dot-step[ "]/g) || []).length).toBeGreaterThanOrEqual(3)
})

test('토글 비교(E2) — 두 상태 버튼 + 초기 = 개선 후 노출, 페이지에 2회(v1.1·문항 수리)', () => {
  const t = flat(<ToggleCompare
    a={{ img: '/a.png', label: '수리 전', alt: 'a' }}
    b={{ img: '/b.png', label: '수리 후', alt: 'b' }} caption="cap" />)
  expect(t).toContain('수리 전')
  expect(t).toContain('수리 후')
  expect(t).toContain('aria-selected="true"')
  expect((page.match(/pa-tg-frame/g) || []).length).toBe(2)
})

test('실패 챕터(P-A) — 카드 4종 전부 원인·수리 동반 + 판정 2열(P-B) 렌더', () => {
  const f = flat(<FailCards />)
  expect(FAILS).toHaveLength(4)
  for (const x of FAILS) {
    expect(f).toContain(x.title)
    expect(f, `원인 없는 실패 열거 금지: ${x.title}`).toContain(x.cause)
    expect(f).toContain(x.fix)
  }
  const v = flat(<VerdictSplit />)
  expect(v).toContain('통한 조건')
  expect(v).toContain('안 통할 조건')
  for (const t of [...VERDICT.works, ...VERDICT.limits]) expect(v).toContain(t)
})

test('제작 챕터 — 타일 4·루프 4단계·투입 실측(P-C)·도구 명시(Opus 5)·원칙 4·발췌·재구성 라벨', () => {
  const tiles = flat(<ToolTiles />)
  for (const t of BUILD_TILES) expect(tiles).toContain(t.name)
  const l = flat(<BuildLoop />)
  for (const s of BUILD_STEPS) expect(l).toContain(s.k)
  const cs = flat(<CodeStats />)
  for (const s of CODE_STATS) expect(cs).toContain(s.value)
  expect(page).toContain('Opus 5')
  const pr = flat(<BuildPrinciples />)
  for (const p of BUILD_PRINCIPLES) {
    expect(pr).toContain(p.k)
    expect(pr, `원칙 근거 표기: ${p.k}`).toContain(p.src)
  }
  const e = flat(<BuildEvidence />)
  expect(e).toContain('실물 발췌 · spec 문서')
  expect(e).toContain('실물 발췌 · git 커밋 로그')
  expect(page.split('재구성 예시').length - 1).toBeGreaterThanOrEqual(PROMPTS.length)
})

test('지표 표 — 4종 + 톤 칩(E5) 렌더 · 개선 로그 레일(E1) = 전 항목', () => {
  const m = flat(<MetricTable />)
  for (const x of METRICS) {
    expect(m).toContain(x.key)
    expect(m).toContain(`pa-tone ${x.tone}`)
  }
  const r = flat(<LogRail />)
  for (const it of MINOR_ITEMS) expect(r).toContain(it.date)
})

test('캐러셀 — 슬라이드 전량 + 도트 + 일시정지 버튼(aria-pressed)', () => {
  const c = flat(<ToolCarousel />)
  for (const s of TOOL_SLIDES) expect(c).toContain(s.img)
  expect(c).toContain('aria-pressed="false"')
  expect(c).toContain('자동 전환 일시정지')
})

test('타인 실명 미노출(§5-4) — 렌더 마크업에 스터디원 이름 0건', () => {
  for (const name of ['곽하연', '김채영', '윤정민', '이소은', '이희승', '최성은', '유준혁', '이서정', '백민석', '이가영']) {
    expect(page).not.toContain(name)
  }
})

test('목록 연결 — adsp 슬러그 = 전용 페이지 매핑', () => {
  expect(INTERACTIVE_PAGES['2026-07-24-bapzzi-adsp-board']).toBe('/projects/adsp/')
})
