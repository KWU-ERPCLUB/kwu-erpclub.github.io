import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Articles, { excerpt, filterArticles } from './Articles.jsx'

test('목록 렌더 — 예시 기고 제목 + 태그 칩 필터(전체 + 전 태그)', () => {
  const html = renderToString(<Articles />)
  expect(html).toContain('2026 AI 트렌드')
  for (const chip of ['전체', '에이전트', '채용시장', '거버넌스', '도구', '기타']) {
    expect(html).toContain(chip)
  }
})

test('태그 필터 동작 — 선택 태그를 가진 항목만 남긴다', () => {
  const all = [
    { slug: 'a', tags: ['에이전트'] },
    { slug: 'b', tags: ['채용시장'] },
    { slug: 'c', tags: ['에이전트', '도구'] },
  ]
  expect(filterArticles(all, null).map((x) => x.slug)).toEqual(['a', 'b', 'c'])
  expect(filterArticles(all, '에이전트').map((x) => x.slug)).toEqual(['a', 'c'])
  expect(filterArticles(all, '거버넌스')).toEqual([])
})

test('요약 발췌 — 마크다운 기호 제거 + 길이 제한', () => {
  const out = excerpt('**굵게** 그리고 [링크](http://x) 텍스트', 100)
  expect(out).not.toContain('**')
  expect(out).not.toContain('](')
  expect(out).toContain('링크')
  expect(excerpt('가'.repeat(200), 96).endsWith('…')).toBe(true)
})
