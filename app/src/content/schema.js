// SPEC §5 데이터 계약 v2 — 이 파일이 검증 규칙의 유일 원천(검증기 CLI·앱 로더 공용).
// 기사 분류(2026-07-23 개편): 성격(단일·필수) × 주제(단일·필수) + 지금써먹기(boolean·선택·기본 false). 구 영역(경영기능) 축 폐지.
export const NATURES = ['뉴스·동향', '심층 분석', '활용법·튜토리얼', '도구·프롬프트'] // 성격(글 종류·단일)
export const TOPICS = ['에이전트', '모델·플랫폼', '워크플로·자동화', '거버넌스·리스크', '시장·생태계'] // 주제(AI 주제·단일)
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
    // 성격·주제 = 문자열 단일값(배열 금지)·각 1개 필수·enum
    const nature = data['성격']
    if (nature === undefined || nature === null || nature === '') errs.push('성격 필수(1개)')
    else if (typeof nature !== 'string' || !NATURES.includes(nature)) errs.push(`성격 enum 밖: ${nature}`)
    const topic = data['주제']
    if (topic === undefined || topic === null || topic === '') errs.push('주제 필수(1개)')
    else if (typeof topic !== 'string' || !TOPICS.includes(topic)) errs.push(`주제 enum 밖: ${topic}`)
    // 지금써먹기 = 선택(기본 false) — 있으면 boolean만 허용
    if ('지금써먹기' in data && typeof data['지금써먹기'] !== 'boolean') errs.push('지금써먹기는 boolean(true/false)만 허용')
    // 이미지 = 선택(썸네일 경로·URL) — 있으면 비어있지 않은 문자열만 허용
    if ('이미지' in data && (typeof data['이미지'] !== 'string' || data['이미지'].trim() === '')) errs.push('이미지는 비어있지 않은 문자열(경로·URL)만 허용')
    // 고정 = 선택(허브 뷰 상단 핀) — 있으면 boolean만 허용
    if ('고정' in data && typeof data['고정'] !== 'boolean') errs.push('고정은 boolean(true/false)만 허용')
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
