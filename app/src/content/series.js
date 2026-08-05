// 인사이트 「시리즈」 레지스트리 — 정기 연재물(주간·분기 등)의 단일원천 (오너 확정 2026-08-05).
// 왜: 주간 트렌드가 성격 '트렌드' 태그에 계속 쌓이면 목록이 회차로 뒤덮인다.
//     시리즈로 묶어 ①목록 상단 고정 밴드 ②전용 아카이브(?series=<id>)로만 노출하고, 메인 그리드에서는 뺀다.
//
// 새 시리즈 추가 = 아래 배열에 레코드 1개(코드 수정 없음). 필드 5개 전부 필수.
//   id      : ascii 소문자 — frontmatter `시리즈` 값 · URL ?series= 값 · DB articles.시리즈 값
//   표시명  : 화면에 나오는 이름
//   설명    : 1줄(밴드·아카이브 머리에 표기)
//   주기    : 발행 리듬 1구(상세 히어로 캡션에 자동 삽입)
//   커버컴포넌트: 고정 커버를 그리는 **컴포넌트 id**(pages/SeriesCover.jsx의 레지스트리 키).
//             이 시리즈 글의 목록 썸네일·상세 히어로를 전부 같은 커버로 통일(브랜드 인식).
//             정적 svg 파일이 아닌 컴포넌트인 이유 = 커버에 회차(주차) 텍스트가 들어가기 때문(2026-08-05 v3).
//             ⚠ 이 파일은 node 스크립트(sync·validate)도 import 하므로 JSX를 두지 않는다 — id 문자열만.
//   슬러그키: 슬러그 자동 인식 키워드(선택) — frontmatter에 `시리즈`가 없어도 슬러그에 이 문자열이 있으면 귀속.
//             주간 트렌드 자동 발행 루틴을 고치지 않고 호환시키기 위한 장치.
export const SERIES = [
  {
    id: 'weekly',
    표시명: '주간 AI 트렌드',
    설명: '매주 월요일, 지난 한 주 AI 소식 요약',
    주기: '매주 월요일',
    커버컴포넌트: 'weekly',
    슬러그키: ['weekly-trend'],
  },
]

export const SERIES_IDS = SERIES.map((s) => s.id)

export function seriesById(id) {
  if (typeof id !== 'string' || !id) return null
  return SERIES.find((s) => s.id === id) || null
}

// 슬러그 자동 인식 — 등록된 슬러그키를 포함하면 그 시리즈 id. 없으면 null.
export function seriesFromSlug(slug) {
  const s = typeof slug === 'string' ? slug : ''
  if (!s) return null
  for (const rec of SERIES) {
    for (const key of rec.슬러그키 || []) if (s.includes(key)) return rec.id
  }
  return null
}

// 귀속 판정 — frontmatter `시리즈`(enum 안일 때) 우선, 없으면 슬러그 자동 인식.
// 입력 = 기사 객체(로더·DB 매핑 결과) 또는 { ...frontmatter, slug }.
export function seriesIdOf(a) {
  if (!a) return null
  const raw = typeof a['시리즈'] === 'string' ? a['시리즈'].trim() : ''
  if (raw && seriesById(raw)) return raw
  return seriesFromSlug(a.slug || a.file || '')
}

export function seriesOf(a) {
  return seriesById(seriesIdOf(a))
}

// 상세 히어로 캡션 — 시리즈 글은 개별 `이미지설명` 없이 이 문장이 자동으로 붙는다.
export function seriesCaption(s) {
  if (!s) return ''
  return `${s.표시명} — ${s.주기} 발행하는 시리즈`
}
