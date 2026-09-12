// 세션·과제·공지(스터디원 화면) — 골격 + 저장소 계약.
// 과제 화면·마감 표시는 2026-09-13 전용 탭으로 나갔다 → Assignments.test.jsx.
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Notices, { NoticeTitles } from './Notices.jsx'
import { createMockRepositories } from '../data/mock.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')
const member = () => createMockRepositories({ user: 'mock-member' })

// 2026-08-18 공지 전용 탭 승격 — 탭 본문 = 카드 골격(제목은 셸 헤더가 담당), 홈 레일 = 제목만 목록.
test('공지 — 탭 본문 = 카드 골격, 홈 레일 = 제목만 목록', () => {
  expect(flat(<Notices store={member()} />)).toContain('ws-notices')
  expect(flat(<NoticeTitles store={member()} />)).toContain('공지')
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
