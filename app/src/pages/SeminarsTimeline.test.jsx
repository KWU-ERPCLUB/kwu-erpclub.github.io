import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import SeminarsTimeline, { SeminarTimeline, SeminarFeature, SeminarCard } from './SeminarsTimeline.jsx'

const noop = () => {}
const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')
const TODAY = '2026-07-25'

const base = (over = {}) => ({
  slug: 's', title: '세미나 제목', author: '홍', date: '2026-07-10', 회차: '1', 유형: '인지', body: '서문 문장.', ...over,
})

// ── SeminarTimeline (프리젠테이션 리스트 — 4차: 피처 밴드 + 3열 그리드) ──
test('빈 상태 = 디자인된 1줄 "세미나 기록 아직 없음"', () => {
  const html = renderToString(<SeminarTimeline items={[]} today={TODAY} />)
  expect(html).toContain('sem-tl-empty')
  expect(html).toContain('세미나 기록 아직 없음')
})

test('구조 = 첫 항목 피처 밴드(sem-feat) + 나머지 그리드 카드(sem-card)', () => {
  const items = [base({ slug: 'a', title: '최신글', date: '2026-08-01' }), base({ slug: 'b', title: '이전글', date: '2026-06-01' })]
  const html = flat(<SeminarTimeline items={items} today={TODAY} onOpen={noop} />)
  expect((html.match(/class="sem-feat[" ]/g) || []).length).toBe(1) // 피처 밴드 = 1개
  expect(html).toContain('최신글')
  expect(html).toContain('sem-grid') // 3열 그리드
  expect(html).toContain('sem-card')
  expect(html).toContain('이전글')
  expect(html.indexOf('최신글')).toBeLessThan(html.indexOf('이전글')) // 피처 먼저
  // 1건뿐이면 그리드 없음
  const one = flat(<SeminarTimeline items={[base()]} today={TODAY} onOpen={noop} />)
  expect(one).not.toContain('sem-grid')
})

// 피처 밴드 — 예정이면 블랙 밴드(is-next·NEXT SEMINAR), 과거면 라이트 밴드(LATEST SEMINAR).
test('피처 = 예정이면 is-next + NEXT SEMINAR, 과거면 LATEST SEMINAR(밴드 골격 동일)', () => {
  const next = flat(<SeminarFeature s={base({ date: '2026-08-07', 회차: '2' })} today={TODAY} onOpen={noop} />)
  expect(next).toContain('is-next')
  expect(next).toContain('NEXT SEMINAR')
  expect(next).toContain('sem-next-ep') // 회차 숫자
  expect(next).toContain('2026.08.07')
  expect(next).toContain('sem-soon-badge') // 예정 배지
  const past = flat(<SeminarFeature s={base({ date: '2026-06-01' })} today={TODAY} onOpen={noop} />)
  expect(past).not.toContain('is-next')
  expect(past).toContain('LATEST SEMINAR')
  expect(past).not.toContain('sem-soon-badge')
})

test('피처 — 일정미정 = 예정 취급(is-next) + 날짜 대신 "일정 미정"', () => {
  const html = flat(<SeminarFeature s={base({ date: '2026-06-01', 일정미정: true })} today={TODAY} onOpen={noop} />)
  expect(html).toContain('is-next')
  expect(html).toContain('일정 미정')
  expect(html).not.toContain('2026.06.01')
})

// CTA 명확화(피드백 "눌러야 될 것 같이 안 생겼다") — 문장 버튼 2종.
test('피처 CTA — "세미나 내용 보기" 상시 + 슬라이드 있으면 "발표자료 PDF 열기"', () => {
  const withSlide = flat(<SeminarFeature s={base({ 슬라이드: 'https://slides/s1/' })} today={TODAY} onOpen={noop} />)
  expect(withSlide).toContain('세미나 내용 보기')
  expect(withSlide).toContain('발표자료 PDF 열기')
  expect(withSlide).toContain('https://slides/s1/')
  const noSlide = flat(<SeminarFeature s={base()} today={TODAY} onOpen={noop} />)
  expect(noSlide).toContain('세미나 내용 보기')
  expect(noSlide).not.toContain('발표자료 PDF 열기')
})

