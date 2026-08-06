import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Articles, { ListView } from './Articles.jsx'
import { ArticleHero } from './ArticleDetail.jsx'
import { ArticleRow } from './insights-parts.jsx'
import { resolveThumb, resolveHero } from './thumb-resolver.js'
import {
  stateFromSearch, searchFromState, isSeriesArticle, seriesOptions, filterArticles,
} from './insights-logic.js'

const noop = () => {}
const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')
const listProps = { tab: '전체', onTab: noop, topic: null, setTopic: noop, series: null, setSeries: noop, month: null, setMonth: noop, q: '', setQ: noop, onOpen: noop }
const art = (slug, over = {}) => ({ slug, title: `제목 ${slug}`, author: 'A', date: '2026-07-01', 설명: `설명 ${slug}`, body: '', 성격: '트렌드', 주제: '시장·생태계', ...over })
const wk = (slug, over = {}) => art(slug, { '시리즈': 'weekly', ...over })

// ── URL 계약 — 기존(?tab·?p) 불변, series만 추가(딥링크 = 시리즈 필터가 걸린 목록) ──
test('URL — ?series=weekly 왕복 · 미지의 id 무시 · 기존 계약 불변', () => {
  expect(stateFromSearch('?series=weekly')).toEqual({ tab: '전체', slug: null, series: 'weekly' })
  expect(stateFromSearch('?series=없음').series).toBe(null)
  expect(stateFromSearch('?tab=analysis&p=x')).toEqual({ tab: '심층 분석', slug: 'x', series: null })
  expect(searchFromState({ series: 'weekly' })).toBe('?series=weekly')
  expect(searchFromState({ tab: '트렌드', series: 'weekly', slug: 'x' })).toBe('?tab=news&series=weekly&p=x')
  expect(searchFromState({})).toBe('')
})

// ── 귀속 판정 ──
test('시리즈 판정 — frontmatter · 슬러그 자동 인식 · 비시리즈', () => {
  expect(isSeriesArticle(wk('w1'))).toBe(true)
  expect(isSeriesArticle(art('2026-08-10-bapzzi-weekly-trend-w32'))).toBe(true) // 슬러그 인식
  expect(isSeriesArticle(art('a'))).toBe(false)
})

// ── 필터 소재(레지스트리 기반 칩) ──
test('seriesOptions — 소속 글 있는 시리즈만 · 회차 수 동반 · 0건이면 칩 없음', () => {
  expect(seriesOptions([wk('w2'), art('a'), wk('w1')])).toEqual([{ id: 'weekly', label: '주간 AI 트렌드', count: 2 }])
  expect(seriesOptions([art('a')])).toEqual([])
  expect(seriesOptions([])).toEqual([])
})

// ── 필터 문법 — 다른 필터와 동일(AND 결합) ──
test('filterArticles — series 조건은 다른 필터와 AND 결합', () => {
  const all = [wk('w1', { 주제: '시장·생태계' }), wk('w2', { 주제: '에이전트' }), art('a')]
  expect(filterArticles(all, { series: 'weekly' }).map((x) => x.slug)).toEqual(['w1', 'w2'])
  expect(filterArticles(all, { series: 'weekly', topic: '에이전트' }).map((x) => x.slug)).toEqual(['w2'])
  expect(filterArticles(all, { series: '없음' })).toEqual([])
  expect(filterArticles(all, {}).length).toBe(3) // 미선택 = 전량(시리즈 글도 일반 흐름)
})

// ── 목록 = 일반 흐름 복귀(밴드·전용 아카이브 폐지) ──
test('시리즈 글도 피처·그리드·카운트에 일반 기사와 동일하게 포함', () => {
  const all = [wk('w2'), wk('w1'), ...Array.from({ length: 5 }, (_, i) => art(`a${i}`))]
  const html = flat(<ListView all={all} {...listProps} />)
  expect(html).not.toContain('ins-series')   // 상단 밴드 없음
  expect(html).toContain('art-features')     // 최신 2건이 피처 = 시리즈 글도 후보
  expect(html).toContain('제목 w2')
  expect(html).toContain('제목 w1')
  expect(html).toContain('전체 <strong>7</strong>건') // 카운트에 시리즈 포함(4차: "전체 N건")
})

