import { expect, test } from 'vitest'
import { loadSeen, markSeen, isNew } from './seen-store.js'

const memStorage = () => {
  const box = new Map()
  return { getItem: (k) => box.get(k) ?? null, setItem: (k, v) => box.set(k, v) }
}

test('열람 기록 — 저장·복원, 차단 환경 = 빈 집합 강등', () => {
  const storage = memStorage()
  expect(loadSeen(storage).size).toBe(0)
  markSeen('a-1', storage)
  markSeen('a-2', storage)
  expect([...loadSeen(storage)].sort()).toEqual(['a-1', 'a-2'])

  const blocked = { getItem() { throw new Error('차단') }, setItem() { throw new Error('차단') } }
  expect(loadSeen(blocked).size).toBe(0)
  expect(() => markSeen('x', blocked)).not.toThrow()
})

test('N 배지 판정 — 게재 7일 이내 & 미열람만, 7일 경과 = 자동 소멸', () => {
  const TODAY = '2026-08-07'
  const seen = new Set(['read-slug'])
  expect(isNew({ slug: 'fresh', date: '2026-08-05' }, seen, TODAY)).toBe(true)
  expect(isNew({ slug: 'fresh', date: TODAY }, seen, TODAY)).toBe(true)
  expect(isNew({ slug: 'read-slug', date: '2026-08-05' }, seen, TODAY)).toBe(false)   // 열람함
  expect(isNew({ slug: 'old', date: '2026-07-31' }, seen, TODAY)).toBe(false)         // 7일 경과
  expect(isNew({ slug: 'edge', date: '2026-08-01' }, seen, TODAY)).toBe(true)         // 6일차 = 아직 표시
  expect(isNew({ slug: 'future-ok', date: '2026-08-09' }, seen, TODAY)).toBe(false)   // 미래 게재일 = 비표시
  expect(isNew({ slug: 'nodate' }, seen, TODAY)).toBe(false)
})
