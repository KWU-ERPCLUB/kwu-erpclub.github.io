import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Projects, { ProjectCard, ProjectGrid, INTERACTIVE_PAGES } from './Projects.jsx'

const noop = () => {}
const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

const P = {
  slug: '2026-07-24-bapzzi-adsp-board', title: 'ADsP Study Board', author: 'bapzzi', date: '2026-07-24',
  설명: 'ADsP 1기 스터디의 진도·성취도 웹앱', 상태: '운영 중', 커버: '/img/projects/adsp-board.png',
  web: 'https://erpstudy.vercel.app', github: 'https://github.com/x/y',
  body: '- 진도·성취도 관리\n- React + Supabase\n\n## 프롬프트 로그\n\n프로젝트 진행 프롬프트 기록 — 이후 회차부터 축적.',
}

// ── 상세 = 전용 페이지만(2026-08-20 md 본문 상세 폐지) ──
test('전용 상세 매핑 — 등재 프로젝트는 전용 페이지 URL을 가진다', () => {
  expect(INTERACTIVE_PAGES[P.slug]).toBe('/projects/adsp/')
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
  expect(empty).toContain('인사이트 기고 탭') // 기고 방법 안내(2026-08-14 — 구 content/ 복사 절차 폐지, 워크스페이스 기고 탭)
})

// ── 4차 개편(2026-08-06) — 블랙 통계 밴드(.pj-stats) 삭제(피드백 "홈 내용") ──
test('4차 — 페이지에 블랙 통계 밴드 부재 + 중앙 헤드(문장형 설명)', () => {
  const html = flat(<Projects />)
  expect(html).not.toContain('pj-stats')
  expect(html).not.toContain('pj-stat-num')
  expect(html).toContain('pg-head')
  expect(html).not.toContain('pg-sub') // 설명 줄 = 오너 삭제 2026-08-15(대시 부연 폐지)
})
test('ProjectCard — idx 전달 시 쇼케이스 번호(01), 미전달 시 미렌더', () => {
  expect(flat(<ProjectCard p={P} idx={0} onOpen={noop} />)).toContain('pj-card-idx')
  expect(flat(<ProjectCard p={P} idx={0} onOpen={noop} />)).toContain('01')
  expect(flat(<ProjectCard p={P} onOpen={noop} />)).not.toContain('pj-card-idx')
})

// 목록 페이지에 md 본문 상세 흔적이 남지 않는다(전용 페이지로 일원화)
test('목록 — md 본문 상세(.pj-detail) 렌더 경로 부재', () => {
  const html = flat(<Projects />)
  expect(html).not.toContain('pj-detail')
  expect(html).not.toContain('pj-log-title')
})
