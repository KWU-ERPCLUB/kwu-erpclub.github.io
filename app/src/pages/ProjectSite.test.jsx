// 허브 사이트 인터랙티브 상세 — 핵심 렌더·정합 테스트.
// ①챕터 앵커 ②헤더 메타 = 단일원천 ③로드맵 노드 전량·큰 전환점 수·좌우 교대 ④면 6종 캡처·결정
// ⑤카피 규칙(대시로 절 잇기 금지·내부 구현 용어 금지) ⑥목록 연결. 렌더 = renderToString(사이트 표준).
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import ProjectSite from './ProjectSite.jsx'
import { RoadmapZigzag } from './project-site-roadmap.jsx'
import { HeaderMeta, StackChips, PageShowcase } from './project-site-parts.jsx'
import { META, STACK, HERO_STATS, PAGES, NEXT } from '../data/project-site-data.js'
import { MILESTONES, MAJOR_COUNT } from '../data/project-site-roadmap-data.js'
import { authorName } from '../content/authors.js'
import { INTERACTIVE_PAGES } from '../Projects.jsx'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')
  .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&')
const page = flat(<ProjectSite />)

test('챕터 3개 전부 앵커 섹션 + 로컬 나브 링크로 렌더', () => {
  for (const id of ['screens', 'roadmap', 'next']) {
    expect(page, `#${id} 섹션`).toContain(`id="${id}"`)
    expect(page, `#${id} 나브 링크`).toContain(`href="#${id}"`)
  }
})

test('헤더 — 목적·제작 정보·스택·수치·링크 = 데이터 단일원천', () => {
  const m = flat(<HeaderMeta />)
  expect(page).toContain(META.purpose)
  expect(m, '작성자는 계정 id가 아니라 사람 이름').toContain(authorName(META.authorId))
  expect(m).not.toContain(META.authorId)
  for (const v of [META.period, META.status, ...META.roles]) expect(m).toContain(v)
  const s = flat(<StackChips />)
  for (const t of STACK) {
    expect(s).toContain(t.name)
    expect(s).toContain(t.role)
  }
  for (const h of HERO_STATS) {
    expect(page).toContain(h.value)
    expect(page, `근거 없는 수치 금지: ${h.label}`).toContain(h.src)
  }
  expect(page).toContain(META.live)
  expect(page).toContain(META.repo)
})

test('로드맵 — 노드 전량 렌더 · 큰 전환점 = 단일원천 수 · 좌우 교대 · AI 활용 표기', () => {
  const r = flat(<RoadmapZigzag />)
  expect(MILESTONES.length).toBeGreaterThanOrEqual(12)
  for (const m of MILESTONES) {
    expect(r, `노드 제목: ${m.title}`).toContain(m.title)
    expect(r, `노드 결정: ${m.title}`).toContain(m.decide)
    for (const p of m.pages) expect(r).toContain(p)
  }
  expect((r.match(/ps-rm-node [a-z]+ major/g) || []).length).toBe(MAJOR_COUNT)
  expect(MAJOR_COUNT).toBeGreaterThan(0)
  expect(MAJOR_COUNT).toBeLessThan(MILESTONES.length)
  // 지그재그 = 좌우가 모두 존재
  expect(r).toContain('ps-rm-node left')
  expect(r).toContain('ps-rm-node right')
  // AI 활용은 있는 항목만 표기(빈 라벨 금지)
  const aiCount = MILESTONES.filter((m) => m.ai).length
  expect((r.match(/ps-rm-ai-label/g) || []).length).toBe(aiCount)
})

test('면별 쇼케이스 — 6면 전부 캡처·역할·결정 + 로그인 영역은 공개 링크 없음', () => {
  const s = flat(<PageShowcase />)
  expect(PAGES).toHaveLength(6)
  for (const p of PAGES) {
    expect(s, `캡처: ${p.name}`).toContain(p.shot)
    expect(s, `대체 텍스트: ${p.name}`).toContain(p.alt)
    expect(s).toContain(p.role)
    for (const d of p.decisions) {
      expect(s).toContain(d.q)
      expect(s).toContain(d.a)
      expect(s, `결정 근거 누락: ${d.q}`).toContain(d.why)
    }
  }
  const ws = PAGES.find((p) => p.id === 'workspace')
  expect(ws.href).toBeNull()
  expect(s).toContain('로그인 영역')
})

test('남은 것 — 완료 선언 대신 진행 중 항목 노출', () => {
  for (const n of NEXT) {
    expect(page).toContain(n.k)
    expect(page).toContain(n.v)
  }
})

test('카피 규칙 — 대시로 절 잇기 0건 · 내부 구현 용어(파일명·확장자) 0건', () => {
  const text = page.replace(/<[^>]+>/g, ' ')
  expect(text, '대시(—) 금지 — 줄바꿈이 대신한다').not.toContain('—')
  for (const bad of ['.jsx', '.mjs', 'src/', 'content/']) {
    expect(text, `내부 구현 용어 노출: ${bad}`).not.toContain(bad)
  }
})

test('목록 연결 — 허브 사이트 슬러그 = 전용 페이지 매핑', () => {
  expect(INTERACTIVE_PAGES['2026-07-24-bapzzi-erpclub-site']).toBe('/projects/site/')
})
