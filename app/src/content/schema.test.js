import { expect, test } from 'vitest'
import { validateEntry } from './schema.js'

const good = { title: 'AI 지형', author: 'bapzzi', date: '2026-07-22', source_url: 'https://hai.stanford.edu/x', source_name: 'Stanford HAI', tags: ['에이전트'] }

test('정상 기사 통과', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-ai-trend.md', good)).toEqual([])
})
test('필수 필드 결측 검출', () => {
  const { source_url, ...rest } = good
  expect(validateEntry('기사', '2026-07-22-bapzzi-ai-trend.md', rest).length).toBeGreaterThan(0)
})
test('tags enum 밖 검출', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-x.md', { ...good, tags: ['블록체인'] }).some((e) => e.includes('블록체인'))).toBe(true)
})
test('파일명-frontmatter 불일치 검출(date·author 프리픽스)', () => {
  expect(validateEntry('기사', '2026-01-01-other-x.md', good).length).toBeGreaterThan(0)
})
test('세미나: 회차 숫자·유형 enum', () => {
  expect(validateEntry('세미나', '2026-09-01-bapzzi-s1.md', { title: '1회', author: 'bapzzi', date: '2026-09-01', 회차: '1', 유형: '인지' })).toEqual([])
  expect(validateEntry('세미나', '2026-09-01-bapzzi-s1.md', { title: '1회', author: 'bapzzi', date: '2026-09-01', 회차: '일', 유형: '토론' }).length).toBe(2)
})
test('실습: 연계회차·tools 필수', () => {
  expect(validateEntry('실습', '2026-09-08-bapzzi-lab1.md', { title: '랩1', author: 'bapzzi', date: '2026-09-08', 연계회차: '2', tools: ['Copilot Studio'] })).toEqual([])
})
test('frontmatter 자체 없음(data null)', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-x.md', null)).toEqual(['frontmatter 없음'])
})
