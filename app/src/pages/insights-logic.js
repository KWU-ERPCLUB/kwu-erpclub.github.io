// 인사이트(INSIGHTS) 순수 로직 — 필터·그룹·이웃·URL 상태·허브 섹션·모노그램.
// 전부 순수 함수(부수효과 0) — 테스트 대상. UI 컴포넌트(Articles.jsx 등)가 소비.
import { NATURES } from '../content/schema.js'

// 좌측 탭 = 전체 + 성격 4종. '전체' = 허브 뷰.
export const HUB_TAB = '전체'
export const TABS = [HUB_TAB, ...NATURES]

// 성격 정의 한 줄(허브 섹션 헤더 서브) — 원천 = CONTRIBUTING.md 성격 정의표.
export const NATURE_DEFS = {
  '뉴스·동향': '새 소식·출시·시장 변화의 사실 전달',
  '심층 분석': '한 주제를 파고든 해석·시사점',
  '활용법·튜토리얼': '따라 할 수 있는 절차·실습',
  '도구·프롬프트': '특정 도구·프롬프트가 주인공인 소개·사용기',
}

// 성격 ↔ ascii 탭키(URL·CSS 클래스 안정용). Korean URL 인코딩 회피.
export const NATURE_KEY = { '뉴스·동향': 'news', '심층 분석': 'analysis', '활용법·튜토리얼': 'howto', '도구·프롬프트': 'tools' }
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
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~`|-]/g, ' ')
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

// 역시간순 리스트 → 월별 그룹("YYYY. MM" 헤더). 정렬 순서 유지.
export function groupByMonth(list) {
  const groups = []
  let key = null
  for (const a of list) {
    const k = (a.date || '').slice(0, 7)
    if (k !== key) { key = k; groups.push({ month: k.replace('-', '. '), items: [] }) }
    groups[groups.length - 1].items.push(a)
  }
  return groups
}

// 상세 하단 이웃(역시간순: prev=과거, next=최근).
export function neighbors(all, slug) {
  const i = all.findIndex((a) => a.slug === slug)
  return {
    prev: i >= 0 && i < all.length - 1 ? all[i + 1] : null,
    next: i > 0 ? all[i - 1] : null,
  }
}

// 허브 뷰 한 성격 섹션: 고정(전부·최상단) + 비고정 최신 n건 + 총건수.
// all = 역시간순 정렬 가정. 고정 항목도 역시간순.
export function hubSection(all, nature, n = 2) {
  const items = all.filter((a) => a['성격'] === nature)
  const pinned = items.filter((a) => a['고정'] === true)
  const rest = items.filter((a) => a['고정'] !== true).slice(0, n)
  return { pinned, rest, total: items.length }
}
