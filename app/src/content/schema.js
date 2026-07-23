// SPEC §5 데이터 계약 v2 — 이 파일이 검증 규칙의 유일 원천(검증기 CLI·앱 로더 공용).
// 태그 2축(2026-07-23): 용도(주·필수 1~2) + 기술(보조·선택 0~2). 구 tags 폐지. 실습 종류 폐지(세미나로 흡수).
export const USES = ['업무자동화', '분석·리서치', '기획·문서', '트렌드·시장', '기타'] // 용도(주)
export const TECHS = ['에이전트', '도구', '거버넌스'] // 기술(보조)
export const SEMINAR_TYPES = ['인지', '실습']
export const KINDS = ['기사', '세미나']
// 실습 세미나 본문 필수 헤딩(Carpentries 3블록 이식) — 전부 존재해야 통과
export const LAB_HEADINGS = ['준비', '진행', '재현 가이드']

// frontmatter 값을 배열로 정규화(파서가 단일값은 문자열, [a,b]는 배열로 준다)
function asArray(v) {
  if (Array.isArray(v)) return v
  if (v === undefined || v === null || v === '') return []
  return [v]
}

// body에 `## <heading>` 줄이 존재하는가 (정확한 헤딩 텍스트, 후행 공백만 허용)
function hasHeading(body, heading) {
  const esc = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^##\\s+${esc}\\s*$`, 'm').test(body || '')
}

// kind·filename·frontmatter(data)·body를 §5 계약으로 검사. body는 세미나 실습 헤딩 검증에만 사용.
export function validateEntry(kind, filename, data, body = '') {
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
    const uses = asArray(data['용도'])
    if (uses.length < 1 || uses.length > 2) errs.push('용도는 1~2개 필수')
    for (const u of uses) if (!USES.includes(u)) errs.push(`용도 enum 밖: ${u}`)
    const techs = asArray(data['기술'])
    if (techs.length > 2) errs.push('기술은 최대 2개')
    for (const t of techs) if (!TECHS.includes(t)) errs.push(`기술 enum 밖: ${t}`)
  } else if (kind === '세미나') {
    if (!/^\d+$/.test(data['회차'] || '')) errs.push('회차는 숫자여야 함')
    if (!SEMINAR_TYPES.includes(data['유형'])) errs.push(`유형 enum 밖: ${data['유형']}`)
    // §5-3: 유형=실습 → 3블록 헤딩 전부 존재
    if (data['유형'] === '실습') {
      for (const h of LAB_HEADINGS) if (!hasHeading(body, h)) errs.push(`실습 세미나 필수 헤딩 결측: ## ${h}`)
    }
  }
  return errs
}
