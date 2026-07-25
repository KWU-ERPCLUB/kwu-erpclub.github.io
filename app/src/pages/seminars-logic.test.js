import { expect, test } from 'vitest'
import { splitByDate, nextSeminar, todayString, daysUntil, ddayLabel } from './seminars-logic.js'

const S = (slug, date) => ({ slug, date, title: slug, 회차: slug, 유형: '인지', body: '' })
const list = [S('a', '2026-06-01'), S('b', '2026-09-05'), S('c', '2026-08-20'), S('d', '2026-07-24')]

test('splitByDate — 예정(오늘 포함, 오름차순)·과거(역시간순) 분리', () => {
  const { upcoming, past } = splitByDate(list, '2026-07-24')
  // 오늘(d)·미래(c,b) = 예정, 오름차순: d(07-24) → c(08-20) → b(09-05)
  expect(upcoming.map((s) => s.slug)).toEqual(['d', 'c', 'b'])
  // 과거(a) = 역시간순
  expect(past.map((s) => s.slug)).toEqual(['a'])
})

test('splitByDate — date == today는 예정(경계 포함)', () => {
  const { upcoming, past } = splitByDate([S('x', '2026-07-24')], '2026-07-24')
  expect(upcoming.map((s) => s.slug)).toEqual(['x'])
  expect(past).toEqual([])
})

test('nextSeminar — 예정 중 최근접 1건', () => {
  expect(nextSeminar(list, '2026-07-24').slug).toBe('d')
})

test('nextSeminar — 예정 0건이면 null', () => {
  expect(nextSeminar([S('a', '2026-06-01')], '2026-07-24')).toBeNull()
})

test('splitByDate — 빈/undefined 입력 안전', () => {
  expect(splitByDate([], '2026-07-24')).toEqual({ upcoming: [], past: [] })
  expect(splitByDate(undefined, '2026-07-24')).toEqual({ upcoming: [], past: [] })
})

test('todayString — 고정 Date 주입 시 로컬 YYYY-MM-DD', () => {
  // 로컬 자정 기준 날짜 성분만 검증(시계·타임존 비의존)
  expect(todayString(new Date(2026, 6, 24))).toBe('2026-07-24') // month 6 = 7월
  expect(todayString(new Date(2026, 0, 5))).toBe('2026-01-05')
})

test('daysUntil — today 주입식 남은 일수(미래=양수·당일=0·과거=음수)', () => {
  expect(daysUntil('2026-09-01', '2026-08-25')).toBe(7) // 7일 뒤
  expect(daysUntil('2026-09-01', '2026-09-01')).toBe(0) // 당일
  expect(daysUntil('2026-08-20', '2026-09-01')).toBe(-12) // 과거
  expect(daysUntil('2026-09-01', '2026-08-31')).toBe(1) // 하루 앞(월 경계)
})

test('daysUntil — 파싱 불가 입력은 null', () => {
  expect(daysUntil('bad', '2026-09-01')).toBeNull()
  expect(daysUntil('2026-09-01', 'bad')).toBeNull()
})

test('ddayLabel — D-7 / D-DAY / D+n / 빈값', () => {
  expect(ddayLabel(7)).toBe('D-7')
  expect(ddayLabel(0)).toBe('D-DAY')
  expect(ddayLabel(-3)).toBe('D+3')
  expect(ddayLabel(null)).toBe('')
})
