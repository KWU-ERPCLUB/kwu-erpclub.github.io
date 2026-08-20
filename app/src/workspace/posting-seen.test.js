import { expect, test } from 'vitest'
import { loadSeen, markSeen, isNewPosting } from './posting-seen.js'

// 가짜 저장소 — 브라우저 localStorage 계약(getItem/setItem)만 흉내.
const fakeStorage = () => {
  const m = new Map()
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v) }
}

test('열람 적립 — markSeen 후 loadSeen에 남고, 중복 적립은 무해', () => {
  const s = fakeStorage()
  expect(loadSeen(s).size).toBe(0)
  markSeen('p1', s)
  markSeen('p1', s)
  markSeen('p2', s)
  const seen = loadSeen(s)
  expect(seen.has('p1')).toBe(true)
  expect(seen.has('p2')).toBe(true)
  expect(seen.size).toBe(2)
})

test('저장소 차단·깨진 값 = 빈 집합 강등(기능 정상)', () => {
  expect(loadSeen(null).size).toBe(0)
  const broken = { getItem: () => '{not json', setItem: () => { throw new Error('blocked') } }
  expect(loadSeen(broken).size).toBe(0)
  expect(() => markSeen('p1', broken)).not.toThrow()
})

test('N 판정 — 등록 7일 이내·미열람만(경계 6일=참, 7일=거짓, 열람=거짓, created_at 없음=거짓)', () => {
  const today = '2026-08-20'
  const none = new Set()
  expect(isNewPosting({ id: 'a', created_at: '2026-08-20T09:00:00+00:00' }, none, today)).toBe(true)
  expect(isNewPosting({ id: 'b', created_at: '2026-08-14T09:00:00+00:00' }, none, today)).toBe(true)   // 6일 전
  expect(isNewPosting({ id: 'c', created_at: '2026-08-13T09:00:00+00:00' }, none, today)).toBe(false)  // 7일 전 = 소멸
  expect(isNewPosting({ id: 'a', created_at: '2026-08-20T09:00:00+00:00' }, new Set(['a']), today)).toBe(false)
  expect(isNewPosting({ id: 'd' }, none, today)).toBe(false)   // 수기 등록 등 created_at 부재 = 배지 없음
})
