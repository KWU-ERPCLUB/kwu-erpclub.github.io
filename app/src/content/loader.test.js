import { expect, test } from 'vitest'
import { loadContent } from './loader.js'

test('기사 로드 — 예시 기고가 보인다', () => {
  const list = loadContent('기사')
  expect(list.length).toBeGreaterThanOrEqual(1)
  expect(list[0]).toHaveProperty('title')
  expect(list[0]).toHaveProperty('slug')
  expect(list[0].body).toContain('에이전트')
})
test('없는 종류는 빈 배열 — 실콘텐츠 폴더에 결합하지 않음', () => {
  expect(loadContent('없는종류')).toEqual([])
})
test('`_` 시작 파일(템플릿)은 게재 제외 — _template 슬러그 없음', () => {
  const list = loadContent('기사')
  expect(list.some((a) => a.slug === '_template')).toBe(false)
  expect(list.some((a) => (a.file || '').startsWith('_'))).toBe(false)
})
