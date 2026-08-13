// ADsP 인터랙티브 상세 — 핵심 렌더·수치 정합 테스트(spec §8 + 피드백 개편 2026-08-13).
// ①챕터 앵커 ②히어로 수치=단일원천 ③주별 합=7,976 ④표·캐러셀·제작 조각 골격 ⑤보드 링크 0
// ⑥재구성 라벨 ⑦타인 실명 0 ⑧목록 연결. 렌더 = renderToString(사이트 표준 — jsdom 없음).
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import ProjectAdsp from './ProjectAdsp.jsx'
import { MetricTable, ToolCarousel, WeeklyChart, BuildLoop, BuildEvidence } from './project-adsp-parts.jsx'
import {
  HERO_STATS, WEEKLY_ANSWERS, METRICS, CHAPTERS, TOOL_SLIDES, BUILD_STEPS, PROMPTS,
} from '../data/project-adsp-data.js'
import { INTERACTIVE_PAGES } from '../Projects.jsx'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')
const page = flat(<ProjectAdsp />)

test('챕터 9개(제작 포함) 전부 앵커 섹션 + 로컬 나브 링크로 렌더', () => {
  expect(CHAPTERS.map((c) => c.id)).toContain('build')
  for (const c of CHAPTERS) {
    expect(page, `#${c.id} 섹션`).toContain(`id="${c.id}"`)
    expect(page, `#${c.id} 나브 링크`).toContain(`href="#${c.id}"`)
  }
})

test('보드 링크 0건(오너 2026-08-13 — 로그인 불가) + 히어로 = 스터디 1기 전면', () => {
  expect(page).not.toContain('erpstudy.vercel.app')
  expect(page).toContain('ADsP 스터디')
})

test('히어로 수치 3종(제작 축) = 데이터 단일원천과 일치(하드코딩 아님)', () => {
  for (const s of HERO_STATS) {
    expect(page).toContain(s.value)
    expect(page).toContain(s.label)
  }
})

test('주별 답안 합 = 7,976(§7 수치 정합) · 시험주 강조 1개', () => {
  expect(WEEKLY_ANSWERS.reduce((a, d) => a + d.value, 0)).toBe(7976)
  expect(WEEKLY_ANSWERS.filter((d) => d.hot)).toHaveLength(1)
})

test('차트 — 강조 막대 직접 라벨(4,207) + 주 라벨 전부 렌더', () => {
  const c = flat(<WeeklyChart />)
  expect(c).toContain('4,207')
  for (const d of WEEKLY_ANSWERS) expect(c).toContain(d.week)
  expect(c).toContain('52.7%') // 캡션 — 표본 조건 서술
})

test('지표 표 — 4종 전부 계산식과 함께 렌더(탭 아님)', () => {
  const m = flat(<MetricTable />)
  for (const x of METRICS) {
    expect(m).toContain(x.key)
    expect(m).toContain(x.q)
  }
  expect(m).not.toContain('role="tablist"')
})

test('제작 챕터 — 루프 4단계·실물 발췌 2종·재구성 라벨', () => {
  const l = flat(<BuildLoop />)
  for (const s of BUILD_STEPS) expect(l).toContain(s.k)
  const e = flat(<BuildEvidence />)
  expect(e).toContain('실물 발췌 · spec 문서')
  expect(e).toContain('실물 발췌 · git 커밋 로그')
  // 프롬프트 = 원문 미보존 → 재구성 라벨 필수(페이지에 카드 수만큼)
  expect(page.split('재구성 예시').length - 1).toBeGreaterThanOrEqual(PROMPTS.length)
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