test('시리즈 필터 칩 = 필터 행에 노출(레지스트리 기반)', () => {
  const html = flat(<ListView all={[wk('w1'), art('a')]} {...listProps} />)
  expect(html).toContain('시리즈 필터')
  expect(html).toContain('주간 AI 트렌드')
  expect(html).toContain('art-filter-n')
  // 소속 글이 없으면 칩 열 자체가 없다
  expect(flat(<ListView all={[art('a')]} {...listProps} />)).not.toContain('시리즈 필터')
})

test('시리즈 선택 = 해당 시리즈만 그리드 · 피처 행 없음(필터 뷰)', () => {
  const all = [wk('w2'), wk('w1'), ...Array.from({ length: 5 }, (_, i) => art(`a${i}`))]
  const html = flat(<ListView all={all} {...listProps} series="weekly" />)
  expect(html).not.toContain('art-features')
  expect(html).toContain('제목 w1')
  expect(html).not.toContain('제목 a0')
  expect(html).toContain('조건 일치 2건') // 필터 뷰 = 일치 건수 병기(4차)
})

test('?series=weekly 딥링크 = 필터 걸린 목록(아카이브 셸 아님)', () => {
  const prev = globalThis.window
  globalThis.window = { location: { search: '?series=weekly', pathname: '/insights/' } }
  try {
    const html = flat(<Articles configured={false} />)
    expect(html).toContain('ins-tabs')   // 목록 셸 그대로(성격 탭·필터 노출)
    expect(html).not.toContain('ins-arch')
  } finally {
    if (prev === undefined) delete globalThis.window
    else globalThis.window = prev
  }
})

// ── 고정 커버 우선순위(썸네일·히어로) = 유지 ──
test('썸네일 — 시리즈 고정 커버(컴포넌트)가 개별 이미지보다 우선', () => {
  const t = resolveThumb(wk('w1', { 이미지: '/img/covers/other.jpg', 이미지설명: '개별 캡션' }))
  expect(t.kind).toBe('series')
  expect(t.src).toBe(null)          // v3 = 정적 파일 아님
  expect(t.cover).toBe('weekly')    // 컴포넌트 id
  expect(t.alt).toBe('주간 AI 트렌드 시리즈 커버')
  // 비시리즈 글은 기존 4계층 그대로
  expect(resolveThumb(art('a', { 이미지: '/img/covers/other.jpg' })).kind).toBe('field')
  // 카드 썸네일 = 인라인 SVG(개별 이미지 경로가 나오지 않는다)
  const card = flat(<ArticleRow a={wk('w1', { title: '주간 AI 트렌드 — 7월 5주', 이미지: '/img/covers/other.jpg' })} onOpen={noop} />)
  expect(card).toContain('주간 AI 트렌드')
  expect(card).not.toContain('/img/covers/other.jpg')
})

test('상세 히어로 — 고정 커버 + 자동 캡션(개별 이미지설명 불필요)', () => {
  expect(resolveHero(wk('w1'))).toEqual({
    src: null, cover: 'weekly', fit: 'cover',
    caption: '주간 AI 트렌드 — 매주 월요일 발행하는 시리즈',
  })
  const html = flat(<ArticleHero a={wk('w1')} />)
  expect(html).toContain('art-hero-svg')
  expect(html).toContain('art-hero-cap')
  expect(html).toContain('매주 월요일 발행하는 시리즈')
})

// 슬러그만으로도(frontmatter 없이) 전 경로가 시리즈로 동작한다 = 루틴 무변경 호환.
test('슬러그 인식만으로 필터·커버 동작(frontmatter 시리즈 없음)', () => {
  const a = art('2026-08-10-bapzzi-weekly-trend-w32')
  expect(filterArticles([a], { series: 'weekly' }).length).toBe(1)
  expect(resolveThumb(a).kind).toBe('series')
  expect(resolveHero(a).cover).toBe('weekly')
})
