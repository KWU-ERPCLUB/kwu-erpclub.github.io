import { expect, test } from 'vitest'
import {
  TAXONOMY, taxonomyOptions, CAL_CATEGORIES, DEFAULT_SUBS,
  effectiveSubs, subMatches, hasSubRow, eventCategory, filterAgendaBySubs, planToggle,
} from './postings-taxonomy.js'
import { postingAgendaItems, filterPostings } from './postings-logic.js'

test('레지스트리 — 공고 4종 전부 세부 목록 보유, 옵션은 은퇴 값 제외', () => {
  for (const kind of ['공모전', '채용', '자격시험', '대외활동']) {
    expect(TAXONOMY[kind].length).toBeGreaterThan(0)
    expect(taxonomyOptions(kind)).toContain('기타')
  }
  expect(taxonomyOptions('학사')).toEqual([])   // 일정 카테고리 = 세부 없음
  expect(CAL_CATEGORIES).toEqual(['공모전', '채용', '자격시험', '대외활동', '학사', 'AIM'])
})

test('기본 구독 해석 — 행 0건 = 학사+AIM / null(0014 미적용) = null 그대로', () => {
  expect(effectiveSubs([])).toEqual(DEFAULT_SUBS)
  expect(effectiveSubs(null)).toBeNull()
  const mine = [{ 종류: '공모전', 분류: '' }]
  expect(effectiveSubs(mine)).toBe(mine)
})

test('매칭 — 분류 빈 값 = 종류 전체, 값 = 그 세부만', () => {
  const subs = [{ 종류: '자격시험', 분류: 'ADsP' }, { 종류: '공모전', 분류: '' }]
  expect(subMatches(subs, '자격시험', 'ADsP')).toBe(true)
  expect(subMatches(subs, '자격시험', 'SQLD')).toBe(false)
  expect(subMatches(subs, '공모전', '기업')).toBe(true)     // 전체 구독이 세부를 덮는다
  expect(subMatches(subs, '채용', '대기업')).toBe(false)
  // hasSubRow = 정확한 행 존재만(전체 구독 ≠ 세부 행)
  expect(hasSubRow(subs, '공모전', '')).toBe(true)
  expect(hasSubRow(subs, '공모전', '기업')).toBe(false)
})

test('event 카테고리 파생 — 학사만 학사, 나머지 4종 = AIM', () => {
  expect(eventCategory({ 종류: '학사' })).toBe('학사')
  for (const k of ['일정', '세미나', '모집', '마감']) expect(eventCategory({ 종류: k })).toBe('AIM')
})

test('캘린더 구독 필터 — 공고=구독분만, 과제·세션은 상시 통과', () => {
  const posting = (over) => ({ id: 'p', 제목: 't', 종류: '공모전', url: 'https://example.com', 코멘트: 'c', 고정: false, ...over })
  const items = [
    ...postingAgendaItems([
      posting({ id: 'p1', 종류: '자격시험', 분류: 'ADsP', 접수마감: '2026-09-09' }),
      posting({ id: 'p2', 종류: '채용', 분류: '대기업', 접수마감: '2026-09-20' }),
    ]),
    { date: '2026-09-10', 제목: '과제 마감', 종류: '과제', source: 'assignment', id: 'a1' },
    { date: '2026-09-11', 제목: '세미나', 종류: '세미나', source: 'event', id: 'e1' },
    { date: '2026-09-12', 제목: '중간고사', 종류: '학사', source: 'event', id: 'e2' },
  ]
  // 행 0건 = 기본(학사+AIM): 공고 전부 제외, 학사·AIM events·과제 통과
  expect(filterAgendaBySubs(items, []).map((i) => i.id)).toEqual(['a1', 'e1', 'e2'])
  // ADsP만 구독: 자격시험 ADsP 통과, 채용 제외, events도 구독 행 따라 판정(학사·AIM 미구독 = 제외)
  expect(filterAgendaBySubs(items, [{ 종류: '자격시험', 분류: 'ADsP' }]).map((i) => i.id)).toEqual(['p1-due', 'a1'])
  // null(0014 미적용) = 강등: 전부 통과(현행 화면)
  expect(filterAgendaBySubs(items, null)).toHaveLength(5)
})

test('첫 토글 실체화 — 행 0건이면 기본 2행을 먼저 쓰고 요청 적용, 기본 항목 자체를 끄면 나머지만 실체화', () => {
  expect(planToggle([], '공모전', '', true).writes).toEqual([
    { 종류: '학사', 분류: '', on: true }, { 종류: 'AIM', 분류: '', on: true }, { 종류: '공모전', 분류: '', on: true },
  ])
  expect(planToggle([], '학사', '', false).writes).toEqual([
    { 종류: 'AIM', 분류: '', on: true }, { 종류: '학사', 분류: '', on: false },
  ])
  // 이미 행이 있으면 요청 1건만
  expect(planToggle([{ 종류: '학사', 분류: '' }], '채용', '대기업', true).writes).toEqual([
    { 종류: '채용', 분류: '대기업', on: true },
  ])
})

test('공고 탭 세부 필터 — 종류+분류 AND, 빈 값·전체 = 통과', () => {
  const rows = [
    { id: 'a', 종류: '자격시험', 분류: 'ADsP' },
    { id: 'b', 종류: '자격시험', 분류: 'SQLD' },
    { id: 'c', 종류: '채용', 분류: '대기업' },
  ]
  expect(filterPostings(rows, '자격시험', 'ADsP').map((r) => r.id)).toEqual(['a'])
  expect(filterPostings(rows, '자격시험', '전체')).toHaveLength(2)
  expect(filterPostings(rows, '자격시험')).toHaveLength(2)
})
