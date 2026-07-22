import { expect, test } from 'vitest'
import { parseFrontmatter } from './frontmatter.js'

const ok = `---\ntitle: 제목\nauthor: bapzzi\ndate: 2026-07-22\ntags: [에이전트, 도구]\n---\n본문입니다.`

test('정상 frontmatter 파싱', () => {
  const { data, body } = parseFrontmatter(ok)
  expect(data.title).toBe('제목')
  expect(data.tags).toEqual(['에이전트', '도구'])
  expect(body.trim()).toBe('본문입니다.')
})

test('frontmatter 없으면 data null', () => {
  expect(parseFrontmatter('그냥 본문').data).toBeNull()
})

test('CRLF 파일도 파싱', () => {
  const { data } = parseFrontmatter(ok.replaceAll('\n', '\r\n'))
  expect(data.title).toBe('제목')
})

test('키 없는 줄이 섞이면 data null', () => {
  expect(parseFrontmatter('---\ntitle 콜론없음\n---\n본문').data).toBeNull()
})
