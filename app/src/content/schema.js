// SPEC §5 데이터 계약 — 이 파일이 검증 규칙의 유일 원천(검증기 CLI·앱 공용).
export const TAGS = ['에이전트', '채용시장', '거버넌스', '도구', '기타']
export const SEMINAR_TYPES = ['인지', '실습']
export const KINDS = ['기사', '세미나', '실습']

export function validateEntry(kind, filename, data) {
  if (!data) return ['frontmatter 없음']
  const errs = []
  for (const k of ['title', 'author', 'date']) if (!data[k]) errs.push(`필수 필드 결측: ${k}`)
  if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) errs.push('date 형식(YYYY-MM-DD) 위반')
  if (data.date && data.author) {
    const prefix = `${data.date}-${data.author}-`
    if (!filename.startsWith(prefix) || !filename.endsWith('.md') || filename.length <= prefix.length + 3)
      errs.push(`파일명 패턴 위반: ${prefix}<슬러그>.md 여야 함 (실제: ${filename})`)
  }
  if (kind === '기사') {
    for (const k of ['source_url', 'source_name']) if (!data[k]) errs.push(`필수 필드 결측: ${k}`)
    const tags = Array.isArray(data.tags) ? data.tags : []
    if (!tags.length) errs.push('필수 필드 결측: tags')
    for (const t of tags) if (!TAGS.includes(t)) errs.push(`tags enum 밖: ${t}`)
  } else if (kind === '세미나') {
    if (!/^\d+$/.test(data['회차'] || '')) errs.push('회차는 숫자여야 함')
    if (!SEMINAR_TYPES.includes(data['유형'])) errs.push(`유형 enum 밖: ${data['유형']}`)
  } else if (kind === '실습') {
    if (!/^\d+$/.test(data['연계회차'] || '')) errs.push('연계회차는 숫자여야 함')
    if (!Array.isArray(data.tools) || !data.tools.length) errs.push('필수 필드 결측: tools')
  }
  return errs
}
