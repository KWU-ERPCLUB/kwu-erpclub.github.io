// 인사이트(INSIGHTS) 순수 로직 — 필터·그룹·이웃·URL 상태·허브 섹션·모노그램.
// 전부 순수 함수(부수효과 0) — 테스트 대상. UI 컴포넌트(Articles.jsx 등)가 소비.
import { NATURES } from '../content/schema.js'
import { SERIES, seriesById, seriesIdOf } from '../content/series.js'

// 성격 칩 = 전체 + 성격 4종. '전체' = 성격 필터 없음(AI in Use 구조: 상단 컨트롤 바 성격 칩).
export const HUB_TAB = '전체'
export const TABS = [HUB_TAB, ...NATURES]

// 성격 ↔ ascii 탭키(URL·CSS 클래스 안정용). Korean URL 인코딩 회피.
export const NATURE_KEY = { '트렌드': 'news', '심층 분석': 'analysis', '활용법·튜토리얼': 'howto', '도구·프롬프트': 'tools' }
const KEY_TO_NATURE = Object.fromEntries(Object.entries(NATURE_KEY).map(([n, k]) => [k, n]))

export function natureKey(nature) { return NATURE_KEY[nature] || 'analysis' }

// 저자 이니셜(아바타 1자) — 첫 글자 대문자.
export function authorInitial(author) { return (author || '?').trim().charAt(0).toUpperCase() || '?' }

// 대시 표기 폐지(오너 2026-08-15) — 제목·설명의 ' — '는 화면에서 줄바꿈이 대신한다.
// 문장이 끊기는 지점에서 줄을 넘겨 의미 단위로 읽히게 한다. 원문(md·상세 h1)은 그대로 두고 표시만 분할.
// 소비처 = 메인 홈 카드 · 인사이트 목록 카드 · 자동 생성 커버 SVG(전부 같은 규칙).
export function splitTitle(text) {
  return String(text ?? '').split(/\s*[—–]\s*/).filter(Boolean)
}

// ── URL ↔ 상태 (뒤로가기·딥링크) : ?tab=<key> · ?series=<id> · ?p=<slug> ──
// 기존 계약(?tab·?p)은 불변 — series 파라미터만 추가(2026-08-05 시리즈 체계).
// search(location.search 문자열) → { tab, slug, series }. 미지의 tab 키 = 허브, 미지의 series = null.
export function stateFromSearch(search) {
  const p = new URLSearchParams(search || '')
  const slug = p.get('p') || null
  const key = p.get('tab')
  const tab = key && KEY_TO_NATURE[key] ? KEY_TO_NATURE[key] : HUB_TAB
  const sid = p.get('series')
  return { tab, slug, series: sid && seriesById(sid) ? sid : null }
}

// { tab, slug, series } → "?tab=..&series=..&p=..". 허브·무값이면 빈 문자열.
export function searchFromState({ tab = HUB_TAB, slug = null, series = null } = {}) {
  const p = new URLSearchParams()
  if (tab && tab !== HUB_TAB && NATURE_KEY[tab]) p.set('tab', NATURE_KEY[tab])
  if (series && seriesById(series)) p.set('series', series)
  if (slug) p.set('p', slug)
  const s = p.toString()
  return s ? `?${s}` : ''
}

