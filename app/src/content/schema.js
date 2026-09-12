// SPEC §5 데이터 계약 v2 — 이 파일이 검증 규칙의 유일 원천(검증기 CLI·앱 로더 공용).
// 시리즈 enum은 레지스트리(content/series.js)가 원천 — 여기서는 그 값만 참조한다.
// 기사 분류(2026-07-23 개편): 성격(단일·필수) × 주제(단일·필수) + 지금써먹기(boolean·선택·기본 false). 구 영역(경영기능) 축 폐지.
import { SERIES_IDS } from './series.js'

export const NATURES = ['트렌드', '심층 분석'] // 성격(글 종류·단일) — 구 '뉴스·동향' = '트렌드'로 개명(2026-07-25 오너). 2026-08-25 오너: 4값→2값 — 인사이트 = 정보성 전용. 실습·도구 사용법은 세미나 특강으로 분리(도감 트랙 폐기, roadmap §95)
export const TOPICS = ['에이전트', '모델·플랫폼', '워크플로·자동화', '거버넌스·리스크', '시장·생태계', '크리에이티브·미디어'] // 주제(AI 주제·단일) — 2026-09-11 개편으로 **기사에서 폐지**(레거시 통과·신규 금지). 세미나 `주제` 필터는 계속 이 값을 쓴다.
// ── 2026-09-11 인사이트 개편(spec = erp-club/docs/specs/2026-09-11-인사이트-개편.md) ──
// 축 = 기사 분류의 새 단일 축(주제 대체). 관문 ⓪ "AI가 소재의 중심 + 독자(경영학부 비개발자) 접점"이 앞선다 — 이름에 AI를 박은 이유.
export const AXES = ['AI활용', 'AI×취업', 'AI×MIS']
// 새 규칙(축 필수·주제 금지·이미지 필수·후보출처 잠금·분량 상한)이 적용되는 첫 게재일. 그 전 글 = 레거시(통과).
export const NEW_RULES_FROM = '2026-09-12'
// 분량 상한(공백 제외 글자 수) — 오너 2026-09-11: 요약 기고인데 읽는 것도 벅차다(심층 중앙값 5,192자였다).
export const BODY_LIMIT = { '심층 분석': 3000, '트렌드': 2500 }
// 심층 깊이 게이트(오너 2026-09-12 — "깊이를 매번 잡아 줄 수 없다, 룰로"): 칸 6개 + 인사이트 절을 전부 채워야 발행.
//   심층 = 주간이 답 못 한 질문에 팩트로 답하고, 독자가 가져갈 인사이트를 준다(행동 지시 절은 두지 않는다 — 오너).
export const DEEP_MIN = 1800                                    // 하한(공백 제외) — 요약을 늘려 쓴 글 차단
export const DEEP_HEADINGS = ['무슨 일', '실물', '앞선 사례', '판정 기준', '확인 안 된 것', 'SO WHAT'] // `## <키>`로 시작(뒤에 부제 허용)
export const DEEP_MIN_SOURCES = 5                               // ::: 출처 행 수 하한
export const DEEP_QUESTIONS = 3                                 // ::: 질문 행 수(정확히)
// 후보출처 = 심층이 어느 주간 보고의 몇 번 후보인지. `요청` = 스터디원 요청 소재(관문 판정만).
export const CANDIDATE_REF = /^weekly-trend-w\d{2}#\d+$/
export const CANDIDATE_GATES = 7 // ⓪~⑥ (⑥ = 심층 6칸을 채울 근거가 보이는가 — 2026-09-12)

export const isNewRules = (data) => Boolean(data && data.date && data.date >= NEW_RULES_FROM && data['보관'] !== true)
// 공개 목록 대상 = 보관 아님. 목록·홈·RSS·건수가 공유(북마크는 예외 — 사용자 자산).
export const isPublicArticle = (a) => Boolean(a) && a['보관'] !== true
// `::: <이름>` 블록의 비어있지 않은 행들(출처·질문 수 세기)
export function blockRows(body, name) {
  const m = new RegExp(`^:{3,}\\s*${name}\\s*$([\\s\\S]*?)^:{3,}\\s*$`, 'm').exec(String(body || ''))
  if (!m) return []
  return m[1].split('\n').map((l) => l.trim()).filter(Boolean)
}

