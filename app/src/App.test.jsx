import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'

// 구조 검증(콘텐츠·시점 무관) — v5 풀블리드 스크린 섹션: 100vh 히어로·대형 숫자 WHY·가로 타임라인·풀폭 커버·대형 FAQ.
test('메인 = 풀블리드 4섹션 + 100vh 히어로(뷰포트 타이포·마퀴·스크롤 유도)', () => {
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

test('섹션 인덱스 4종 + 각 섹션 구조 마크업', () => {
  const html = renderToString(<App />)
  for (const idx of ['01 — WHY', '02 — ROADMAP', '03 — PROJECTS', '04 — FAQ']) {
    expect(html).toContain(idx)
  }
  // WHY: 대형 숫자 카운트업(stat-num) + 풀폭 스탯 행
  expect(html).toContain('stat-num')
  expect(html).toContain('stat-rows')
  // ROADMAP: 가로 진행 타임라인 + "앞으로 채워갈 공간" 점선 슬롯
  expect(html).toContain('class="rmap')
  expect(html).toContain('rm-slot')
  // PROJECTS: 풀폭 커버 카드 + 커버 위 대형 제목 + /projects/ 딥링크
  expect(html).toContain('hp-card')
  expect(html).toContain('hp-cover')
  expect(html).toContain('hp-title')
  expect(html).toContain('/projects/?p=')
  // FAQ: 대형 아코디언(네이티브 details/summary)
  expect(html).toContain('faq-xl')
  expect(html).toContain('fx-item')
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
