import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Articles, { ListView } from './Articles.jsx'
import { ArticleHero } from './ArticleDetail.jsx'
import { ArticleRow } from './insights-parts.jsx'
import { resolveThumb, resolveHero } from './thumb-resolver.js'
import {
  stateFromSearch, searchFromState, seriesIdOfArticle, seriesOptions, filterArticles,
} from './insights-logic.js'

const noop = () => {}
const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')
const listProps = { tab: '전체', onTab: noop, series: null, setSeries: noop, month: null, setMonth: noop, q: '', setQ: noop, onOpen: noop }
const art = (slug, over = {}) => ({ slug, title: `제목 ${slug}`, author: 'A', date: '2026-07-01', 설명: `설명 ${slug}`, body: '', 성격: '트렌드', 축: 'AI활용', ...over })
const wk = (slug, over = {}) => art(slug, { '시리즈': 'weekly', ...over })

// ── URL 계약(2026-09-11) — ?p 불변 · ?axis=<key> 신설 · ?series=weekly(주간만) 유지 · 구 ?tab = 허브 폴백 ──
test('URL — ?series=weekly 왕복 · 미지의 id 무시 · ?axis 신설 · 구 ?tab 폴백', () => {
  expect(stateFromSearch('?series=weekly')).toEqual({ tab: '전체', slug: null, series: 'weekly' })
  expect(stateFromSearch('?series=없음').series).toBe(null)
  expect(stateFromSearch('?axis=jobs&p=x')).toEqual({ tab: 'AI×취업', slug: 'x', series: null })
  expect(stateFromSearch('?tab=analysis&p=x')).toEqual({ tab: '전체', slug: 'x', series: null })
  expect(searchFromState({ series: 'weekly' })).toBe('?series=weekly')
  expect(searchFromState({ tab: 'AI활용', series: 'weekly', slug: 'x' })).toBe('?axis=use&series=weekly&p=x')
  expect(searchFromState({})).toBe('')
})

test('시리즈 판정 — frontmatter · 슬러그 자동 인식 · 비시리즈', () => {
  expect(seriesIdOfArticle(wk('w1'))).toBe('weekly')
  expect(seriesIdOfArticle(art('2026-08-10-bapzzi-weekly-trend-w32'))).toBe('weekly')
  expect(seriesIdOfArticle(art('a'))).toBe(null)
})

test('seriesOptions — 소속 글 있는 시리즈만 · 회차 수 동반 · 0건이면 없음', () => {
  expect(seriesOptions([wk('w2'), art('a'), wk('w1')])).toEqual([{ id: 'weekly', label: '주간 AI 트렌드', count: 2 }])
  expect(seriesOptions([art('a')])).toEqual([])
})

test('filterArticles — series(주간만)는 축·검색과 AND 결합', () => {
  const all = [wk('w1', { 축: 'AI×MIS' }), wk('w2', { 축: 'AI활용' }), art('a')]
  expect(filterArticles(all, { series: 'weekly' }).map((x) => x.slug)).toEqual(['w1', 'w2'])
  expect(filterArticles(all, { series: 'weekly', axis: 'AI활용' }).map((x) => x.slug)).toEqual(['w2'])
  expect(filterArticles(all, { series: '없음' })).toEqual([])
  expect(filterArticles(all, {}).length).toBe(3)
})

test('시리즈 글도 피처·그리드·카운트에 일반 기사와 동일하게 포함', () => {
  const all = [wk('w2'), wk('w1'), ...Array.from({ length: 5 }, (_, i) => art(`a${i}`))]
  const html = flat(<ListView all={all} {...listProps} />)
  expect(html).not.toContain('ins-series')
  expect(html).toContain('art-features')
  expect(html).toContain('제목 w2')
  expect(html).toContain('전체 <strong>7</strong>건')
})

test('주간만 토글 = 필터 1줄 안(소속 글 0건이면 미노출)', () => {
  const html = flat(<ListView all={[wk('w1'), art('a')]} {...listProps} />)
  expect(html).toContain('art-weekly')
  expect(html).toContain('주간만')
  expect(html).not.toContain('시리즈 필터')   // 구 시리즈 칩 열 폐지
  expect(html).not.toContain('주제 필터')     // 구 주제 칩 열 폐지
  expect(flat(<ListView all={[art('a')]} {...listProps} />)).not.toContain('art-weekly')
})

test('주간만 선택 = 주간 글만 그리드 · 피처 행 없음', () => {
  const all = [wk('w2'), wk('w1'), ...Array.from({ length: 5 }, (_, i) => art(`a${i}`))]
  const html = flat(<ListView all={all} {...listProps} series="weekly" />)
  expect(html).not.toContain('art-features')
  expect(html).toContain('제목 w1')
  expect(html).not.toContain('제목 a0')
  expect(html).toContain('조건 일치 2건')
})

test('?series=weekly 딥링크 = 필터 걸린 목록(아카이브 셸 아님)', () => {
  const prev = globalThis.window
  globalThis.window = { location: { search: '?series=weekly', pathname: '/insights/' } }
  try {
    const html = flat(<Articles configured={false} />)
    expect(html).toContain('art-filter-axis')
    expect(html).not.toContain('ins-arch')
  } finally {
    if (prev === undefined) delete globalThis.window
    else globalThis.window = prev
  }
})

// ── 커버(2026-09-11) — 고정 커버 폐지. 주간도 실제 이미지 + 주차 배지 ──
test('주간 썸네일 = 개별 이미지 + 「주간 · M월 N주」 배지(고정 커버 없음)', () => {
  const a = wk('w1', { title: '주간 AI 트렌드 — 9월 2주', 이미지: '/img/covers/w.jpg', 이미지설명: 'TOP 1 소재' })
  const t = resolveThumb(a)
  expect(t.kind).toBe('field')
  expect(t.src).toBe('/img/covers/w.jpg')
  const card = flat(<ArticleRow a={a} onOpen={noop} />)
  expect(card).toContain('/img/covers/w.jpg')
  expect(card).toContain('art-cover-badge')
  expect(card).toContain('주간 · 9월 2주')
  expect(card).not.toContain('art-cover-svg')
})

test('주간 히어로 = 이미지 + 배지 + 이미지설명 캡션(자동 캡션 없음)', () => {
  const a = wk('w1', { title: '주간 AI 트렌드 — 9월 2주', 이미지: '/img/covers/w.jpg', 이미지설명: 'TOP 1 소재' })
  expect(resolveHero(a)).toEqual({ src: '/img/covers/w.jpg', fit: 'cover', caption: 'TOP 1 소재' })
  const html = flat(<ArticleHero a={a} />)
  expect(html).toContain('art-cover-badge')
  expect(html).toContain('TOP 1 소재')
  expect(html).not.toContain('매주 월요일 발행하는 시리즈')
  expect(flat(<ArticleHero a={wk('w0')} />)).toBe('')   // 이미지 없는 레거시 주간 = 히어로 없음
})