// 공백 제외 글자 수(분량 상한 판정) — 독자가 읽는 글자만 센다: `::: 출처` 블록·링크 URL·표 구분선·마크다운 기호는 제외.
export function bodyLength(body) {
  return String(body || '')
    .replace(/^:{3,}\s*출처[\s\S]*?^:{3,}\s*$/m, '')   // 출처 블록
    .replace(/\]\([^)]*\)/g, ']')                        // [텍스트](url) → [텍스트]
    .replace(/https?:\/\/\S+/g, '')                     // 남은 URL
    .replace(/^\|[\s|:-]+\|\s*$/gm, '')                // 표 구분선
    .replace(/[|#*`>\[\]:-]/g, '')                        // 마크다운 기호
    .replace(/\s/g, '').length
}
export const SEMINAR_TYPES = ['인지', '실습']
// 프로젝트 상태(단일·필수) — DPM 카드 상태 칩. 2026-07-24 콘텐츠화.
export const PROJECT_STATUSES = ['운영 중', '진행 중', '보관']
export const KINDS = ['기사', '세미나', '프로젝트']
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
    const fresh = isNewRules(data)
    // 보관 = 선택 boolean(2026-09-11) — true = 목록·홈·RSS·건수 제외, URL 유지
    if ('보관' in data && typeof data['보관'] !== 'boolean') errs.push('보관은 boolean(true/false)만 허용')
    // 축 = 새 규칙 글 필수·enum. 레거시 글은 선택(있으면 enum)
    const axis = data['축']
    if (axis !== undefined && axis !== null && axis !== '' && (typeof axis !== 'string' || !AXES.includes(axis))) errs.push(`축 enum 밖: ${axis} (허용: ${AXES.join(', ')})`)
    else if (fresh && !axis) errs.push(`축 필수(1개 — ${AXES.join('/')})`)
    // 주제 = 레거시만(있으면 enum). 새 규칙 글에 있으면 FAIL(축으로 대체)
    const topic = data['주제']
    if (topic !== undefined && topic !== null && topic !== '') {
      if (typeof topic !== 'string' || !TOPICS.includes(topic)) errs.push(`주제 enum 밖: ${topic}`)
      if (fresh) errs.push('주제는 폐지됨(2026-09-11) — 축으로 대체')
    } else if (!fresh && !axis) errs.push('주제 또는 축 필수(1개)')
    // 후보출처 = 새 규칙 심층 필수(주간 보고 후보 표 잠금 — 교차 검사는 validateCandidateLock)
    const ref = data['후보출처']
    if (ref !== undefined && ref !== null && (typeof ref !== 'string' || !(ref === '요청' || CANDIDATE_REF.test(ref)))) errs.push('후보출처 형식: weekly-trend-wNN#k 또는 요청')
    if (fresh && nature === '심층 분석' && !ref) errs.push('후보출처 필수(심층 = 주간 보고 후보 표 경유)')
    // 심층후보 = 주간 보고 전용(선택) — 행마다 "k | 소재 | 축 | TTTTTT | n" 서식
    if ('심층후보' in data) {
      const rows = data['심층후보']
      if (!Array.isArray(rows) || rows.length !== parseCandidateTable(data).length) errs.push('심층후보 행 서식: "k | 소재 | 축 | ⓪~⑥ T/F 7자 | 링크수"')
    }
    // 이미지·이미지설명 = 새 규칙 글 필수(실제 관련 이미지 — 오너 2026-09-11)
    if (fresh && !(typeof data['이미지'] === 'string' && data['이미지'].trim())) errs.push('이미지 필수(소재와 실제 관련된 이미지)')
    if (fresh && !(typeof data['이미지설명'] === 'string' && data['이미지설명'].trim())) errs.push('이미지설명 필수(1줄)')
    // 분량 상한 = 새 규칙 글(공백 제외)
    if (fresh && nature && BODY_LIMIT[nature] !== undefined) {
      const n = bodyLength(body)
      if (n > BODY_LIMIT[nature]) errs.push(`분량 초과: ${n}자 > ${BODY_LIMIT[nature]}자(${nature})`)
      if (nature === '심층 분석' && n < DEEP_MIN) errs.push(`심층 분량 미달: ${n}자 < ${DEEP_MIN}자`)
    }
    // 심층 구조 게이트(새 규칙) — 질문 3 · 필수 헤딩 6 · 출처 5+
    if (fresh && nature === '심층 분석') {
      for (const h of DEEP_HEADINGS) if (!new RegExp(`^##\\s+${h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm').test(body || '')) errs.push(`심층 필수 절 결측: ## ${h}`)
      const q = blockRows(body, '질문')
      if (q.length !== DEEP_QUESTIONS) errs.push(`심층 「::: 질문」 = ${DEEP_QUESTIONS}줄 필요(현재 ${q.length})`)
      const s = blockRows(body, '출처')
      if (s.length < DEEP_MIN_SOURCES) errs.push(`심층 출처 ${DEEP_MIN_SOURCES}건 이상 필요(현재 ${s.length})`)
    }
    // 대시(—) 금지(새 규칙 글, 제목·본문 — 출처 블록 제외): 오너 2026-09-12 "대시를 쓰는 등 AI 특유의 톤"
    if (fresh) {
      const bodyNoSrc = String(body || '').replace(/^:{3,}\s*출처[\s\S]*?^:{3,}\s*$/m, '')
      if (/—/.test(String(data.title || '')) && nature === '심층 분석') errs.push('심층 제목에 대시(—) 금지')
      if (/—/.test(bodyNoSrc)) errs.push('본문에 대시(—) 금지(출처 블록 제외) — 문장을 나눈다')
    }
    // 지금써먹기 = 선택(기본 false) — 있으면 boolean만 허용
    if ('지금써먹기' in data && typeof data['지금써먹기'] !== 'boolean') errs.push('지금써먹기는 boolean(true/false)만 허용')
    // 시각 = 선택(게재 시각 HH:MM — 카드·상세 날짜 옆 표기, 2026-07-25 오너 지시)
    if ('시각' in data && !/^([01]\d|2[0-3]):[0-5]\d$/.test(data['시각'] || '')) errs.push('시각 형식(HH:MM) 위반')
    // 이미지 = 선택(썸네일 경로·URL) — 있으면 비어있지 않은 문자열만 허용.
    // 신규 기고는 내용과 실제 관련된 이미지 필수(운영 규칙 = CONTRIBUTING.md). 계약은 선택 유지 = 레거시 통과용.
    if ('이미지' in data && (typeof data['이미지'] !== 'string' || data['이미지'].trim() === '')) errs.push('이미지는 비어있지 않은 문자열(경로·URL)만 허용')
    // 이미지설명 = 선택 1줄(그 이미지가 무엇이고 기사와 무슨 관계인지 — 상세 히어로 캡션·카드 alt, 2026-08-05 오너 지시)
    if ('이미지설명' in data && (typeof data['이미지설명'] !== 'string' || data['이미지설명'].trim() === '')) errs.push('이미지설명은 비어있지 않은 문자열 1줄만 허용')
    // 시리즈 = 선택(정기 연재 귀속) — 있으면 레지스트리 id(content/series.js)만 허용.
    // 생략해도 슬러그 자동 인식(예: `weekly-trend` 포함)으로 귀속된다 — 이 검사는 오타 차단용.
    if ('시리즈' in data && (typeof data['시리즈'] !== 'string' || !SERIES_IDS.includes(data['시리즈'])))
      errs.push(`시리즈 enum 밖: ${data['시리즈']} (허용: ${SERIES_IDS.join(', ')})`)
    // 고정 = 선택(허브 뷰 상단 핀) — 있으면 boolean만 허용
    if ('고정' in data && typeof data['고정'] !== 'boolean') errs.push('고정은 boolean(true/false)만 허용')
    // 설명 = 필수 1줄(카드 표시용 핵심 설명 — 본문 발췌 대체, 2026-07-27 오너 지시)
    const desc = data['설명']
    if (desc === undefined || desc === null || desc === '') errs.push('설명 필수(1줄)')
    else if (typeof desc !== 'string' || desc.trim() === '') errs.push('설명은 비어있지 않은 문자열만 허용')
    // 태그 = 선택(카드 해시태그 — 표시 전용·필터 없음) — 문자열 1~5개 배열, '#' 없이 저장(렌더 시 부착)
    if ('태그' in data) {
      const tags = data['태그']
      if (!Array.isArray(tags) || tags.length < 1 || tags.length > 5
        || tags.some((t) => typeof t !== 'string' || t.trim() === '' || t.includes('#')))
        errs.push('태그는 # 없는 문자열 1~5개 배열만 허용')
    }
  } else if (kind === '세미나') {
    // 특강 = 선택(boolean) — true = 정규 차시 밖 단발 자료(2026-08-15 오너: 차시 연속성 유지 + 새 특강 재료 편입 용이).
    // 특강은 회차를 갖지 않는다(둘 다 있으면 정합 오류) — 표시 = 번호 대신 '특강' 라벨.
    if ('특강' in data && typeof data['특강'] !== 'boolean') errs.push('특강은 boolean(true/false)만 허용')
    if (data['특강'] === true) {
      if ('회차' in data) errs.push('특강은 회차를 갖지 않음(특강 ∧ 회차 = 금지)')
    } else if (!/^\d+$/.test(data['회차'] || '')) errs.push('회차는 숫자여야 함')
    if (!SEMINAR_TYPES.includes(data['유형'])) errs.push(`유형 enum 밖: ${data['유형']}`)
    // §5-3: 유형=실습 → 3블록 헤딩 전부 존재
    if (data['유형'] === '실습') {
      for (const h of LAB_HEADINGS) if (!hasHeading(body, h)) errs.push(`실습 세미나 필수 헤딩 결측: ## ${h}`)
    }
    // 슬라이드 = 선택(사후 자료 링크) — 있으면 비어있지 않은 문자열(URL)만 허용
    if ('슬라이드' in data && (typeof data['슬라이드'] !== 'string' || data['슬라이드'].trim() === '')) errs.push('슬라이드는 비어있지 않은 문자열(URL)만 허용')
    // pdf = 선택(발표자료 PDF 경로 — 최종 산출물 2026-08-13, 생성 = scripts/export-deck-pdf.mjs 덱 인쇄) — 있으면 비어있지 않은 문자열만 허용
    if ('pdf' in data && (typeof data.pdf !== 'string' || data.pdf.trim() === '')) errs.push('pdf는 비어있지 않은 문자열(경로)만 허용')
    // 주제 = 선택(단일 — 기사 TOPICS enum 재사용, 세미나 v3 필터 축 2026-07-25)
    if ('주제' in data && (typeof data['주제'] !== 'string' || !TOPICS.includes(data['주제']))) errs.push(`주제 enum 밖: ${data['주제']}`)
    // 썸네일 = 선택(v3 겹침 카드 이미지 경로 1~2 — 없으면 카드 비표시)
    if ('썸네일' in data) {
      const th = data['썸네일']
      if (!Array.isArray(th) || th.length < 1 || th.length > 2 || th.some((t) => typeof t !== 'string' || t.trim() === ''))
        errs.push('썸네일은 비어있지 않은 문자열 1~2개 배열만 허용')
    }
    // 요점 = 선택(아코디언 요약) — 있으면 문자열 1~4개 배열만 허용
    if ('요점' in data) {
      const pts = data['요점']
      if (!Array.isArray(pts) || pts.length < 1 || pts.length > 4 || pts.some((p) => typeof p !== 'string' || p.trim() === ''))
        errs.push('요점은 비어있지 않은 문자열 1~4개 배열만 허용')
    }
    // 장소 = 선택(오프라인·온라인 위치) — 있으면 비어있지 않은 문자열만 허용
    if ('장소' in data && (typeof data['장소'] !== 'string' || data['장소'].trim() === '')) errs.push('장소는 비어있지 않은 문자열만 허용')
    // 일정미정 = 선택(boolean) — true = 개최일 미확정(예정 취급·날짜 대신 '일정 미정' 표기, 2026-07-27)
    if ('일정미정' in data && typeof data['일정미정'] !== 'boolean') errs.push('일정미정은 boolean(true/false)만 허용')
    // 공개 = 선택(boolean, 미기재 = 공개. 2026-08-15 오너) — false = 준비 중이라 대외 미노출.
    // 공개 페이지(/seminars/)에서 걸러진다. 운영진 열람 = 워크스페이스.
    if ('공개' in data && typeof data['공개'] !== 'boolean') errs.push('공개는 boolean(true/false)만 허용')
  } else if (kind === '프로젝트') {
    // 설명 = 필수 1줄(비어있지 않은 문자열)
    const desc = data['설명']
    if (desc === undefined || desc === null || desc === '') errs.push('설명 필수(1줄)')
    else if (typeof desc !== 'string' || desc.trim() === '') errs.push('설명은 비어있지 않은 문자열만 허용')
    // 상태 = 필수·enum
    const st = data['상태']
    if (st === undefined || st === null || st === '') errs.push('상태 필수(1개)')
    else if (typeof st !== 'string' || !PROJECT_STATUSES.includes(st)) errs.push(`상태 enum 밖: ${st}`)
    // 커버·github·web = 선택 — 있으면 비어있지 않은 문자열만 허용
    for (const k of ['커버', 'github', 'web']) {
      if (k in data && (typeof data[k] !== 'string' || data[k].trim() === '')) errs.push(`${k}는 비어있지 않은 문자열(경로·URL)만 허용`)
    }
  }
  return errs
}

// ── 심층 후보 표 = 주간 보고 frontmatter `심층후보` 배열(독자에게 안 보인다 — 오너 2026-09-12 "스터디원이 볼 내용이 아니다").
// 행 = "k | 소재 | 축 | ⓪~⑥(T/F 7자) | 증거 링크 수". 후보출처 잠금의 원천.
export function parseCandidateTable(data) {
  const src = data && Array.isArray(data['심층후보']) ? data['심층후보'] : []
  const out = []
  for (const row of src) {
    const cells = String(row).split('|').map((c) => c.trim())
    if (cells.length < 5 || !/^\d+$/.test(cells[0])) continue
    const flags = cells[3].toUpperCase().replace(/[^TF]/g, '')
    if (flags.length !== CANDIDATE_GATES) continue
    out.push({ no: Number(cells[0]), 소재: cells[1], 축: cells[2], gates: [...flags].map((c) => c === 'T'), links: Number(cells[4]) || 0 })
  }
  return out
}

// 후보출처 잠금 — 새 규칙 심층의 `후보출처`가 가리키는 주간 보고에 그 번호 후보가 있고 ⓪~⑤ 전부 T인가.
// entries = readEntries('기사') 결과(slug·data·body). 반환 = [{ file, errs }] (위반만).
export function validateCandidateLock(entries) {
  const weeklies = new Map()
  for (const e of entries) {
    const m = /weekly-trend-(w\d{2})/.exec(e.slug || '')
    if (m) weeklies.set(`weekly-trend-${m[1]}`, parseCandidateTable(e.data))
  }
  const out = []
  for (const e of entries) {
    const d = e.data || {}
    if (!isNewRules(d) || d['성격'] !== '심층 분석') continue
    const ref = d['후보출처']
    if (!ref || ref === '요청' || !CANDIDATE_REF.test(ref)) continue
    const [key, k] = ref.split('#')
    const rows = weeklies.get(key)
    const errs = []
    if (!rows) errs.push(`후보출처 잠금: 주간 보고 ${key} 없음`)
    else {
      const row = rows.find((r) => r.no === Number(k))
      if (!row) errs.push(`후보출처 잠금: ${key} 후보 표에 #${k} 없음`)
      else if (!row.gates.every(Boolean)) errs.push(`후보출처 잠금: ${key}#${k} 판정 ⓪~⑥ 중 F 있음`)
      else if (row.축 && d['축'] && row.축 !== d['축']) errs.push(`후보출처 잠금: 축 불일치(후보 ${row.축} ≠ 글 ${d['축']})`)
    }
    if (errs.length) out.push({ file: e.file, errs })
  }
  return out
}
