import { expect, test } from 'vitest'
import {
  excerpt, filterArticles, groupByMonth, neighbors,
  stateFromSearch, searchFromState, monogram, natureKey, hubSection, HUB_TAB,
} from './insights-logic.js'

// ── URL ↔ 상태 (뒤로가기·딥링크) ──
test('stateFromSearch — ?p=<slug>는 상세, tab 없으면 허브', () => {
  expect(stateFromSearch('?p=2026-07-22-x')).toEqual({ tab: HUB_TAB, slug: '2026-07-22-x' })
})
test('stateFromSearch — ?tab=<key> 복원(딥링크), 미지 키는 허브', () => {
  expect(stateFromSearch('?tab=analysis')).toEqual({ tab: '심층 분석', slug: null })
  expect(stateFromSearch('?tab=news&p=y')).toEqual({ tab: '뉴스·동향', slug: 'y' })
  expect(stateFromSearch('?tab=없는키')).toEqual({ tab: HUB_TAB, slug: null })
  expect(stateFromSearch('')).toEqual({ tab: HUB_TAB, slug: null })
})
test('searchFromState — 허브·무값이면 빈 문자열', () => {
  expect(searchFromState({ tab: HUB_TAB, slug: null })).toBe('')
  expect(searchFromState({})).toBe('')
})
test('searchFromState — 성격 탭·상세 쿼리 생성', () => {
  expect(searchFromState({ tab: '심층 분석', slug: null })).toBe('?tab=analysis')
  expect(searchFromState({ tab: HUB_TAB, slug: 'x' })).toBe('?p=x')
  expect(searchFromState({ tab: '도구·프롬프트', slug: 'x' })).toBe('?tab=tools&p=x')
})
test('URL 왕복 — state→search→state 보존(pushState/popstate 순수 로직)', () => {
  for (const s of [
    { tab: HUB_TAB, slug: null },
    { tab: '뉴스·동향', slug: null },
    { tab: '활용법·튜토리얼', slug: '2026-08-01-hong-x' },
    { tab: HUB_TAB, slug: 'only-detail' },
  ]) {
    expect(stateFromSearch(searchFromState(s))).toEqual(s)
  }
})

// ── 모노그램 fallback ──
test('monogram — 성격 첫 글자, natureKey — ascii 키', () => {
  expect(monogram('뉴스·동향')).toBe('뉴')
  expect(monogram('심층 분석')).toBe('심')
  expect(monogram('활용법·튜토리얼')).toBe('활')
  expect(monogram('도구·프롬프트')).toBe('도')
  expect(natureKey('심층 분석')).toBe('analysis')
  expect(natureKey('없는성격')).toBe('analysis') // 안전 fallback
})

// ── 허브 섹션(고정 우선) ──
test('hubSection — 고정 최상단(전부) + 비고정 최신 2 + total', () => {
  const all = [ // 역시간순 가정
    { slug: 'd4', date: '2026-07-30', 성격: '심층 분석', 고정: true },
    { slug: 'd3', date: '2026-07-20', 성격: '심층 분석' },
    { slug: 'd2', date: '2026-07-10', 성격: '심층 분석' },
    { slug: 'd1', date: '2026-07-01', 성격: '심층 분석' },
    { slug: 'x', date: '2026-07-15', 성격: '뉴스·동향' },
  ]
  const s = shell(all)
  expect(s.total).toBe(4)
  expect(s.pinned.map((a) => a.slug)).toEqual(['d4']) // 고정만
  expect(s.rest.map((a) => a.slug)).toEqual(['d3', 'd2']) // 비고정 최신 2
})
function shell(all) { return hubSection(all, '심층 분석', 2) }
test('hubSection — 0건 성격은 total 0', () => {
  expect(hubSection([{ slug: 'a', 성격: '뉴스·동향' }], '도구·프롬프트').total).toBe(0)
})

// ── 필터·그룹·이웃·발췌(기존 계약 승계) ──
test('3필터 — 성격·영역·지금써먹기 AND 결합', () => {
  const all = [
    { slug: 'a', 성격: '심층 분석', 영역: '기획·전략', 지금써먹기: true },
    { slug: 'b', 성격: '뉴스·동향', 영역: '데이터·분석' },
    { slug: 'c', 성격: '심층 분석', 영역: '데이터·분석', 지금써먹기: true },
  ]
  expect(filterArticles(all, {}).map((x) => x.slug)).toEqual(['a', 'b', 'c'])
  expect(filterArticles(all, { nature: '심층 분석' }).map((x) => x.slug)).toEqual(['a', 'c'])
  expect(filterArticles(all, { area: '데이터·분석' }).map((x) => x.slug)).toEqual(['b', 'c'])
  expect(filterArticles(all, { nowUse: true }).map((x) => x.slug)).toEqual(['a', 'c'])
  expect(filterArticles(all, { nature: '심층 분석', area: '데이터·분석', nowUse: true }).map((x) => x.slug)).toEqual(['c'])
})
test('검색 — 제목·본문 부분일치 + 필터 AND', () => {
  const all = [
    { slug: 'a', title: '에이전트 실전', body: '업무 자동화 사례', 성격: '활용법·튜토리얼' },
    { slug: 'b', title: '리서치 요약', body: '시장 동향 정리', 성격: '뉴스·동향' },
  ]
  expect(filterArticles(all, { q: '에이전트' }).map((x) => x.slug)).toEqual(['a'])
  expect(filterArticles(all, { q: '동향' }).map((x) => x.slug)).toEqual(['b'])
  expect(filterArticles(all, { q: '없는말' })).toEqual([])
  expect(filterArticles(all, { nature: '활용법·튜토리얼', q: '리서치' })).toEqual([])
})
test('groupByMonth — 같은 달 묶고 순서 유지 · "YYYY. MM"', () => {
  const g = groupByMonth([
    { slug: 'a', date: '2026-07-22' }, { slug: 'b', date: '2026-07-01' }, { slug: 'c', date: '2026-06-30' },
  ])
  expect(g.map((x) => x.month)).toEqual(['2026. 07', '2026. 06'])
  expect(g[0].items.map((x) => x.slug)).toEqual(['a', 'b'])
})
test('neighbors — 역시간순 prev=과거·next=최근, 경계 null', () => {
  const all = [{ slug: 'new' }, { slug: 'mid' }, { slug: 'old' }]
  expect(neighbors(all, 'mid')).toEqual({ prev: { slug: 'old' }, next: { slug: 'new' } })
  expect(neighbors(all, 'new').next).toBe(null)
  expect(neighbors(all, 'old').prev).toBe(null)
})
test('excerpt — 마크다운 기호 제거 + 길이 제한', () => {
  const out = excerpt('**굵게** 그리고 [링크](http://x) 텍스트', 100)
  expect(out).not.toContain('**')
  expect(out).not.toContain('](')
  expect(out).toContain('링크')
  expect(excerpt('가'.repeat(200), 96).endsWith('…')).toBe(true)
})
