import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Articles, { ListView } from './Articles.jsx'
import { ArticleHero } from './ArticleDetail.jsx'
import { ArticleRow } from './insights-parts.jsx'
import { SeriesBand, SeriesArchive } from './insights-series.jsx'
import { resolveThumb, resolveHero } from './thumb-resolver.js'
import { seriesById } from '../content/series.js'
import {
  stateFromSearch, searchFromState, isSeriesArticle, excludeSeries,
  seriesEntries, seriesBands, SERIES_PREV_COUNT,
} from './insights-logic.js'

const noop = () => {}
const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')
const listProps = { tab: '전체', onTab: noop, topic: null, setTopic: noop, month: null, setMonth: noop, q: '', setQ: noop, onOpen: noop, onSeries: noop }
const art = (slug, over = {}) => ({ slug, title: `제목 ${slug}`, author: 'A', date: '2026-07-01', 설명: `설명 ${slug}`, body: '', 성격: '트렌드', 주제: '시장·생태계', ...over })
const wk = (slug, over = {}) => art(slug, { '시리즈': 'weekly', ...over })
const WEEKLY = seriesById('weekly')

// ── URL 계약 — 기존(?tab·?p) 불변, series만 추가 ──
test('URL — ?series=weekly 왕복 · 미지의 id 무시 · 기존 계약 불변', () => {
  expect(stateFromSearch('?series=weekly')).toEqual({ tab: '전체', slug: null, series: 'weekly' })
  expect(stateFromSearch('?series=없음').series).toBe(null)
  expect(stateFromSearch('?tab=analysis&p=x')).toEqual({ tab: '심층 분석', slug: 'x', series: null })
  expect(searchFromState({ series: 'weekly' })).toBe('?series=weekly')
  expect(searchFromState({ tab: '트렌드', series: 'weekly', slug: 'x' })).toBe('?tab=news&series=weekly&p=x')
  expect(searchFromState({})).toBe('')
})

// ── 귀속·분리 로직 ──
test('시리즈 판정·제외·회차 추출', () => {
  const all = [wk('w2'), art('a'), wk('w1'), art('b')]
  expect(isSeriesArticle(all[0])).toBe(true)
  expect(isSeriesArticle(all[1])).toBe(false)
  expect(excludeSeries(all).map((x) => x.slug)).toEqual(['a', 'b'])
  expect(seriesEntries(all, 'weekly').map((x) => x.slug)).toEqual(['w2', 'w1']) // 입력 역시간순 유지
  expect(seriesEntries(all, '없음')).toEqual([])
})

test('seriesBands — 최신 1 + 이전 최대 3 + 총 회차. 0건이면 밴드 없음', () => {
  const many = ['w5', 'w4', 'w3', 'w2', 'w1'].map((s) => wk(s))
  const [b] = seriesBands(many)
  expect(b.series.id).toBe('weekly')
  expect(b.latest.slug).toBe('w5')
  expect(b.prev.map((x) => x.slug)).toEqual(['w4', 'w3', 'w2'])
  expect(b.prev.length).toBe(SERIES_PREV_COUNT)
  expect(b.total).toBe(5)
  expect(seriesBands([art('a')])).toEqual([])
})

// ── 목록 재배치(핵심) ──
test('목록 = 시리즈 밴드 노출 + 시리즈 글은 메인 그리드에서 제외', () => {
  const all = [wk('w2'), wk('w1'), ...Array.from({ length: 5 }, (_, i) => art(`a${i}`))]
  const html = flat(<ListView all={all} {...listProps} />)
  expect(html).toContain('ins-series')
  expect(html).toContain('주간 AI 트렌드')
  expect(html).toContain('최신 회차')
  expect(html).toContain('전체 보기')
  // 그리드·피처에는 시리즈 글이 없다 — w2=밴드 최신 1회, w1=밴드 이전 회차 1회로만 등장
  expect(html.split('제목 w2').length - 1).toBe(1)
  expect(html.split('제목 w1').length - 1).toBe(1)
  expect(html).toContain('art-features') // 비시리즈 글로 피처 행은 그대로
})

test('성격 트렌드 탭에서도 시리즈 글은 밴드로만(그리드 제외)', () => {
  const all = [wk('w1'), art('a', { 성격: '트렌드' })]
  const html = flat(<ListView all={all} {...listProps} tab="트렌드" />)
  expect(html).toContain('ins-series')       // 밴드는 유지
  expect(html).not.toContain('art-features') // 필터 뷰 = 피처 행 없음
  expect(html).toContain('제목 a')
  expect(html.split('제목 w1').length - 1).toBe(1) // 밴드 1회뿐
})

test('검색 중 = 밴드 숨김 + 시리즈 글도 그리드에 포함(찾을 수는 있게)', () => {
  const all = [wk('w1', { title: '주간 AI 트렌드 — 7월 5주' }), art('a')]
  const html = flat(<ListView all={all} {...listProps} q="7월 5주" />)
  expect(html).not.toContain('ins-series')
  expect(html).toContain('art-grid')
  expect(html).toContain('주간 AI 트렌드 — 7월 5주')
})

