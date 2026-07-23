import { expect, test } from 'vitest'
import { buildRss, escapeXml, toRfc822 } from '../../scripts/build-rss.mjs'

const items = [
  { title: '첫 기사 & 리서치', date: '2026-07-22', author: 'bapzzi', slug: '2026-07-22-bapzzi-x', body: '본문 <요약>' },
  { title: '둘째', date: '2026-07-10', author: 'bapzzi', slug: '2026-07-10-bapzzi-y', body: '내용' },
]

test('RSS 2.0 구조 — channel·item·필수 태그', () => {
  const xml = buildRss(items)
  expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
  expect(xml).toContain('<rss version="2.0">')
  expect(xml).toContain('<channel>')
  expect((xml.match(/<item>/g) || []).length).toBe(2)
  expect(xml).toContain('<title>둘째</title>')
  expect(xml).toContain('<link>https://kwu-erpclub.github.io/articles/?p=2026-07-22-bapzzi-x</link>')
  expect(xml).toContain('<pubDate>')
})

test('XML 특수문자 이스케이프 — < & > 미노출', () => {
  const xml = buildRss(items)
  expect(escapeXml('a & b <c>')).toBe('a &amp; b &lt;c&gt;')
  expect(xml).toContain('첫 기사 &amp; 리서치') // title 이스케이프
  expect(xml).not.toContain('본문 <요약>') // description 이스케이프
})

test('RFC-822 날짜 변환', () => {
  expect(toRfc822('2026-07-22')).toMatch(/22 Jul 2026/)
  expect(toRfc822('bad')).toBe('')
})

test('빈 목록도 유효 채널', () => {
  const xml = buildRss([])
  expect(xml).toContain('<channel>')
  expect(xml).not.toContain('<item>')
})
