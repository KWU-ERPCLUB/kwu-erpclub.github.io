import { expect, test } from 'vitest'
import { sortSeminars, extractTopics, filterByTopic, isUpcoming, todayString, splitSeminarBody, splitLead } from './seminars-logic.js'

const S = (slug, date, extra = {}) => ({ slug, date, title: slug, 회차: slug, 유형: '인지', body: '', ...extra })
const list = [S('a', '2026-06-01'), S('b', '2026-09-05'), S('c', '2026-08-20'), S('d', '2026-07-24')]

test('sortSeminars — newest(기본)=date 내림차순', () => {
  expect(sortSeminars(list).map((s) => s.slug)).toEqual(['b', 'c', 'd', 'a'])
})

test('sortSeminars — oldest=date 오름차순', () => {
  expect(sortSeminars(list, 'oldest').map((s) => s.slug)).toEqual(['a', 'd', 'c', 'b'])
})

test('sortSeminars — 원본 불변(순수)·빈 입력 안전', () => {
  const copy = [...list]
  sortSeminars(list)
  expect(list.map((s) => s.slug)).toEqual(copy.map((s) => s.slug))
  expect(sortSeminars([])).toEqual([])
  expect(sortSeminars(undefined)).toEqual([])
})

test('extractTopics — 등장 주제만·TOPICS enum 순서로 안정 정렬·중복 제거', () => {
  const withTopics = [
    S('a', '2026-06-01', { 주제: '워크플로·자동화' }),
    S('b', '2026-07-01', { 주제: '에이전트' }),
    S('c', '2026-08-01', { 주제: '에이전트' }), // 중복
    S('d', '2026-09-01' /* 주제 없음 */),
  ]
  // enum 순서 = [에이전트, 모델·플랫폼, 워크플로·자동화, ...] → 에이전트가 워크플로보다 앞
  expect(extractTopics(withTopics)).toEqual(['에이전트', '워크플로·자동화'])
  expect(extractTopics([])).toEqual([])
})

test('filterByTopic — null=전체·일치만 통과', () => {
  const data = [S('a', '2026-06-01', { 주제: '에이전트' }), S('b', '2026-07-01', { 주제: '거버넌스·리스크' })]
  expect(filterByTopic(data, null).map((s) => s.slug)).toEqual(['a', 'b'])
  expect(filterByTopic(data, '에이전트').map((s) => s.slug)).toEqual(['a'])
  expect(filterByTopic(data, '없는주제')).toEqual([])
})

test('isUpcoming — date>today만 예정(경계=오늘은 예정 아님)', () => {
  expect(isUpcoming(S('x', '2026-08-07'), '2026-07-25')).toBe(true)
  expect(isUpcoming(S('x', '2026-07-25'), '2026-07-25')).toBe(false) // 오늘 = 예정 아님
  expect(isUpcoming(S('x', '2026-06-01'), '2026-07-25')).toBe(false)
  expect(isUpcoming({}, '2026-07-25')).toBe(false)
})

test('todayString — 고정 Date 주입 시 로컬 YYYY-MM-DD', () => {
  expect(todayString(new Date(2026, 6, 24))).toBe('2026-07-24') // month 6 = 7월
  expect(todayString(new Date(2026, 0, 5))).toBe('2026-01-05')
})

test('splitSeminarBody — ## 헤딩 기준 분할', () => {
  const { intro, sections } = splitSeminarBody('서문 문장\n\n## 준비\n환경 세팅\n\n## 진행\n실습 단계\n\n## 재현 가이드\n혼자 따라하기')
  expect(intro).toBe('서문 문장')
  expect(sections['준비']).toBe('환경 세팅')
  expect(sections['진행']).toBe('실습 단계')
  expect(sections['재현 가이드']).toBe('혼자 따라하기')
})

test('splitSeminarBody — 헤딩 없는 본문 = intro만', () => {
  const { intro, sections } = splitSeminarBody('그냥 본문')
  expect(intro).toBe('그냥 본문')
  expect(Object.keys(sections)).toEqual([])
})

test('splitLead — 첫 단락=리드, 나머지=rest', () => {
  expect(splitLead('첫 문장.\n\n둘째 단락.\n\n셋째.')).toEqual({ lead: '첫 문장.', rest: '둘째 단락.\n\n셋째.' })
  expect(splitLead('한 단락뿐')).toEqual({ lead: '한 단락뿐', rest: '' })
  expect(splitLead('')).toEqual({ lead: '', rest: '' })
})
