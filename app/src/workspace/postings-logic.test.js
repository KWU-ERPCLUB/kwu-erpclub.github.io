import { expect, test } from 'vitest'
import { postingStatus, groupPostings, filterPostings, postingAgendaItems, POSTING_KINDS } from './postings-logic.js'

const TODAY = '2026-09-08'
const row = (over) => ({ id: 'x', 제목: '공고', 종류: '공모전', url: 'https://example.com', 코멘트: 'c', 고정: false, ...over })

test('상태 파생 — 접수마감 없음=상시 / 시작 전=접수전 / 마감 지남=마감 / 그 외=접수중', () => {
  expect(postingStatus(row({ 접수마감: null }), TODAY)).toBe('상시')
  expect(postingStatus(row({ 접수시작: '2026-09-10', 접수마감: '2026-09-20' }), TODAY)).toBe('접수전')
  expect(postingStatus(row({ 접수마감: '2026-09-07' }), TODAY)).toBe('마감')
  expect(postingStatus(row({ 접수시작: '2026-09-01', 접수마감: '2026-09-20' }), TODAY)).toBe('접수중')
  expect(postingStatus(row({ 접수마감: TODAY }), TODAY)).toBe('접수중')   // 마감 당일 = 아직 접수중
})

test('접수 없는 시험 공지 — 시험일 전=예정, 지나면=마감 (예: ADsP 회차 시험일만 공지)', () => {
  expect(postingStatus(row({ 접수마감: null, 시험일: '2026-09-20' }), TODAY)).toBe('예정')
  expect(postingStatus(row({ 접수마감: null, 시험일: TODAY }), TODAY)).toBe('예정')     // 시험 당일까지 표시
  expect(postingStatus(row({ 접수마감: null, 시험일: '2026-09-01' }), TODAY)).toBe('마감')
  // 예정 항목은 활성 묶음에서 시험일 기준으로 임박 정렬
  const { active } = groupPostings([
    row({ id: 'a', 접수마감: '2026-09-25' }),
    row({ id: 'b', 접수마감: null, 시험일: '2026-09-12' }),
  ], TODAY)
  expect(active.map((r) => r.id)).toEqual(['b', 'a'])
})

test('묶음 분리·정렬 — 활성(고정→마감 임박순) / 상시 / 마감(최근 먼저)', () => {
  const rows = [
    row({ id: 'a', 접수마감: '2026-09-25' }),
    row({ id: 'b', 접수마감: '2026-09-10' }),
    row({ id: 'c', 접수마감: '2026-09-30', 고정: true }),
    row({ id: 'd', 접수마감: null }),
    row({ id: 'e', 접수마감: '2026-09-01' }),
    row({ id: 'f', 접수마감: '2026-08-20' }),
  ]
  const { active, always, closed } = groupPostings(rows, TODAY)
  expect(active.map((r) => r.id)).toEqual(['c', 'b', 'a'])   // 고정 먼저, 나머지 마감 임박순
  expect(always.map((r) => r.id)).toEqual(['d'])
  expect(closed.map((r) => r.id)).toEqual(['e', 'f'])        // 최근 마감 먼저
})

test('종류 필터 — 전체=통과, 그 외=일치만', () => {
  const rows = [row({ id: 'a', 종류: '채용' }), row({ id: 'b', 종류: '자격시험' })]
  expect(filterPostings(rows, '전체')).toHaveLength(2)
  expect(filterPostings(rows, '채용').map((r) => r.id)).toEqual(['a'])
  expect(POSTING_KINDS).toEqual(['공모전', '채용', '자격시험', '대외활동'])
})

test('캘린더 합류 — 접수마감·시험일이 종류 "공고" 항목으로 변환(없는 날짜는 생략)', () => {
  const items = postingAgendaItems([
    row({ id: 'p1', 제목: 'ADsP 51회', 접수시작: '2026-09-05', 접수마감: '2026-09-09', 시험일: '2026-10-11', 코멘트: '접수창 5일' }),
    row({ id: 'p2', 제목: '상시 채용', 접수마감: null }),
  ])
  expect(items).toHaveLength(2)
  expect(items[0]).toMatchObject({ date: '2026-09-09', 제목: '접수 마감 — ADsP 51회', 종류: '공고', source: 'posting', 설명: '접수창 5일' })
  expect(items[1]).toMatchObject({ date: '2026-10-11', 제목: '시험일 — ADsP 51회', 종류: '공고' })
})

test('캘린더 합류 중요(★) = 고정 겸용 — 다가오는 업무 노출 플래그', () => {
  const items = postingAgendaItems([
    row({ id: 'p1', 접수마감: '2026-09-09', 고정: true }),
    row({ id: 'p2', 접수마감: '2026-09-20', 고정: false }),
  ])
  expect(items.map((i) => i['중요'])).toEqual([true, false])
})
