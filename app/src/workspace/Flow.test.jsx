import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Flow, { weekStatus } from './Flow.jsx'
import { createMockRepositories } from '../data/mock.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

test('weekStatus — 시작일~+6일 = 이번 주, 이전 = 예정, 이후 = 지난', () => {
  expect(weekStatus('2026-09-07', '2026-09-07')).toBe('이번 주')
  expect(weekStatus('2026-09-07', '2026-09-13')).toBe('이번 주')
  expect(weekStatus('2026-09-07', '2026-09-14')).toBe('지난')
  expect(weekStatus('2026-09-07', '2026-09-06')).toBe('예정')
})

test('흐름 탭 골격 = 제목·안내(SSR — 데이터는 클라이언트 로드)', () => {
  const html = flat(<Flow store={createMockRepositories({ user: 'mock-member' })} staff={false} />)
  expect(html).toContain('스터디 흐름')
  expect(html).toContain('주 단위 진행 기록')
  expect(html).not.toContain('주차 기록 추가')     // 비운영진 = 등록 폼 없음
})

test('운영진 = 인라인 등록 폼 노출', () => {
  const html = flat(<Flow store={createMockRepositories({ user: 'mock-staff' })} staff />)
  expect(html).toContain('주차 기록 추가')
  expect(html).toContain('시작일')
})

test('flow 저장소 — 운영진만 쓰기·삭제(목 = RLS 동형)', async () => {
  const member = createMockRepositories({ user: 'mock-member' })
  await expect(member.flow.save({ 주차: '9월 3주', 시작일: '2026-09-21', 제목: 'x' })).rejects.toThrow()
  const staff = createMockRepositories({ user: 'mock-staff' })
  const row = await staff.flow.save({ 주차: '9월 3주', 시작일: '2026-09-21', 제목: 'x' })
  expect(row.id).toBeTruthy()
  await staff.flow.remove(row.id)
  const rows = await staff.flow.list()
  expect(rows.some((r) => r.id === row.id)).toBe(false)
})
