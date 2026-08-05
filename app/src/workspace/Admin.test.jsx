// 운영 전용 영역 — 화면 차단(Denied) + 멤버 관리 + 콘텐츠 등록. 서버 차단은 RLS(0002)가 별도로 담당.
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Admin, { Denied } from './Admin.jsx'
import AdminMembers from './AdminMembers.jsx'
import AdminContent from './AdminContent.jsx'
import { createMockRepositories } from '../data/mock.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')
const staffStore = () => createMockRepositories({ user: 'mock-staff' })

test('운영 영역 = 승인대기·멤버·콘텐츠 3구획', () => {
  const html = flat(<Admin store={staffStore()} member={{ id: 'mock-staff', role: '운영진' }} />)
  for (const s of ['승인대기', '멤버', '콘텐츠']) expect(html).toContain(s)
  expect(html).toContain('승인 대기')      // 기본 구획 = 승인대기함(M2 화면 이관)
})

test('권한 없음 안내 = 운영진 전용 명시, 관리 폼 미노출', () => {
  const html = flat(<Denied />)
  expect(html).toContain('운영진 전용')
  expect(html).not.toContain('ws-table')
  expect(html).not.toContain('등록')
})

test('멤버 관리 = 명단 열(이름·학번·전공·가입일·역할) + 초대는 절차 안내만', () => {
  const html = flat(<AdminMembers store={staffStore()} meId="mock-staff" />)
  for (const col of ['이름', '학번', '전공', '가입일', '역할']) expect(html).toContain(col)
  expect(html).toContain('계정 초대')
  expect(html).toContain('supabase/README.md')
  expect(html).toContain('service key')       // 앱에서 생성 불가 사유 명시
})

test('콘텐츠 관리 = 공지·세션·세션 자료·과제 폼', () => {
  const html = flat(<AdminContent store={staffStore()} />)
  for (const t of ['공지', '세션', '세션 자료(링크)', '과제']) expect(html).toContain(t)
  expect(html).toContain('내부여부')
})

// ── 저장소 계약: 운영 쓰기는 운영진만(RLS 동형) ──
test('공지·세션·자료·과제 등록 = 운영진만', async () => {
  const staff = staffStore()
  const notice = await staff.notices.save({ 제목: '샘플 공지2', 본문: '본문', 내부여부: true })
  expect(notice.id).toBeTruthy()
  const session = await staff.sessions.save({ 회차: 2, 날짜: '2026-09-15', 제목: '2회차' })
  const material = await staff.materials.save({ session_id: session.id, 제목: '자료', url: 'https://example.com/a' })
  expect(material.session_id).toBe(session.id)
  const hw = await staff.assignments.save({ session_id: session.id, 제목: '과제2', 마감: null })
  expect((await staff.assignments.list()).some((a) => a.id === hw.id)).toBe(true)

  const mem = createMockRepositories({ user: 'mock-member' })
  await expect(mem.notices.save({ 제목: 'x', 본문: '' })).rejects.toThrow('권한 없음')
  await expect(mem.sessions.save({ 회차: 9, 날짜: '2026-09-30', 제목: 'x' })).rejects.toThrow('권한 없음')
  await expect(mem.assignments.save({ 제목: 'x' })).rejects.toThrow('권한 없음')
})

test('수정 = 같은 행 갱신(행이 늘지 않음)', async () => {
  const staff = staffStore()
  const before = (await staff.sessions.list()).length
  const [first] = await staff.sessions.list()
  const patched = await staff.sessions.save({ id: first.id, 회차: first['회차'], 날짜: first['날짜'], 제목: '제목 변경' })
  expect(patched['제목']).toBe('제목 변경')
  expect((await staff.sessions.list())).toHaveLength(before)
})

test('역할 변경·전공 열람 = 운영진만', async () => {
  const staff = staffStore()
  const changed = await staff.members.setRole('mock-member', '운영진')
  expect(changed.role).toBe('운영진')
  expect((await staff.members.listPrivate()).length).toBeGreaterThan(1)

  const mem = createMockRepositories({ user: 'mock-member' })
  await expect(mem.members.setRole('mock-staff', '스터디원')).rejects.toThrow('권한 없음')
  const priv = await mem.members.listPrivate()
  expect(priv.every((p) => p.member_id === 'mock-member')).toBe(true)   // 본인 1행만(RLS 동형)
})
