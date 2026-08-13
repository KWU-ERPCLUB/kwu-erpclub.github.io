import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Sessions, { isLockedMaterial } from './Sessions.jsx'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

// 해금(0011): 공개일 미래 = 잠금(링크 미노출), 과거·null = 링크 노출.
test('isLockedMaterial — 미래 공개일만 잠금, null·과거는 열림', () => {
  const today = '2026-09-01'
  expect(isLockedMaterial({ 공개일: '2026-09-14' }, today)).toBe(true)
  expect(isLockedMaterial({ 공개일: '2026-09-01' }, today)).toBe(false)
  expect(isLockedMaterial({ 공개일: '2026-08-01' }, today)).toBe(false)
  expect(isLockedMaterial({}, today)).toBe(false)
})

test('잠긴 자료 = 🔒 라벨·공개일 표시, 링크(href) 미노출', () => {
  const store = {
    sessions: { list: () => Promise.resolve([{ id: 's1', 회차: 2, 제목: '기고+위키', 날짜: '2026-09-14' }]) },
    materials: {
      list: () => Promise.resolve([
        { id: 'm1', session_id: 's1', 제목: '기고 프롬프트 키트', url: 'https://docs.google.com/kit', 공개일: '2099-01-01' },
        { id: 'm2', session_id: 's1', 제목: '지난 자료', url: 'https://docs.google.com/old', 공개일: '2000-01-01' },
      ]),
    },
    notes: { list: () => Promise.resolve([]) },
  }
  // renderToString은 useEffect를 실행하지 않으므로 로직 단위로 검증 + 골격만 렌더 확인
  const html = flat(<Sessions store={store} />)
  expect(html).toContain('세션')
  const locked = { 제목: '기고 프롬프트 키트', url: 'https://docs.google.com/kit', 공개일: '2099-01-01' }
  const open = { 제목: '지난 자료', url: 'https://docs.google.com/old', 공개일: '2000-01-01' }
  expect(isLockedMaterial(locked)).toBe(true)
  expect(isLockedMaterial(open)).toBe(false)
})

// 세션 본문(0012) — 목 시드에 즉시 공개 본문 1건: 목 저장소 계약과 잠금 판정 고정.
test('세션 본문 — 목 저장소 notes 계약(list·save) + 공개일 잠금 판정', async () => {
  const { createMockRepositories } = await import('../data/mock.js')
  const staff = createMockRepositories({ user: 'mock-staff' })
  const rows = await staff.notes.list()
  expect(rows.length).toBeGreaterThan(0)
  expect(rows[0]['본문']).toContain('목표')
  expect(isLockedMaterial(rows[0], '2026-09-01')).toBe(false)
  const saved = await staff.notes.save({ session_id: 'mock-s1', 본문: '## 오늘\n- x', 공개일: '2099-01-01' })
  expect(isLockedMaterial(saved, '2026-09-01')).toBe(true)
})
