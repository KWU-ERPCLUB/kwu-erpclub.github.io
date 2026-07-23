import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'

test('메인 하이브리드 — 상단 소개 + 하단 최근 활동 섹션', () => {
  const html = renderToString(<App />)
  // 상단 소개(v3 승계)
  expect(html).toContain('ERP')
  expect(html).toContain('WHY')
  // 하단 최근 활동
  expect(html).toContain('RECENT')
  expect(html).toContain('최근')
  // 최근 기사(예시 기고 1건이 실제 로더로 잡힘)
  expect(html).toContain('2026 AI 트렌드')
  // 세미나 칸 — 콘텐츠·시점 무관 구조 검증: 항목(recent-item) 또는 디자인된 빈 상태(recent-empty) 중 하나
  expect(html).toContain('SEMINARS')
  expect(/recent-item|recent-empty/.test(html)).toBe(true)
})

test('삭제 페이지 링크 부재 — /join/ /reports/ /labs/ 없음', () => {
  const html = renderToString(<App />)
  expect(html).not.toContain('/join/')
  expect(html).not.toContain('/reports/')
  expect(html).not.toContain('/labs/')
})
