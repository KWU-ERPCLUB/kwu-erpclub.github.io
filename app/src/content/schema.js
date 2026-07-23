// SPEC §5 데이터 계약 v2 — 이 파일이 검증 규칙의 유일 원천(검증기 CLI·앱 로더 공용).
// 기사 분류(2026-07-23 개편): 성격(단일·필수) × 영역(단일·필수) + 지금써먹기(boolean·선택·기본 false). 구 용도/기술 2축 폐지.
export const NATURES = ['뉴스·동향', '심층 분석', '활용법·튜토리얼', '도구·프롬프트'] // 성격(글 종류·단일)
export const AREAS = ['마케팅·영업', '기획·전략', '고객지원·운영', '문서·지식관리', '데이터·분석', '개발·IT', 'AI 거버넌스·리스크'] // 영역(업무·단일)
export const SEMINAR_TYPES = ['인지', '실습']
export const KINDS = ['기사', '세미나']
// 실습 세미나 본문 필수 헤딩(Carpentries 3블록 이식) — 전부 존재해야 통과
export const LAB_HEADINGS = ['준비', '진행', '재현 가이드']

// 게재·검증 대상 파일 판별 — `_` 시작 = 템플릿·초안(예: _template.md) → 로더 글롭·검증기 스캔 제외.
// 로더·검증기 공용(계약 단일원천). `.md` 아닌 것도 제외.
export function isContentFile(filename) {
  return typeof filename === 'string' && filename.endsWith('.md') && !filename.startsWith('_')
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
    // 성격·영역 = 문자열 단일값(배열 금지)·각 1개 필수·enum
    const nature = data['성격']
    if (nature === undefined || nature === null || nature === '') errs.push('성격 필수(1개)')
    else if (typeof nature !== 'string' || !NATURES.includes(nature)) errs.push(`성격 enum 밖: ${nature}`)
    const area = data['영역']
    if (area === undefined || area === null || area === '') errs.push('영역 필수(1개)')
    else if (typeof area !== 'string' || !AREAS.includes(area)) errs.push(`영역 enum 밖: ${area}`)
    // 지금써먹기 = 선택(기본 false) — 있으면 boolean만 허용
    if ('지금써먹기' in data && typeof data['지금써먹기'] !== 'boolean') errs.push('지금써먹기는 boolean(true/false)만 허용')
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
