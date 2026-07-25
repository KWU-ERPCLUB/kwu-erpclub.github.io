// 인사이트(INSIGHTS) 순수 로직 — 필터·그룹·이웃·URL 상태·허브 섹션·모노그램.
// 전부 순수 함수(부수효과 0) — 테스트 대상. UI 컴포넌트(Articles.jsx 등)가 소비.
import { NATURES } from '../content/schema.js'

// 성격 칩 = 전체 + 성격 4종. '전체' = 성격 필터 없음(AI in Use 구조: 상단 컨트롤 바 성격 칩).
export const HUB_TAB = '전체'
export const TABS = [HUB_TAB, ...NATURES]

// 성격 ↔ ascii 탭키(URL·CSS 클래스 안정용). Korean URL 인코딩 회피.
export const NATURE_KEY = { '트렌드': 'news', '심층 분석': 'analysis', '활용법·튜토리얼': 'howto', '도구·프롬프트': 'tools' }
const KEY_TO_NATURE = Object.fromEntries(Object.entries(NATURE_KEY).map(([n, k]) => [k, n]))

export function natureKey(nature) { return NATURE_KEY[nature] || 'analysis' }

// 저자 이니셜(아바타 1자) — 첫 글자 대문자.
export function authorInitial(author) { return (author || '?').trim().charAt(0).toUpperCase() || '?' }

// ── URL ↔ 상태 (뒤로가기·딥링크) : ?tab=<key> · ?p=<slug> ──
// search(location.search 문자열) → { tab, slug }. 미지의 tab 키 = 허브.
export function stateFromSearch(search) {
  const p = new URLSearchParams(search || '')
  const slug = p.get('p') || null
  const key = p.get('tab')
  const tab = key && KEY_TO_NATURE[key] ? KEY_TO_NATURE[key] : HUB_TAB
  return { tab, slug }
}

// { tab, slug } → "?tab=..&p=..". 허브·무값이면 빈 문자열.
export function searchFromState({ tab = HUB_TAB, slug = null } = {}) {
  const p = new URLSearchParams()
  if (tab && tab !== HUB_TAB && NATURE_KEY[tab]) p.set('tab', NATURE_KEY[tab])
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

// 성격·주제·지금써먹기 3필터 + 검색(제목·본문 부분일치) AND 결합.
export function filterArticles(all, { nature = null, topic = null, nowUse = false, q = '' } = {}) {
  const query = q.trim().toLowerCase()
  return all.filter((a) => {
    if (nature && a['성격'] !== nature) return false
    if (topic && a['주제'] !== topic) return false
    if (nowUse && !a['지금써먹기']) return false
    if (query) {
      const hay = `${a.title || ''} ${excerpt(a.body, 100000)}`.toLowerCase()
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

// 상세 하단 이웃(역시간순: prev=과거, next=최근).
export function neighbors(all, slug) {
  const i = all.findIndex((a) => a.slug === slug)
  return {
    prev: i >= 0 && i < all.length - 1 ? all[i + 1] : null,
    next: i > 0 ? all[i - 1] : null,
  }
}
