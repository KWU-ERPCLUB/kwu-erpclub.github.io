import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import SeminarsTimeline, { SeminarTimeline, SeminarTimelineItem } from './SeminarsTimeline.jsx'

const noop = () => {}
const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')
const TODAY = '2026-07-25'

const base = (over = {}) => ({
  slug: 's', title: '세미나 제목', author: '홍', date: '2026-07-10', 회차: '1', 유형: '인지', body: '서문 문장.', ...over,
})

// ── SeminarTimeline (프리젠테이션 리스트) ──
test('빈 상태 = 디자인된 1줄 "세미나 기록 아직 없음"', () => {
  const html = renderToString(<SeminarTimeline items={[]} today={TODAY} />)
  expect(html).toContain('sem-tl-empty')
  expect(html).toContain('세미나 기록 아직 없음')
})

test('타임라인 렌더 — 주어진 순서대로 항목 + 첫 항목만 is-featured(최신 크게)', () => {
  const items = [base({ slug: 'a', title: '최신글', date: '2026-08-01' }), base({ slug: 'b', title: '이전글', date: '2026-06-01' })]
  const html = flat(<SeminarTimeline items={items} today={TODAY} onOpen={noop} />)
  expect(html).toContain('sem-tl') // 타임라인 ol
  expect(html).toContain('최신글')
  expect(html).toContain('이전글')
  // 첫 항목만 featured — is-featured 1회
  expect((html.match(/is-featured/g) || []).length).toBe(1)
  expect(html.indexOf('최신글')).toBeLessThan(html.indexOf('이전글')) // 주어진 순서 유지
})

test('v3.1 강조 — 최신(featured) 항목만 버건디 언더바(sem-tl-underbar) 1개', () => {
  const items = [base({ slug: 'a', date: '2026-08-01' }), base({ slug: 'b', date: '2026-06-01' })]
  const html = flat(<SeminarTimeline items={items} today={TODAY} onOpen={noop} />)
  expect(html).toContain('sem-tl-underbar')
  expect((html.match(/sem-tl-underbar/g) || []).length).toBe(1) // featured 1개만
})

// ── SeminarTimelineItem (항목 단위 — 픽스처 주입) ──
test('겹침 카드 — 썸네일 2장이면 is-stack + 뒷장(back) 렌더 + 슬라이드 링크', () => {
  const s = base({ 썸네일: ['/slides/s1/thumb-1.png', '/slides/s1/thumb-2.png'], 슬라이드: 'https://slides/s1/' })
  const html = flat(<SeminarTimelineItem s={s} today={TODAY} onOpen={noop} />)
  expect(html).toContain('is-stack') // 겹침 모드
  expect(html).toContain('sem-thumb-back') // 뒷장
  expect(html).toContain('/slides/s1/thumb-2.png')
  expect(html).toContain('https://slides/s1/') // 클릭 = 발표자료 링크
})

test('겹침 카드 fallback — 썸네일 1장이면 단일(no is-stack·back 없음)', () => {
  const s = base({ 썸네일: ['/slides/s1/thumb-1.png'], 슬라이드: 'https://slides/s1/' })
  const html = flat(<SeminarTimelineItem s={s} today={TODAY} onOpen={noop} />)
  expect(html).toContain('sem-thumb') // 카드 존재
  expect(html).not.toContain('is-stack') // 단일
  expect(html).not.toContain('sem-thumb-back') // 뒷장 없음
})

test('겹침 카드 fallback — 썸네일 없으면 카드 자체 비표시', () => {
  const html = flat(<SeminarTimelineItem s={base()} today={TODAY} onOpen={noop} />)
  expect(html).not.toContain('sem-thumb') // 카드 없음
})

test('예정 배지 — date>today면 "예정", 과거면 없음', () => {
  const future = flat(<SeminarTimelineItem s={base({ date: '2026-08-07' })} today={TODAY} onOpen={noop} />)
  expect(future).toContain('sem-soon-badge')
  expect(future).toContain('예정')
  const past = flat(<SeminarTimelineItem s={base({ date: '2026-06-01' })} today={TODAY} onOpen={noop} />)
  expect(past).not.toContain('sem-soon-badge')
})

test('간략 설명 — 요점 배열이면 불릿, 없으면 본문 발췌', () => {
  const withPts = flat(<SeminarTimelineItem s={base({ 요점: ['첫 요점', '둘째 요점'] })} today={TODAY} onOpen={noop} />)
  expect(withPts).toContain('sem-tl-points')
  expect(withPts).toContain('첫 요점')
  expect(withPts).toContain('둘째 요점')
  const noPts = flat(<SeminarTimelineItem s={base({ body: '이 세미나는 에이전트 개론을 다룸.' })} today={TODAY} onOpen={noop} />)
  expect(noPts).toContain('sem-tl-excerpt')
  expect(noPts).toContain('에이전트 개론')
})

test('메타 칩 — 회차·유형·주제(있을 때)', () => {
  const html = flat(<SeminarTimelineItem s={base({ 회차: '2', 유형: '실습', 주제: '에이전트' })} today={TODAY} onOpen={noop} />)
  expect(html).toContain('2회')
  expect(html).toContain('실습')
  expect(html).toContain('에이전트')
})

// ── SeminarsTimeline (컨테이너 — 소개·필터 바) ──
test('필터 바 — 주제 탭(전체 + 등장 주제만) + 정렬 토글 기본 최신순', () => {
  const all = [base({ slug: 'a', 주제: '에이전트' }), base({ slug: 'b', 주제: '거버넌스·리스크' })]
  const html = flat(<SeminarsTimeline all={all} today={TODAY} onOpen={noop} />)
  expect(html).toContain('sem-filter') // 필터 바
  expect(html).toContain('전체') // 전체 탭
  expect(html).toContain('에이전트') // 등장 주제
  expect(html).toContain('거버넌스·리스크')
  expect(html).not.toContain('모델·플랫폼') // 미등장 주제는 탭 없음
  expect(html).toContain('최신순') // 정렬 토글 기본 라벨
  expect(html).toContain('SEMINARS') // 소개 눈썹
})
