// 인사이트 썸네일·히어로 해석 — **1계층**(frontmatter `이미지`만). 순수 함수(부수효과 0) = 테스트 대상.
// 2026-09-11 개편(오너): 구 4계층 폴백(시리즈 고정 커버·본문 첫 이미지·브랜드 로고·주제 스톡·자동 타이포 커버) 전부 폐지.
//   이유 = 심층 16편이 같은 도안의 자동 커버, 주간 7편이 설계상 같은 커버라 "무슨 글인지" 구별이 안 됐다.
//   새 규칙 = 글마다 **소재와 실제 관련된 이미지** 필수(schema.js — 새 규칙 글은 없으면 validate FAIL).
//   주간 보고 = 그 주 TOP 1 소재의 실제 이미지 + 「주간 · M월 N주」 배지 오버레이(코드가 그림).
// 반환 = { kind: 'field'|'none', src, fit: 'cover', alt, badge }. 레거시 보관 글(이미지 없음)만 kind='none' — 북마크에서만 보인다.
import { seriesOf } from '../content/series.js'

// 캡션 = frontmatter `이미지설명`(1줄). 없거나 공백뿐이면 ''.
export function captionOf(a) {
  const c = a && typeof a['이미지설명'] === 'string' ? a['이미지설명'].trim() : ''
  return c
}

// 제목에서 주차 파싱 — "주간 AI 트렌드 9월 2주" → "9월 2주". 대시 유무와 무관(구 서식 보관 글도 파싱).
// 못 찾으면 null(배지에 코너명만).
export function parseWeekLabel(title) {
  const m = /(\d{1,2})\s*월\s*(\d{1,2})\s*주/.exec(String(title || ''))
  if (!m) return null
  const month = Number(m[1])
  const week = Number(m[2])
  if (!(month >= 1 && month <= 12) || !(week >= 1 && week <= 6)) return null
  return `${month}월 ${week}주`
}

// 시리즈 배지 문구 — 주간 글에만. "주간 · 9월 2주" / 주차 미상이면 "주간".
export function seriesBadge(a) {
  const s = seriesOf(a)
  if (!s) return null
  const w = parseWeekLabel(a && a.title)
  return w ? `주간 · ${w}` : '주간'
}

function imageField(a) {
  return a && typeof a['이미지'] === 'string' ? a['이미지'].trim() : ''
}

// 목록 카드 썸네일.
export function resolveThumb(a) {
  const src = imageField(a)
  const badge = seriesBadge(a)
  if (!src) return { kind: 'none', src: null, fit: 'cover', alt: '', badge }
  return { kind: 'field', src, fit: 'cover', alt: captionOf(a), badge }
}

// 상세 히어로 — 같은 이미지 + 캡션. 이미지 없으면 null(레거시 보관 글).
export function resolveHero(a) {
  const src = imageField(a)
  if (!src) return null
  return { src, fit: 'cover', caption: captionOf(a) }
}
