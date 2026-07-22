import { parseFrontmatter } from './frontmatter.js'
// 빌드타임 글롭 — content/가 리포에 커밋된 것만 실림(런타임 fetch 없음, 정적 계약)
const modules = import.meta.glob('/content/**/*.md', { query: '?raw', import: 'default', eager: true })

export function loadContent(kind) {
  const out = []
  for (const [path, raw] of Object.entries(modules)) {
    if (!path.includes(`/content/${kind}/`)) continue
    const file = path.split('/').pop()
    const { data, body } = parseFrontmatter(raw)
    if (!data) continue
    out.push({ ...data, file, slug: file.replace(/\.md$/, ''), body })
  }
  return out.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}
