import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import SeriesCover, { parseWeekLabel, coverLines } from './SeriesCover.jsx'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

// 커버에 들어가는 유일한 가변 정보 = 주차. 제목에서 파싱한다.
test('주차 파싱 — "N월 M주" 인식 · 보강판 · 범위 밖 · 실패', () => {
  expect(parseWeekLabel('주간 AI 트렌드 — 7월 5주')).toBe('7월 5주차')
  expect(parseWeekLabel('주간 AI 트렌드 — 7월 4주 보강')).toBe('7월 4주차')
  expect(parseWeekLabel('주간 AI 트렌드 — 12월 1주')).toBe('12월 1주차')
  expect(parseWeekLabel('주간 AI 트렌드 — 13월 2주')).toBe(null) // 월 범위 밖
  expect(parseWeekLabel('주간 AI 트렌드 — 7월 9주')).toBe(null)  // 주 범위 밖
  expect(parseWeekLabel('주간 AI 트렌드')).toBe(null)
  expect(parseWeekLabel(null)).toBe(null)
})

test('코너명 2줄 분할 — 대형 타이포로 프레임을 채우기 위한 고정 분할', () => {
  expect(coverLines('주간 AI 트렌드')).toEqual(['주간 AI', '트렌드'])
  expect(coverLines('분기 리뷰')).toEqual(['분기', '리뷰'])
  expect(coverLines('트렌드')).toEqual(['트렌드'])
})

// 회차가 달라도 시각 아이덴티티(색·구도)는 고정, 주차 텍스트만 바뀐다.
test('회차별 렌더 — w30·w31이 서로 다른 주차 텍스트', () => {
  const w30 = flat(<SeriesCover id="weekly" a={{ title: '주간 AI 트렌드 — 7월 4주 보강' }} />)
  const w31 = flat(<SeriesCover id="weekly" a={{ title: '주간 AI 트렌드 — 7월 5주' }} />)
  expect(w30).toContain('7월 4주차')
  expect(w31).toContain('7월 5주차')
  expect(w30).not.toContain('7월 5주차')
  for (const html of [w30, w31]) {
    expect(html).toContain('주간 AI')
    expect(html).toContain('트렌드')
    expect(html).toContain('viewBox="0 0 1200 750"') // 구도 = 16:10 고정
    expect(html).toContain('art-cover-svg')
  }
})

test('주차 파싱 실패 = 코너명만 렌더(커버가 깨지지 않는다) · 미등록 id = 미렌더', () => {
  const html = flat(<SeriesCover id="weekly" a={{ title: '주간 AI 트렌드' }} />)
  expect(html).toContain('주간 AI')
  expect(html).not.toContain('주차')
  expect(html).toContain('aria-label="주간 AI 트렌드"')
  expect(flat(<SeriesCover id="없는시리즈" a={{ title: 'x' }} />)).toBe('')
})
