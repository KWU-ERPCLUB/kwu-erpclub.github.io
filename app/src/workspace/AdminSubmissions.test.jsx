// 제출 현황 매트릭스(2026-08-06 재구성) — 셀 판정·제출률 순수 함수 + 골격.
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import AdminSubmissions, { cellOf, rateOf } from './AdminSubmissions.jsx'
import { createMockRepositories } from '../data/mock.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

test('cellOf — 멤버×과제 제출 행 판정', () => {
  const subs = [{ member_id: 'm1', assignment_id: 'a1', url: 'https://example.com/x' }]
  expect(cellOf(subs, 'm1', 'a1')?.url).toBe('https://example.com/x')
  expect(cellOf(subs, 'm2', 'a1')).toBeNull()
  expect(cellOf(subs, 'm1', 'a2')).toBeNull()
})

// 제출률 = "제출로 인정된" 멤버 수(2026-09-13) — 링크형 = url, 폼형 = 한 칸 이상, 체크리스트형 = 전 항목.
test('rateOf — 과제별 제출률 n/전체, 종류별 인정 기준', () => {
  const members = [{ id: 'm1' }, { id: 'm2' }]
  const link = { id: 'a1', 종류: '링크' }
  const subs = [{ member_id: 'm1', assignment_id: 'a1', url: 'https://example.com/x' }]
  expect(rateOf(subs, members, link)).toBe('1/2')
  expect(rateOf(subs, members, { id: 'a2', 종류: '링크' })).toBe('0/2')
  expect(rateOf([], [], link)).toBe('0/0')

  // 체크리스트형 = 7가지 전부 체크해야 제출(하나라도 빠지면 미제출)
  const check = { id: 'a3', 종류: '체크리스트', 양식키: 'prep-ot-prep' }
  const partial = [{ member_id: 'm1', assignment_id: 'a3', 답변: { pw: true } }]
  expect(rateOf(partial, members, check)).toBe('0/2')
})

test('골격 = 매트릭스 표(멤버 행 + 과제 열 + 제출률)', () => {
  const html = flat(<AdminSubmissions store={createMockRepositories({ user: 'mock-staff' })} />)
  expect(html).toContain('제출 현황')
  expect(html).toContain('불러오는 중')
})

test('저장소 계약 — listAll: 운영진 = 전원, 스터디원 = 본인 행만', async () => {
  const staff = createMockRepositories({ user: 'mock-staff' })
  expect((await staff.submissions.listAll()).length).toBeGreaterThan(0)
  const member = createMockRepositories({ user: 'mock-member' })
  const mine = await member.submissions.listAll()
  expect(mine.every((s) => s.member_id === 'mock-member')).toBe(true)
})
