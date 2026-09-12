import { expect, test } from 'vitest'
import { existsSync } from 'node:fs'
import { readEntries } from '../../scripts/content-files.mjs'
import { resolveThumb, resolveHero, captionOf, parseWeekLabel, seriesBadge } from './thumb-resolver.js'

// 2026-09-11 개편 — 썸네일은 frontmatter `이미지` 1계층뿐. 자동 폴백(시리즈 커버·본문 도판·로고·스톡·타이포 커버) 전부 폐지.
const base = { slug: 's', title: '제목', author: 'A', date: '2026-08-05', body: '', 설명: 'd' }

test('resolveThumb — 이미지 있으면 field(cover) + alt=이미지설명', () => {
  const t = resolveThumb({ ...base, 이미지: '/img/covers/x.jpg', 이미지설명: '무엇 — 관계' })
  expect(t).toEqual({ kind: 'field', src: '/img/covers/x.jpg', fit: 'cover', alt: '무엇 — 관계', badge: null })
})

test('resolveThumb — 이미지 없으면 none(자동 폴백 없음) · 본문 도판·브랜드명·주제가 있어도 무시', () => {
  const t = resolveThumb({ ...base, title: 'Claude 정리', 주제: '에이전트', body: '![x](/img/기사/a.svg)' })
  expect(t.kind).toBe('none')
  expect(t.src).toBe(null)
  expect(t.alt).toBe('')
  expect(resolveThumb(null).kind).toBe('none')
  expect(resolveThumb({}).kind).toBe('none')
})

test('주간 글 = 같은 이미지 계층 + 주차 배지(제목에서 파싱)', () => {
  const w = { ...base, slug: '2026-09-14-bapzzi-weekly-trend-w37', title: '주간 AI 트렌드 9월 2주', 이미지: '/img/covers/w.jpg', 이미지설명: 'TOP 1 소재 이미지' }
  expect(parseWeekLabel(w.title)).toBe('9월 2주')
  expect(parseWeekLabel('주간 AI 트렌드 — 9월 2주')).toBe('9월 2주')  // 구 대시 서식(보관 7편)도 그대로 파싱
  expect(parseWeekLabel('회차 없음')).toBe(null)
  expect(seriesBadge(w)).toBe('주간 · 9월 2주')
  expect(seriesBadge({ ...w, title: '주간 AI 트렌드' })).toBe('주간')
  expect(seriesBadge(base)).toBe(null)
  const t = resolveThumb(w)
  expect(t.kind).toBe('field')
  expect(t.src).toBe('/img/covers/w.jpg')   // 고정 커버가 개별 이미지를 덮지 않는다(2026-09-11)
  expect(t.badge).toBe('주간 · 9월 2주')
})

test('captionOf = 이미지설명 트림, 없으면 빈 문자열', () => {
  expect(captionOf({ 이미지설명: '  로고 — 발표 주체  ' })).toBe('로고 — 발표 주체')
  expect(captionOf({})).toBe('')
  expect(captionOf(null)).toBe('')
})

test('resolveHero = 같은 이미지 + 캡션. 없으면 null', () => {
  expect(resolveHero({ ...base, 이미지: '/img/covers/x.jpg', 이미지설명: '캡션' })).toEqual({ src: '/img/covers/x.jpg', fit: 'cover', caption: '캡션' })
  expect(resolveHero({ ...base, title: 'Claude 정리', 주제: '에이전트', body: '![x](/img/기사/a.svg)' })).toBeNull()
  expect(resolveHero(null)).toBeNull()
})

// 기고가 지정한 이미지가 실재하는지 + 캡션이 붙었는지(오너 규칙 = CONTRIBUTING 「이미지·이미지설명」).
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
