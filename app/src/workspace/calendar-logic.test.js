import { expect, test } from 'vitest'
import { monthGrid, buildAgenda, itemsOn, upcoming, dday, weeklyContribItems, toKey } from './calendar-logic.js'

test('monthGrid — 일요일 시작·이웃달 채움·전체 주 단위(2026-08 = 토요일 시작 31일)', () => {
  const weeks = monthGrid(2026, 8)
  for (const w of weeks) expect(w.length).toBe(7)
  const flat = weeks.flat()
  // 8/1이 토요일 → 첫 주는 7월 26~31 채움 + 8/1
  expect(flat[0].key).toBe('2026-07-26')
  expect(flat[0].inMonth).toBe(false)
  expect(flat[6].key).toBe('2026-08-01')
  expect(flat[6].inMonth).toBe(true)
  // 8/31(월) 포함 주가 마지막 — 9/5(토)까지 채움
  expect(flat[flat.length - 1].key).toBe('2026-09-05')
  expect(flat.filter((c) => c.inMonth).length).toBe(31)
})

test('buildAgenda — 세 원천 병합·날짜순 정렬·형식 밖 날짜 제외', () => {
  const items = buildAgenda({
    events: [{ id: 'e1', 제목: '오프라인 모임', 날짜: '2026-09-12', 종류: '일정' }],
    assignments: [
      { id: 'a1', 제목: '1주차 정리', 마감: '2026-09-10T23:59:00' },
      { id: 'a2', 제목: '마감 없음', 마감: null },
    ],
    sessions: [{ id: 's1', 회차: 1, 제목: '킥오프', 날짜: '2026-09-08' }],
  })
  expect(items.map((i) => i.date)).toEqual(['2026-09-08', '2026-09-10', '2026-09-12'])
  expect(items[0]['제목']).toContain('1회차')
  expect(items[1]['종류']).toBe('과제')
  expect(items.some((i) => i['제목'].includes('마감 없음'))).toBe(false)
})

test('itemsOn·upcoming — 그날 항목 필터 + 오늘 이후 상위 n건', () => {
  const items = buildAgenda({
    events: [
      { id: 'e1', 제목: '지난 일정', 날짜: '2026-09-01' },
      { id: 'e2', 제목: '오늘 일정', 날짜: '2026-09-10' },
      { id: 'e3', 제목: '다음 일정', 날짜: '2026-09-20' },
    ],
  })
  expect(itemsOn(items, '2026-09-10').length).toBe(1)
  const up = upcoming(items, '2026-09-10', 6)
  expect(up.map((i) => i['제목'])).toEqual(['오늘 일정', '다음 일정'])
})

test('dday — 오늘/미래/과거 라벨', () => {
  expect(dday('2026-09-10', '2026-09-10')).toBe('오늘')
  expect(dday('2026-09-10', '2026-09-13')).toBe('D-3')
  expect(dday('2026-09-10', '2026-09-08')).toBe('D+2')
})

test('weeklyContribItems — 요일 미정(null) = 빈 배열, 지정 시 주 단위 반복', () => {
  expect(weeklyContribItems('2026-09-10')).toEqual([])
  const rows = weeklyContribItems('2026-09-10', 3, 0)   // 일요일 반복(가정값 — 화면 아님)
  expect(rows.map((r) => r.date)).toEqual(['2026-09-13', '2026-09-20', '2026-09-27'])
  expect(rows[0]['종류']).toBe('과제')
})

test('toKey — 로컬 날짜 키(YYYY-MM-DD)', () => {
  expect(toKey(new Date(2026, 8, 5))).toBe('2026-09-05')
})
