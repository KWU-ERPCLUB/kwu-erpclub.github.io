import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Articles, { excerpt, filterArticles } from './Articles.jsx'

test('목록 렌더 — 예시 기고 제목 + 2축 칩(용도 5종·기술 3종) + 검색박스', () => {
  const html = renderToString(<Articles />)
  expect(html).toContain('2026 AI 트렌드')
  for (const chip of ['업무자동화', '분석·리서치', '기획·문서', '트렌드·시장', '기타']) {
    expect(html).toContain(chip) // 용도 축
  }
  for (const chip of ['에이전트', '도구', '거버넌스']) {
    expect(html).toContain(chip) // 기술 축
  }
  expect(html).toContain('placeholder="제목·요약 검색"') // 검색박스
})

test('2축 필터 — 용도·기술 AND 결합', () => {
  const all = [
    { slug: 'a', 용도: ['업무자동화'], 기술: ['에이전트'] },
    { slug: 'b', 용도: ['트렌드·시장'], 기술: ['도구'] },
    { slug: 'c', 용도: ['업무자동화'], 기술: ['도구'] },
  ]
  expect(filterArticles(all, {}).map((x) => x.slug)).toEqual(['a', 'b', 'c'])
  expect(filterArticles(all, { use: '업무자동화' }).map((x) => x.slug)).toEqual(['a', 'c'])
  expect(filterArticles(all, { tech: '도구' }).map((x) => x.slug)).toEqual(['b', 'c'])
  expect(filterArticles(all, { use: '업무자동화', tech: '도구' }).map((x) => x.slug)).toEqual(['c'])
})

test('검색 — 제목·요약 부분일치 + 필터 AND', () => {
  const all = [
    { slug: 'a', title: '에이전트 실전', body: '업무 자동화 사례', 용도: ['업무자동화'] },
    { slug: 'b', title: '리서치 요약', body: '시장 동향 정리', 용도: ['트렌드·시장'] },
  ]
  expect(filterArticles(all, { q: '에이전트' }).map((x) => x.slug)).toEqual(['a'])
  expect(filterArticles(all, { q: '동향' }).map((x) => x.slug)).toEqual(['b']) // 본문 매치
  expect(filterArticles(all, { q: '없는말' })).toEqual([])
  expect(filterArticles(all, { use: '업무자동화', q: '리서치' })).toEqual([]) // 축·검색 AND
})

test('요약 발췌 — 마크다운 기호 제거 + 길이 제한', () => {
  const out = excerpt('**굵게** 그리고 [링크](http://x) 텍스트', 100)
  expect(out).not.toContain('**')
  expect(out).not.toContain('](')
  expect(out).toContain('링크')
  expect(excerpt('가'.repeat(200), 96).endsWith('…')).toBe(true)
})
