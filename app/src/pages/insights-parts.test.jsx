// 카드 배지 3종(2026-08-07 오너) — 작성자 3글자 검은 타원 · 미열람 N · 좋아요·북마크 수.
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import { ArticleRow, AuthorBadge, CountBadges } from './insights-parts.jsx'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')
const A = { slug: 's1', title: '제목', date: '2026-08-05', author: '신해원', 설명: '설명', 성격: '심층 분석' }

test('작성자 배지 = 이름 3글자(검은 타원) — 없으면 미렌더', () => {
  expect(flat(<AuthorBadge a={A} />)).toContain('art-author')
  expect(flat(<AuthorBadge a={A} />)).toContain('신해원')
  expect(flat(<AuthorBadge a={{ author: 'bapzzi다섯글자' }} />)).toContain('>bap<')   // 3글자 절단
  expect(flat(<AuthorBadge a={{}} />)).toBe('')
})

test('좋아요·북마크 수 = 우하단 수치, 0/0 = 생략', () => {
  const html = flat(<CountBadges counts={{ 좋아요수: 3, 북마크수: 1 }} />)
  expect(html).toContain('art-counts')
  expect(html).toContain('♥ 3')
  expect(html).toContain('🔖 1')
  expect(flat(<CountBadges counts={{ 좋아요수: 0, 북마크수: 0 }} />)).toBe('')
  expect(flat(<CountBadges counts={null} />)).toBe('')
})

test('카드 = fresh면 우상단 N 배지 + 메타 줄(날짜·작성자·수치)', () => {
  const on = flat(<ArticleRow a={A} onOpen={() => {}} counts={{ 좋아요수: 2, 북마크수: 0 }} fresh />)
  expect(on).toContain('art-new')
  expect(on).toContain('art-card-meta')
  expect(on).toContain('2026-08-05')
  expect(on).toContain('신해원')
  expect(on).toContain('♥ 2')
  const off = flat(<ArticleRow a={A} onOpen={() => {}} />)
  expect(off).not.toContain('art-new')
})
