// 세션·과제·공지(스터디원 화면) — 골격 + 저장소 계약.
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Sessions from './Sessions.jsx'
import Assignments, { dueLabel } from './Assignments.jsx'
import Notices from './Notices.jsx'
import { createMockRepositories } from '../data/mock.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')
const member = () => createMockRepositories({ user: 'mock-member' })

test('세션 탭 골격 = 제목 + 로딩 안내(자료는 링크 기반)', () => {
  const html = flat(<Sessions store={member()} />)
  expect(html).toContain('세션')
  expect(html).toContain('불러오는 중')
})

test('과제 탭 골격 = 제목 + 링크 제출 입력', () => {
  const html = flat(<Assignments store={member()} />)
  expect(html).toContain('과제')
  expect(html).toContain('불러오는 중')
})

test('공지 탭 골격 = 내부 공지 목록', () => {
  expect(flat(<Notices store={member()} />)).toContain('공지')
})

test('마감 표시 — 없음·예정·지남 3상태', () => {
  const now = new Date('2026-09-10T00:00:00Z')
  expect(dueLabel(null, now)).toBe('마감 없음')
  expect(dueLabel('2026-09-20T09:00:00Z', now)).toContain('마감 2026-09-20')
  expect(dueLabel('2026-09-01T09:00:00Z', now)).toContain('마감됨')
})

// ── 저장소 계약 ──
test('세션 자료 = session_id로 세션에 묶임', async () => {
  const store = member()
  const [s] = await store.sessions.list()
  const mats = await store.materials.list()
  expect(mats.some((m) => m.session_id === s.id && m.url)).toBe(true)
})

test('과제 제출 = 본인 소유로 생성, 재제출은 같은 행 수정', async () => {
  const store = member()
  const created = await store.submissions.submit({ assignment_id: 'mock-h1', url: 'https://example.com/v1', 메모: '1차' })
  expect(created.member_id).toBe('mock-member')

  const before = (await store.submissions.listMine()).length
  const fixed = await store.submissions.submit({ id: created.id, assignment_id: 'mock-h1', url: 'https://example.com/v2', 메모: '2차' })
  expect(fixed.url).toBe('https://example.com/v2')
  expect((await store.submissions.listMine())).toHaveLength(before)   // 행이 늘지 않는다
})

test('남의 제출은 수정 대상이 아님 · 비로그인은 제출 불가', async () => {
  const other = createMockRepositories({ user: 'mock-staff' })
  await expect(other.submissions.submit({ id: 'mock-sub1', url: 'https://example.com/x' })).rejects.toThrow('대상 없음')
  const anon = createMockRepositories()
  await expect(anon.submissions.submit({ assignment_id: 'mock-h1', url: 'https://example.com/x' })).rejects.toThrow('로그인 필요')
})
