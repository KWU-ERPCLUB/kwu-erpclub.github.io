import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import MyPage from './MyPage.jsx'
import { createMockRepositories } from '../data/mock.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')
const ME = { id: 'mock-member', 이름: '스터디원 B', role: '스터디원', 학번: '2020000002', 자기소개: '소개', 관심사: ['에이전트'] }

test('내정보 = 프로필·북마크·활동내역(북마크 단독 탭 폐지 — 2026-08-14 흡수)', () => {
  const html = flat(<MyPage store={createMockRepositories({ user: 'mock-member' })} member={ME} />)
  for (const block of ['프로필', '내 북마크', '활동내역', '내 기고', '내 과제 제출']) {
    expect(html).toContain(block)
  }
  expect(html).not.toContain('링크 스크랩')
})

test('프로필 = 이름·학번·역할 표시 + 자기소개·관심사 수정 입력', () => {
  const html = flat(<MyPage store={createMockRepositories({ user: 'mock-member' })} member={ME} />)
  expect(html).toContain('스터디원 B')
  expect(html).toContain('2020000002')
  expect(html).toContain('자기소개')
  expect(html).toContain('관심사')
  expect(html).toContain('프로필 저장')
  expect(html).toContain('에이전트')       // 관심사 배열 → 쉼표 문자열
})

// ── 저장소 계약 ──
test('프로필 수정 = 자기소개·관심사만 반영, 역할은 불변', async () => {
  const store = createMockRepositories({ user: 'mock-member' })
  const row = await store.members.updateMe({ 자기소개: '새 소개', 관심사: ['자동화'], role: '운영진' })
  expect(row['자기소개']).toBe('새 소개')
  expect(row['관심사']).toEqual(['자동화'])
  expect(row.role).toBe('스터디원')        // role은 본인 수정 대상 아님(RLS members_update_self와 동형)
})

test('활동내역 = 본인 기고·본인 제출만', async () => {
  const store = createMockRepositories({ user: 'mock-member' })
  expect((await store.articles.listMine()).every((a) => a['작성자'] === 'mock-member')).toBe(true)
  expect((await store.submissions.listMine()).every((s) => s.member_id === 'mock-member')).toBe(true)
  const other = createMockRepositories({ user: 'mock-staff' })
  expect((await other.submissions.listMine()).some((s) => s.member_id === 'mock-member')).toBe(false)
})

// ── 비밀번호 변경(2026-08-07 — 초기 공통 비밀번호 → 본인 변경 흐름) ──
test('내정보 = 비밀번호 변경 폼(새 값 + 확인 2칸)', () => {
  const html = flat(<MyPage store={createMockRepositories({ user: 'mock-member' })} member={ME} />)
  expect(html).toContain('비밀번호 변경')
  expect(html).toContain('새 비밀번호(6자 이상)')
  expect(html).toContain('새 비밀번호 확인')
})

test('updatePassword 계약 — 로그인 필요 + 6자 미만 거부(목 = GoTrue 동형)', async () => {
  const signed = createMockRepositories({ user: 'mock-member' })
  await expect(signed.auth.updatePassword('abcdef')).resolves.toBe(true)
  await expect(signed.auth.updatePassword('0000')).rejects.toThrow('6자 이상')
  const anon = createMockRepositories()
  await expect(anon.auth.updatePassword('abcdef')).rejects.toThrow('로그인 필요')
})
