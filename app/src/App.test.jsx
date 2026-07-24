import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'

// 구조 검증(콘텐츠·시점 무관) — 4섹션 유지 + 풀 모션 마크업(마퀴·카운트업·슬롯), RECENT 제거.
test('메인 4섹션 풀 모션 — 히어로·WHY·ROADMAP·PROJECTS·FAQ + 마퀴·카운트업·슬롯', () => {
  const html = renderToString(<App />)
  // 섹션 인덱스(4섹션 구조)
  for (const idx of ['01 — WHY', '02 — ROADMAP', '03 — PROJECTS', '04 — FAQ']) {
    expect(html).toContain(idx)
  }
  // 히어로 대형 타이포 + 문자 스태거 리빌
  expect(html).toContain('hero-title')
  expect(/class="sc"|class="sc /.test(html)).toBe(true)
  // 키워드 마퀴 띠(흐르는 텍스트 트랙)
  expect(html).toContain('marquee-track')
  expect(html).toContain('marquee-item')
  // 수치 카운트업 마운트 지점(stat-num)
  expect(html).toContain('stat-num')
  // ROADMAP "앞으로 채워갈 공간" 점선 슬롯
  expect(html).toContain('b-slot')
})

test('RECENT 섹션 제거 — 최근 활동 마크업 부재', () => {
  const html = renderToString(<App />)
  expect(html).not.toContain('id="recent"')
  expect(html).not.toContain('RECENT')
  expect(html).not.toContain('recent-item')
})

test('삭제 페이지 링크 부재 — /join/ /reports/ /labs/ 없음', () => {
  const html = renderToString(<App />)
  expect(html).not.toContain('/join/')
  expect(html).not.toContain('/reports/')
  expect(html).not.toContain('/labs/')
})
