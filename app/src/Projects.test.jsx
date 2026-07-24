import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import { splitProjectBody, ProjectCard, ProjectGrid, ProjectDetail } from './Projects.jsx'

const noop = () => {}
const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

const P = {
  slug: '2026-07-24-bapzzi-adsp-board', title: 'ADsP Study Board', author: 'bapzzi', date: '2026-07-24',
  설명: 'ADsP 1기 스터디의 진도·성취도 웹앱', 상태: '운영 중', 커버: '/img/projects/adsp-board.png',
  web: 'https://erpstudy.vercel.app', github: 'https://github.com/x/y',
  body: '- 진도·성취도 관리\n- React + Supabase\n\n## 프롬프트 로그\n\n프로젝트 진행 프롬프트 기록 — 이후 회차부터 축적.',
}

// ── 본문 분할(순수) ──
test('splitProjectBody — 소개 intro + 프롬프트 로그 섹션 분할', () => {
  const { intro, logs } = splitProjectBody(P.body)
  expect(intro).toContain('진도·성취도 관리')
  expect(logs).toHaveLength(1)
  expect(logs[0].heading).toBe('프롬프트 로그')
  expect(logs[0].body).toContain('이후 회차부터 축적')
})
test('splitProjectBody — 헤딩 없으면 intro만·logs 빈배열', () => {
  const { intro, logs } = splitProjectBody('그냥 소개 한 줄')
  expect(intro).toBe('그냥 소개 한 줄')
  expect(logs).toEqual([])
})

// ── 그리드/카드/오버레이 ──
test('ProjectCard — 커버·제목·설명·상태 칩 + 호버 오버레이(GitHub·Web)', () => {
  const html = flat(<ProjectCard p={P} onOpen={noop} />)
  expect(html).toContain('pj-card-cover')
  expect(html).toContain('/img/projects/adsp-board.png') // 커버 이미지
  expect(html).toContain('ADsP Study Board')
  expect(html).toContain('진도·성취도 웹앱')
  expect(html).toContain('status live') // 운영 중 → live 칩
  expect(html).toContain('pj-card-overlay') // 오버레이 존재
  expect(html).toContain('GitHub')
  expect(html).toContain('https://github.com/x/y')
  expect(html).toContain('https://erpstudy.vercel.app')
})
test('ProjectCard — 링크 없으면 오버레이 미렌더, 커버=이니셜 fallback', () => {
  const bare = { slug: 's', title: 'Bare', 설명: '설명', 상태: '보관', body: '' }
  const html = flat(<ProjectCard p={bare} onOpen={noop} />)
  expect(html).not.toContain('pj-card-overlay')
  expect(html).toContain('pj-cover-fallback') // 커버 없음 → 이니셜 타일
  expect(html).toContain('status planned') // 보관 → planned
})
test('ProjectGrid — 항목이면 그리드, 0건이면 디자인된 빈 상태(무엇이 쌓이나 + 기고 방법)', () => {
  expect(flat(<ProjectGrid list={[P]} onOpen={noop} />)).toContain('pj-grid')
  const empty = flat(<ProjectGrid list={[]} onOpen={noop} />)
  expect(empty).toContain('등재된 프로젝트 아직 없음')
  expect(empty).toContain('content/프로젝트/') // 기고 방법 안내
})

// ── 상세(커버 배너 → 제목·설명·상태·링크 → 소개 → 프롬프트 로그) ──
test('ProjectDetail — 배너·제목·설명·상태·링크·소개·프롬프트 로그 렌더', () => {
  const html = flat(<ProjectDetail p={P} onBack={noop} />)
  expect(html).toContain('pj-detail-banner')
  expect(html).toContain('pj-detail-cover')
  expect(html).toContain('ADsP Study Board')
  expect(html).toContain('진도·성취도 웹앱')
  expect(html).toContain('status live')
  expect(html).toContain('https://erpstudy.vercel.app') // Web 링크
  expect(html).toContain('React + Supabase') // 소개 본문(Markdown)
  expect(html).toContain('pj-log-title') // 프롬프트 로그 섹션 제목
  expect(html).toContain('프롬프트 로그')
  expect(html).toContain('이후 회차부터 축적') // 로그 본문
})
