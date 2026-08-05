import { parseFrontmatter } from './frontmatter.js'
import { isContentFile } from './schema.js'
import { seriesIdOf } from './series.js'
// 빌드타임 글롭 — content/가 리포에 커밋된 것만 실림(런타임 fetch 없음, 정적 계약)
const modules = import.meta.glob('/content/**/*.md', { query: '?raw', import: 'default', eager: true })

export function loadContent(kind) {
  const out = []
  for (const [path, raw] of Object.entries(modules)) {
    if (!path.includes(`/content/${kind}/`)) continue
    const file = path.split('/').pop()
    if (!isContentFile(file)) continue // `_` 시작(템플릿·초안) 제외
    const { data, body } = parseFrontmatter(raw)
    if (!data) continue
    const slug = file.replace(/\.md$/, '')
    // 시리즈 정규화 — frontmatter `시리즈` 우선, 없으면 슬러그 자동 인식(DB 경로 fromDbRow와 같은 규칙).
    // 이 한 줄 덕에 화면 로직은 a['시리즈']만 읽으면 된다.
    out.push({ ...data, file, slug, body, '시리즈': seriesIdOf({ ...data, slug }) || undefined })
  }
  return out.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}