// 본문 마크다운 → 텍스트 발췌(검색 인덱스).
export function excerpt(body, n = 96) {
  const text = (body || '')
    .replace(/^:{3,}.*$/gm, ' ') // ::: 요약·수치 컨테이너 마커 제거(내용은 발췌에 포함)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_~]+/g, '') // 강조 마커 = 공백 없이 제거(단어 벌어짐 방지)
    .replace(/[#>`|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > n ? `${text.slice(0, n).trim()}…` : text
}

// 콘텐츠에 실제 등장하는 월('YYYY-MM') 목록 — 최신 먼저. 월 필터 옵션 생성용(2026-07-27 오너 지시).
export function extractMonths(all) {
  const seen = new Set()
  for (const a of all || []) if (a.date && /^\d{4}-\d{2}/.test(a.date)) seen.add(a.date.slice(0, 7))
  return [...seen].sort().reverse()
}

// 성격·주제·시리즈·월·지금써먹기 필터 + 검색(제목·설명·태그·본문 부분일치) AND 결합. month='YYYY-MM'|null.
export function filterArticles(all, { nature = null, topic = null, series = null, month = null, nowUse = false, q = '' } = {}) {
  const query = q.trim().toLowerCase()
  return all.filter((a) => {
    if (nature && a['성격'] !== nature) return false
    if (topic && a['주제'] !== topic) return false
    if (series && seriesIdOfArticle(a) !== series) return false
    if (month && (a.date || '').slice(0, 7) !== month) return false
    if (nowUse && !a['지금써먹기']) return false
    if (query) {
      const tags = Array.isArray(a['태그']) ? a['태그'].join(' ') : ''
      const hay = `${a.title || ''} ${a['설명'] || ''} ${tags} ${excerpt(a.body, 100000)}`.toLowerCase()
      if (!hay.includes(query)) return false
    }
    return true
  })
}

// 고정 우선 분리 — 고정(true) 먼저 + 나머지(둘 다 입력 순서=역시간순 유지). all=역시간순 정렬 가정.
export function pinnedFirst(list) {
  return {
    pinned: list.filter((a) => a['고정'] === true),
    rest: list.filter((a) => a['고정'] !== true),
  }
}

// ── 목록 리디자인(2026-08-05 오너 픽 A) — 상단 피처 행 + 더보기 페이징 ──
export const FEATURE_COUNT = 2 // 피처 행 = 고정 기사 + 최신, 최대 2건(큰 썸네일)
export const PAGE_SIZE = 9     // 그리드 1회 노출(3열 × 3행). 더보기 = +PAGE_SIZE

// 정렬된 목록 → { feature, list }. 앞 n건이 피처, 나머지가 그리드.
// 호출측이 필터 없는 기본 뷰에서만 쓴다(필터 뷰 = 전량 그리드).
export function splitFeature(ordered, n = FEATURE_COUNT) {
  const src = ordered || []
  if (src.length <= n) return { feature: [], list: src } // 총량이 적으면 위계 없이 그리드만
  return { feature: src.slice(0, n), list: src.slice(n) }
}

// 정렬(4차 2026-08-06 외부 피드백 — "오래된 순도") — 'new'=역시간순(입력 순서 유지, 기본) / 'old'=날짜 오름차순.
// 입력 all = 역시간순 정렬 가정(로더 계약). 원본 불변(사본 반환).
export const SORTS = [['new', '최신순'], ['old', '오래된순']]
export function sortArticles(list, sort = 'new') {
  const src = [...(list || [])]
  return sort === 'old' ? src.reverse() : src
}

// 더보기 페이징 — 무한스크롤 금지(오너 픽). shown = 현재 노출 개수.
export function pageSlice(list, shown) {
  const src = list || []
  const n = Math.max(0, shown || 0)
  return { visible: src.slice(0, n), remaining: Math.max(0, src.length - n) }
}

// ── 시리즈(2026-08-05 확정 → 08-05 오너 재판정으로 「필터」로 축소) ──
// 규칙 2개:
//   ① 소속 판정 = seriesIdOf(frontmatter `시리즈` 우선, 없으면 슬러그 자동 인식).
//   ② 시리즈 글은 **다른 기사와 동일하게** 흐른다 — 피처 선정·그리드·카운트에 전부 포함.
//      분리 노출(상단 밴드·전용 아카이브)은 폐지(오너 재판정: "필터 하나면 된다").
//      유일한 시리즈 전용 장치 = ⑴ 필터 칩(아래 seriesOptions) ⑵ 고정 커버(thumb-resolver ⓪).
export function seriesIdOfArticle(a) { return seriesIdOf(a) }

export function isSeriesArticle(a) { return seriesIdOfArticle(a) !== null }

// 시리즈 필터 칩 소재 — 레지스트리 순서. list에 소속 글이 1건도 없는 시리즈는 칩을 만들지 않는다.
// 반환 = [{ id, label, count }]. 새 시리즈(분기 등) 등록 = 레지스트리 1줄 → 칩 자동 증가.
export function seriesOptions(list) {
  const src = list || []
  const out = []
  for (const rec of SERIES) {
    const count = src.filter((a) => seriesIdOfArticle(a) === rec.id).length
    if (count > 0) out.push({ id: rec.id, label: rec.표시명, count })
  }
  return out
}

// 상세 하단 이웃(역시간순: prev=과거, next=최근).
export function neighbors(all, slug) {
  const i = all.findIndex((a) => a.slug === slug)
  return {
    prev: i >= 0 && i < all.length - 1 ? all[i + 1] : null,
    next: i > 0 ? all[i - 1] : null,
  }
}
