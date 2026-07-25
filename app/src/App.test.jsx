import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'

// 구조 검증(콘텐츠·시점 무관) — v5 풀블리드 스크린 섹션: 100vh 히어로·가로 타임라인·풀폭 커버·대형 FAQ. (WHY 폐지 2026-07-25)
test('메인 = 풀블리드 3섹션 + 100vh 히어로(뷰포트 타이포·마퀴·스크롤 유도)', () => {
  const html = renderToString(<App />)
  // 격자 폐지: .lattice/.cell 컨테이너 부재 → .home 풀블리드
  expect(html).toContain('class="home"')
  expect(html).not.toContain('class="lattice"')
  // 히어로 100vh: 뷰포트 타이포(hero-mega) + 문자 스태거 리빌(sc) + 브랜드 키커
  expect(html).toContain('hs-hero')
  expect(html).toContain('hero-mega')
  expect(/class="sc"|class="sc /.test(html)).toBe(true)
  // 히어로 하단: 풀폭 마퀴 띠 + 스크롤 유도
  expect(html).toContain('marquee-track')
  expect(html).toContain('marquee-item')
  expect(html).toContain('scroll-cue')
})

test('섹션 인덱스 3종 + 각 섹션 구조 마크업', () => {
  const html = renderToString(<App />)
  for (const idx of ['01 — ROADMAP', '02 — PROJECTS', '03 — FAQ']) {
    expect(html).toContain(idx)
  }
  // ROADMAP: 가로 진행 타임라인 + "앞으로 채워갈 공간" 점선 슬롯
  expect(html).toContain('class="rmap')
  expect(html).toContain('rm-slot')
  // PROJECTS: 풀폭 커버 카드 + 커버 위 대형 제목 + /projects/ 딥링크
  expect(html).toContain('hp-card')
  expect(html).toContain('hp-cover')
  expect(html).toContain('hp-title')
  expect(html).toContain('/projects/?p=')
  // FAQ: 대형 아코디언(네이티브 details/summary) + WHY 이관 1문(챗 단독의 한계)
  expect(html).toContain('faq-xl')
  expect(html).toContain('fx-item')
  expect(html).toContain('스터디가 왜 필요한가요')
})

test('WHY 섹션 부재(2026-07-25 폐지) — 수치 스트립·섹션 앵커 없음', () => {
  const html = renderToString(<App />)
  expect(html).not.toContain('id="why"')
  expect(html).not.toContain('stat-rows')
  expect(html).not.toContain('stat-num')
  expect(html).not.toContain('data-note')
})

test('RECENT 섹션 부재 + 삭제 페이지 링크(/join /reports /labs) 부재', () => {
  const html = renderToString(<App />)
  expect(html).not.toContain('id="recent"')
  expect(html).not.toContain('RECENT')
  expect(html).not.toContain('recent-item')
  expect(html).not.toContain('/join/')
  expect(html).not.toContain('/reports/')
  expect(html).not.toContain('/labs/')
})
