import { expect, test } from 'vitest'
import { postingStatus, groupPostings, filterPostings, postingAgendaItems, POSTING_KINDS, postingRank, sectionPostings, searchPostings } from './postings-logic.js'

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

test('묶음 분리·정렬 — 활성(마감 임박순) / 상시 / 마감(최근 먼저)', () => {
  const rows = [
    row({ id: 'a', 접수마감: '2026-09-25' }),
    row({ id: 'b', 접수마감: '2026-09-10' }),
    row({ id: 'c', 접수마감: '2026-09-30', 고정: true }),
    row({ id: 'd', 접수마감: null }),
    row({ id: 'e', 접수마감: '2026-09-01' }),
    row({ id: 'f', 접수마감: '2026-08-20' }),
  ]
  const { active, always, closed } = groupPostings(rows, TODAY)
  expect(active.map((r) => r.id)).toEqual(['b', 'a', 'c'])   // 관심 지정 없음 = 순수 마감 임박순
  expect(always.map((r) => r.id)).toEqual(['d'])
  expect(closed.map((r) => r.id)).toEqual(['e', 'f'])        // 최근 마감 먼저
})

test('종류 필터 — 전체=통과, 그 외=일치만', () => {
  const rows = [row({ id: 'a', 종류: '채용' }), row({ id: 'b', 종류: '자격증' })]
  expect(filterPostings(rows, '전체')).toHaveLength(2)
  expect(filterPostings(rows, '채용').map((r) => r.id)).toEqual(['a'])
  expect(POSTING_KINDS).toEqual(['공모전', '채용', '자격증', '교내활동'])
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

// 2단(2026-08-19 오너 재판정) — 고정은 정렬에서 빠진다(오너가 설정한 적 없는 값이라 위계 근거가 없음).
test('우선순위 2단 — ★ 관심이 먼저, 나머지는 고정 여부와 무관하게 임박순', () => {
  const rows = [
    row({ id: 'plain-late', 접수마감: '2026-09-30' }),
    row({ id: 'pin', 접수마감: '2026-09-25', 고정: true }),
    row({ id: 'star', 접수마감: '2026-10-20' }),
    row({ id: 'plain-soon', 접수마감: '2026-09-10' }),
  ]
  const { active } = groupPostings(rows, TODAY, ['star'])
  expect(active.map((r) => r.id)).toEqual(['star', 'plain-soon', 'pin', 'plain-late'])
  expect(postingRank(rows[2], ['star'])).toBe(0)
  expect(postingRank(rows[1], ['star'])).toBe(1)   // 고정이어도 관심이 아니면 같은 단
  expect(postingRank(rows[0], ['star'])).toBe(1)
})

test('검색 — 제목·주최·출처·분류를 훑고, 낱말 여러 개는 전부 포함(AND)', () => {
  const rows = [
    row({ id: 'a', 제목: '삼성 하반기 신입 공채', 주최: '삼성', 출처: '잡코리아' }),
    row({ id: 'b', 제목: 'LG 하반기 인턴', 주최: 'LG', 출처: '링커리어' }),
    row({ id: 'c', 제목: 'NAIS AI 해커톤', 주최: 'NST', 출처: '링커리어' }),
  ]
  expect(searchPostings(rows, '하반기').map((r) => r.id)).toEqual(['a', 'b'])
  expect(searchPostings(rows, '하반기 인턴').map((r) => r.id)).toEqual(['b'])   // AND
  expect(searchPostings(rows, '링커리어').map((r) => r.id)).toEqual(['b', 'c']) // 출처로도 찾힌다
  expect(searchPostings(rows, 'nais').map((r) => r.id)).toEqual(['c'])          // 대소문자 무시
  expect(searchPostings(rows, '  ')).toHaveLength(3)                            // 빈 검색 = 전체 통과
  expect(searchPostings(rows, '없는말')).toHaveLength(0)
})

test('섹션 분할 — 빈 묶음은 빠지고, 상시는 맨 뒤 한 섹션', () => {
  const active = [row({ id: 'star', 접수마감: '2026-09-20' }), row({ id: 'plain', 접수마감: '2026-09-21' })]
  const always = [row({ id: 'ever', 접수마감: null })]
  const secs = sectionPostings(active, always, ['star'])
  expect(secs.map((s) => s.key)).toEqual(['★ 내 관심', '전체', '상시'])
  expect(secs[2].label).toBe('상시 모집')
  expect(secs[0].items.map((r) => r.id)).toEqual(['star'])
  expect(secs[2].items.map((r) => r.id)).toEqual(['ever'])
  expect(sectionPostings([], [], []).length).toBe(0)
})

test('캘린더 합류 중요(★) = 고정 겸용 — 다가오는 업무 노출 플래그', () => {
  const items = postingAgendaItems([
    row({ id: 'p1', 접수마감: '2026-09-09', 고정: true }),
    row({ id: 'p2', 접수마감: '2026-09-20', 고정: false }),
  ])
  expect(items.map((i) => i['중요'])).toEqual([true, false])
})
