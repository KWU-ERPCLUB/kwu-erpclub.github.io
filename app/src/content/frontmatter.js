// 콘텐츠 계약(SPEC §5)의 frontmatter 전용 미니 파서 — flat key:value + [a, b] 배열 + true/false 불리언(의존성 0).
export function parseFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw)
  if (!m) return { data: null, body: raw }
  const data = {}
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim()) continue
    const i = line.indexOf(':')
    if (i < 1) return { data: null, body: raw }
    const key = line.slice(0, i).trim()
    let val = line.slice(i + 1).trim()
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean)
    } else if (val === 'true' || val === 'false') {
      val = val === 'true' // 불리언 필드(예: 지금써먹기) 코어싱
    }
    data[key] = val
  }
  return { data, body: m[2] }
}