test('피처 썸네일 — 첫 장 1장만(겹침 스택 폐지), 없으면 비표시', () => {
  const s = base({ 썸네일: ['/slides/s1/thumb-1.png', '/slides/s1/thumb-2.png'], 슬라이드: 'https://slides/s1/' })
  const html = flat(<SeminarFeature s={s} today={TODAY} onOpen={noop} />)
  expect(html).toContain('sem-feat-thumb')
  expect(html).toContain('/slides/s1/thumb-1.png')
  expect(html).not.toContain('/slides/s1/thumb-2.png') // 뒷장 폐지
  expect(html).not.toContain('is-stack')
  expect(flat(<SeminarFeature s={base()} today={TODAY} onOpen={noop} />)).not.toContain('sem-feat-thumb')
})

test('피처 설명 — 요점 배열이면 불릿, 없으면 본문 발췌', () => {
  const withPts = flat(<SeminarFeature s={base({ 요점: ['첫 요점', '둘째 요점'] })} today={TODAY} onOpen={noop} />)
  expect(withPts).toContain('sem-tl-points')
  expect(withPts).toContain('첫 요점')
  const noPts = flat(<SeminarFeature s={base({ body: '이 세미나는 에이전트 개론을 다룸.' })} today={TODAY} onOpen={noop} />)
  expect(noPts).toContain('sem-tl-excerpt')
  expect(noPts).toContain('에이전트 개론')
})

// ── SeminarCard (그리드 항목) ──
test('그리드 카드 = 날짜·칩(회차·유형·주제)·제목 + 슬라이드 있으면 PDF 링크', () => {
  const s = base({ slug: 'c', 회차: '2', 유형: '실습', 주제: '에이전트', 슬라이드: 'https://slides/s2/', 썸네일: ['/t.png'] })
  const html = flat(<SeminarCard s={s} today={TODAY} onOpen={noop} />)
  expect(html).toContain('sem-card-date')
  expect(html).toContain('2026.07.10')
  expect(html).toContain('2회')
  expect(html).toContain('실습')
  expect(html).toContain('에이전트')
  expect(html).toContain('sem-card-title')
  expect(html).toContain('sem-card-thumb')
  expect(html).toContain('발표자료 PDF 열기')
  const noSlide = flat(<SeminarCard s={base()} today={TODAY} onOpen={noop} />)
  expect(noSlide).not.toContain('발표자료 PDF 열기')
  expect(noSlide).not.toContain('sem-card-thumb') // 썸네일 없으면 프레임 없음
})

test('그리드 카드 — 예정 배지: date>today면 "예정", 과거면 없음', () => {
  const future = flat(<SeminarCard s={base({ date: '2026-08-07' })} today={TODAY} onOpen={noop} />)
  expect(future).toContain('sem-soon-badge')
  const past = flat(<SeminarCard s={base({ date: '2026-06-01' })} today={TODAY} onOpen={noop} />)
  expect(past).not.toContain('sem-soon-badge')
})

// ── SeminarsTimeline (컨테이너 — 헤드·필터 바) ──
test('필터 바 — 주제 탭(전체 + 등장 주제만) + 정렬 토글 기본 최신순 + 중앙 헤드', () => {
  const all = [base({ slug: 'a', 주제: '에이전트' }), base({ slug: 'b', 주제: '거버넌스·리스크' })]
  const html = flat(<SeminarsTimeline all={all} today={TODAY} onOpen={noop} />)
  expect(html).toContain('sem-filter')
  expect(html).toContain('전체')
  expect(html).toContain('에이전트')
  expect(html).toContain('거버넌스·리스크')
  expect(html).not.toContain('모델·플랫폼') // 미등장 주제는 탭 없음
  expect(html).toContain('최신순')
  expect(html).toContain('SEMINARS') // 헤드 키커
  expect(html).toContain('공간입니다') // 문장형 설명(4차)
})

// 4차 개편 — 좌 라벨 레일(ARCHIVE·■)·세로 타임라인 폐지.
test('4차 — 구 골격(sem-col-label·sem-tl-item·pg-sq) 부재', () => {
  const html = flat(<SeminarsTimeline all={[base()]} today={TODAY} onOpen={noop} />)
  expect(html).not.toContain('sem-col-label')
  expect(html).not.toContain('sem-col-sq')
  expect(html).not.toContain('sem-tl-item')
  expect(html).not.toContain('pg-sq')
})
