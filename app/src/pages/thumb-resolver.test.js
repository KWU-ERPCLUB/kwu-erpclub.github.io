import { expect, test } from 'vitest'
import { readdirSync, existsSync } from 'node:fs'
import { readEntries } from '../../scripts/content-files.mjs'
import { resolveThumb, resolveHero, captionOf, firstBodyImage, brandLogo, stockFile, TOPIC_STOCK, DEFAULT_STOCK, BRAND_RULES, SUBJECT_RULES } from './thumb-resolver.js'

// 썸네일 4계층 폴백(오너 픽 2026-08-05 D) — 우선순위대로 하나씩 내려가는지 고정한다.
const base = { slug: 's', title: '제목', author: 'A', date: '2026-08-05', body: '', 설명: 'd' }

test('① frontmatter 이미지 = 최우선(로고 경로면 contain)', () => {
  const t = resolveThumb({ ...base, 이미지: '/img/logos/openai.svg', 주제: '시장·생태계', body: '![x](/img/기사/a.svg)' })
  expect(t.kind).toBe('field')
  expect(t.src).toBe('/img/logos/openai.svg')
  expect(t.fit).toBe('contain')
})

test('① frontmatter 이미지가 사진 경로면 cover', () => {
  expect(resolveThumb({ ...base, 이미지: '/img/기사/photo.png' }).fit).toBe('cover')
})

test('② 본문 첫 이미지 = /img/기사/ 경로만 채택(외부 URL·타 경로 무시)', () => {
  expect(firstBodyImage('![a](https://example.com/x.png)\n![b](/img/기사/chart.svg)')).toBe('/img/기사/chart.svg')
  expect(firstBodyImage('![a](https://example.com/x.png)')).toBeNull()
  expect(firstBodyImage('![a](/img/projects/x.png)')).toBeNull()
  expect(firstBodyImage('')).toBeNull()
  const t = resolveThumb({ ...base, 주제: '시장·생태계', body: '본문\n![차트](/img/기사/h1-2026-funding.svg)' })
  expect(t.kind).toBe('body')
  expect(t.src).toBe('/img/기사/h1-2026-funding.svg')
})

test('③-a 브랜드 키워드 → 기존 로고(제목·태그에서 감지)', () => {
  expect(brandLogo({ title: 'Claude Code 정리' })).toBe('claude.svg')
  expect(brandLogo({ title: 'GPT-5.6 가격 인하' })).toBe('openai.svg')
  expect(brandLogo({ title: '구글 신모델' })).toBe('gemini.svg')
  expect(brandLogo({ title: 'Copilot 3,000만 시트' })).toBe('copilot.svg')
  expect(brandLogo({ title: '아무 브랜드 없음', 태그: ['앤스로픽'] })).toBe('anthropic.svg')
  expect(brandLogo({ title: '국내 SI 실적' })).toBeNull()
  const t = resolveThumb({ ...base, title: 'Anthropic 모델 공개', 주제: '모델·플랫폼' })
  expect(t.kind).toBe('logo')
  expect(t.src).toBe('/img/logos/anthropic.svg')
  expect(t.fit).toBe('contain')
})

test('③-b 브랜드 없음 → 소재 키워드 스톡, 없으면 주제 enum 스톡', () => {
  expect(stockFile({ title: 'HBM 증설과 파운드리' })).toBe('semiconductor.jpg')
  expect(stockFile({ title: '데이터센터 전력 문제' })).toBe('datacenter.jpg')
  expect(stockFile({ title: 'AI 채용 시장 변화' })).toBe('office.jpg')
  // 소재 키워드 미검출 → 주제 enum 기본값
  expect(stockFile({ title: '무관한 제목', 주제: '크리에이티브·미디어' })).toBe(TOPIC_STOCK['크리에이티브·미디어'])
  const t = resolveThumb({ ...base, title: '국내 SI 실적 발표', 주제: '시장·생태계' })
  expect(t.kind).toBe('stock')
  expect(t.src).toBe('/img/thumbs/market.jpg')
  expect(t.fit).toBe('cover')
})

test('④ 이미지·본문도판·브랜드·주제 전부 없음 = 자동 타이포 커버', () => {
  expect(stockFile({ title: '' })).toBeNull()
  const t = resolveThumb({ ...base, title: '' })
  expect(t.kind).toBe('cover')
  expect(t.src).toBeNull()
})

test('빈 입력에도 폴백이 끊기지 않는다', () => {
  expect(resolveThumb(null).kind).toBe('cover')
  expect(resolveThumb({}).kind).toBe('cover')
})

// ── 히어로·캡션(오너 판정 2026-08-05) ──
test('captionOf = 이미지설명 트림, 없으면 빈 문자열', () => {
  expect(captionOf({ 이미지설명: '  로고 — 발표 주체  ' })).toBe('로고 — 발표 주체')
  expect(captionOf({})).toBe('')
  expect(captionOf(null)).toBe('')
})

test('resolveHero = 명시 이미지만 채택(자동 계층 미사용)', () => {
  const h = resolveHero({ ...base, 이미지: '/img/logos/openai.svg', 이미지설명: '오픈AI 로고 — 개발사' })
  expect(h).toEqual({ src: '/img/logos/openai.svg', fit: 'contain', caption: '오픈AI 로고 — 개발사' })
  expect(resolveHero({ ...base, 이미지: '/img/기사/chart.svg' }).fit).toBe('cover')
  // 본문 도판·브랜드 키워드·주제 스톡이 있어도 히어로는 만들지 않는다(장식 방지).
  expect(resolveHero({ ...base, title: 'Claude 정리', 주제: '에이전트', body: '![x](/img/기사/a.svg)' })).toBeNull()
  expect(resolveHero(null)).toBeNull()
})

test('카드 alt = 명시 이미지일 때만 이미지설명(자동 폴백은 빈 alt)', () => {
  expect(resolveThumb({ ...base, 이미지: '/img/logos/openai.svg', 이미지설명: '오픈AI 로고' }).alt).toBe('오픈AI 로고')
  expect(resolveThumb({ ...base, title: 'Claude 정리', 이미지설명: '무시됨' }).alt).toBe('')
})

// 매핑이 가리키는 파일이 public에 실제로 있어야 한다(404 썸네일 방지).
test('스톡·로고 매핑 파일 = public에 실재', () => {
  const stocks = new Set(readdirSync('public/img/thumbs'))
  const logos = new Set(readdirSync('public/img/logos'))
  for (const f of [...Object.values(TOPIC_STOCK), DEFAULT_STOCK, ...SUBJECT_RULES.map(([, f2]) => f2)]) {
    expect(stocks.has(f), `스톡 결측: ${f}`).toBe(true)
  }
  for (const [, f] of BRAND_RULES) expect(logos.has(f), `로고 결측: ${f}`).toBe(true)
})

// 기고가 지정한 이미지가 실재하는지 + 캡션이 붙었는지(오너 규칙 = CONTRIBUTING 「이미지·이미지설명」).
// 콘텐츠 비결합: 특정 기사에 묶지 않고 전량을 훑는다.
test('기사가 지정한 이미지 = public에 실재 + 이미지설명 동반', () => {
  for (const e of readEntries('기사')) {
    const src = e.data['이미지']
    if (!src) continue
    if (src.startsWith('/')) {
      expect(existsSync(`public${decodeURIComponent(src)}`), `이미지 파일 결측: ${e.file} → ${src}`).toBe(true)
    }
    const cap = e.data['이미지설명']
    expect(typeof cap === 'string' && cap.trim() !== '', `이미지설명 결측: ${e.file}`).toBe(true)
  }
})