test('시리즈 글만 있는 조건 = 밴드만 표시(빈 그리드·빈 상태 없음)', () => {
  const html = flat(<ListView all={[wk('w1')]} {...listProps} />)
  expect(html).toContain('ins-series')
  expect(html).not.toContain('art-grid')
  expect(html).not.toContain('art-empty')
})

// ── 밴드·아카이브 마크업 ──
test('밴드 = 고정 커버 + 시리즈명·설명 + 최신 회차 + 이전 회차 + 전체 보기', () => {
  const band = { series: WEEKLY, latest: wk('w3', { 시각: '09:05' }), prev: [wk('w2'), wk('w1')], total: 3 }
  const html = flat(<SeriesBand band={band} onOpen={noop} onSeries={noop} />)
  expect(html).toContain('/img/covers/series-weekly.svg')
  expect(html).toContain('SERIES')
  expect(html).toContain('매주 월요일, 지난 한 주 AI 소식 요약')
  expect(html).toContain('2026-07-01 09:05')
  expect(html).toContain('ins-series-prev')
  expect(html).toContain('제목 w2')
  expect(html).toContain('(3회)')
})

test('아카이브(?series=weekly) = 회차 역순 콤팩트 리스트(커버 반복 없음)', () => {
  const items = ['w3', 'w2', 'w1'].map((s) => wk(s))
  const html = flat(<SeriesArchive series={WEEKLY} items={items} onOpen={noop} onBack={noop} />)
  expect(html).toContain('ins-arch-list')
  expect(html).toContain('3</strong>회')
  expect(html).toContain('매주 월요일 발행')
  expect(html).toContain('← 인사이트 전체')
  // 고정 커버는 머리에서 1회만
  expect(html.split('/img/covers/series-weekly.svg').length - 1).toBe(1)
  expect(html).not.toContain('art-card')
})

test('아카이브 0건 = 디자인된 빈 상태', () => {
  const html = flat(<SeriesArchive series={WEEKLY} items={[]} onOpen={noop} onBack={noop} />)
  expect(html).toContain('art-empty')
  expect(html).toContain('아직 발행된 회차 없음.')
})

test('?series=weekly 딥링크 = 아카이브 뷰 진입(목록 필터 바 없음)', () => {
  const prev = globalThis.window
  globalThis.window = { location: { search: '?series=weekly', pathname: '/insights/' } }
  try {
    const html = flat(<Articles configured={false} />)
    expect(html).toContain('ins-arch')
    expect(html).toContain('주간 AI 트렌드')
    expect(html).not.toContain('ins-tabs') // 아카이브 = 성격 탭·필터 미노출
  } finally {
    if (prev === undefined) delete globalThis.window
    else globalThis.window = prev
  }
})

// ── 고정 커버 우선순위(썸네일·히어로) ──
test('썸네일 — 시리즈 고정 커버가 개별 이미지보다 우선', () => {
  const t = resolveThumb(wk('w1', { 이미지: '/img/covers/other.jpg', 이미지설명: '개별 캡션' }))
  expect(t.kind).toBe('series')
  expect(t.src).toBe('/img/covers/series-weekly.svg')
  expect(t.alt).toBe('주간 AI 트렌드 시리즈 커버')
  // 비시리즈 글은 기존 4계층 그대로
  expect(resolveThumb(art('a', { 이미지: '/img/covers/other.jpg' })).kind).toBe('field')
  const html = flat(<ArticleRow a={wk('w1')} onOpen={noop} />)
  expect(html).toContain('/img/covers/series-weekly.svg')
})

test('상세 히어로 — 고정 커버 + 자동 캡션(개별 이미지설명 불필요)', () => {
  expect(resolveHero(wk('w1'))).toEqual({
    src: '/img/covers/series-weekly.svg', fit: 'cover',
    caption: '주간 AI 트렌드 — 매주 월요일 발행하는 시리즈',
  })
  const html = flat(<ArticleHero a={wk('w1')} />)
  expect(html).toContain('art-hero-cap')
  expect(html).toContain('매주 월요일 발행하는 시리즈')
})

// 슬러그만으로도(frontmatter 없이) 전 경로가 시리즈로 동작한다 = 루틴 무변경 호환.
test('슬러그 인식만으로 밴드·커버 동작(frontmatter 시리즈 없음)', () => {
  const a = art('2026-08-10-bapzzi-weekly-trend-w32')
  // 로더·fromDbRow가 정규화하는 값을 흉내 — 여기서는 resolver의 슬러그 폴백을 직접 확인
  expect(resolveThumb(a).kind).toBe('series')
  expect(resolveHero(a).src).toBe('/img/covers/series-weekly.svg')
})
