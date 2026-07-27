import { expect, test } from 'vitest'
import { MARQUEE_KEYWORDS, marqueeTrack, parseStat, easeOutCubic, countupFrame, localYmd, recruitPhase, RECRUIT_WINDOW } from './home-logic.js'

// ── 모집 국면(경계일 포함·기간 밖 전환 — SPEC §4) ──
test('recruitPhase — before/open/after 경계(시작·마감일 = open 포함)', () => {
  expect(recruitPhase('2026-08-24')).toBe('before')
  expect(recruitPhase('2026-08-25')).toBe('open')
  expect(recruitPhase('2026-09-01')).toBe('open')
  expect(recruitPhase('2026-09-08')).toBe('open')
  expect(recruitPhase('2026-09-09')).toBe('after')
})
test('recruitPhase — 창 주입 가능(운영틀 캘린더가 유일 원천)', () => {
  expect(RECRUIT_WINDOW.start < RECRUIT_WINDOW.end).toBe(true)
  expect(recruitPhase('2099-01-05', { start: '2099-01-01', end: '2099-01-10' })).toBe('open')
})
test('localYmd — YYYY-MM-DD 0패딩', () => {
  expect(localYmd(new Date(2026, 0, 5))).toBe('2026-01-05')
  expect(localYmd(new Date(2026, 11, 31))).toBe('2026-12-31')
})

// ── 마퀴 트랙(이음매 없는 순환 = 2배 복제) ──
test('marqueeTrack — 트랙을 2배 복제(translateX -50% 순환용)', () => {
  expect(marqueeTrack(['a', 'b'])).toEqual(['a', 'b', 'a', 'b'])
  expect(marqueeTrack(MARQUEE_KEYWORDS).length).toBe(MARQUEE_KEYWORDS.length * 2)
  expect(marqueeTrack([])).toEqual([])
})

// ── 스탯 파싱(접두·값·소수자릿수·접미) ──
test('parseStat — 접두/값/소수자릿수/접미 분리', () => {
  expect(parseStat('69.2%')).toEqual({ prefix: '', value: 69.2, decimals: 1, suffix: '%' })
  expect(parseStat('40%')).toEqual({ prefix: '', value: 40, decimals: 0, suffix: '%' })
  expect(parseStat('+18%')).toEqual({ prefix: '+', value: 18, decimals: 0, suffix: '%' })
  expect(parseStat('3.14x')).toEqual({ prefix: '', value: 3.14, decimals: 2, suffix: 'x' })
})

// ── 이징(경계 클램프·감속) ──
test('easeOutCubic — 경계·클램프·감속 형상', () => {
  expect(easeOutCubic(0)).toBe(0)
  expect(easeOutCubic(1)).toBe(1)
  expect(easeOutCubic(0.5)).toBeCloseTo(0.875)
  expect(easeOutCubic(-1)).toBe(0)
  expect(easeOutCubic(2)).toBe(1)
})

// ── 카운트업 프레임(0=시작·1=원본 복원·형식 보존·단조) ──
test('countupFrame — 진행 0/1 경계 + 소수형식 보존', () => {
  const s = parseStat('69.2%')
  expect(countupFrame(s, 0)).toBe('0.0%')
  expect(countupFrame(s, 1)).toBe('69.2%')
  const s2 = parseStat('40%')
  expect(countupFrame(s2, 0)).toBe('0%')
  expect(countupFrame(s2, 1)).toBe('40%')
})
test('countupFrame — 중간 진행은 0<값<목표(단조 증가)', () => {
  const s = parseStat('69.2%')
  const mid = parseFloat(countupFrame(s, 0.5))
  expect(mid).toBeGreaterThan(0)
  expect(mid).toBeLessThan(69.2)
})
