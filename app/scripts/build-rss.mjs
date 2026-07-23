// content/기사 → dist/rss.xml (RSS 2.0 전체 피드, SPEC CR5). build 이후 실행(dist 존재 전제).
// buildRss/escapeXml는 테스트가 소비(구조 검증) — 파일 쓰기는 CLI 실행 시에만.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseFrontmatter } from '../src/content/frontmatter.js'

export const SITE_URL = 'https://kwu-erpclub.github.io'
const FEED_TITLE = '광운대학교 ERP연구회 — 기사'
const FEED_DESC = '스터디원이 요약·기고한 이슈 스캔 아카이브'

export function escapeXml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// YYYY-MM-DD → RFC-822 (UTC 정오 기준 — 타임존 롤오버 방지)
export function toRfc822(date) {
  const d = new Date(`${date}T12:00:00Z`)
  return Number.isNaN(d.getTime()) ? '' : d.toUTCString()
}

// articles = [{ title, date, author, source_name, slug, body }] → RSS 2.0 문자열
export function buildRss(articles) {
  const items = articles.map((a) => {
    const link = `${SITE_URL}/articles/?p=${encodeURIComponent(a.slug)}`
    const desc = (a.body || '').replace(/\s+/g, ' ').trim().slice(0, 280)
    return [
      '    <item>',
      `      <title>${escapeXml(a.title)}</title>`,
      `      <link>${escapeXml(link)}</link>`,
      `      <guid isPermaLink="false">${escapeXml(a.slug)}</guid>`,
      a.date ? `      <pubDate>${escapeXml(toRfc822(a.date))}</pubDate>` : '',
      a.author ? `      <author>${escapeXml(a.author)}</author>` : '',
      `      <description>${escapeXml(desc)}</description>`,
      '    </item>',
    ].filter(Boolean).join('\n')
  }).join('\n')
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    `    <title>${escapeXml(FEED_TITLE)}</title>`,
    `    <link>${SITE_URL}/articles/</link>`,
    `    <description>${escapeXml(FEED_DESC)}</description>`,
    '    <language>ko</language>',
    items,
    '  </channel>',
    '</rss>',
    '',
  ].filter((l) => l !== '').join('\n')
}

function loadArticles() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', '기사')
  let files = []
  try { files = readdirSync(root).filter((f) => f.endsWith('.md')) } catch { return [] }
  return files.map((f) => {
    const { data, body } = parseFrontmatter(readFileSync(join(root, f), 'utf8'))
    return { ...data, slug: f.replace(/\.md$/, ''), body }
  }).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

// CLI 실행 시에만 파일 쓰기(테스트 import 시엔 건너뜀)
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'rss.xml')
  writeFileSync(out, buildRss(loadArticles()), 'utf8')
  console.log(`RSS written: ${out}`)
}
