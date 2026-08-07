import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Collections from './Collections.jsx'
import { createMockRepositories } from '../data/mock.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

// 2026-08-07 오너 개정 — 링크 스크랩 UI 폐지, 북마크한 인사이트 모음면만.
test('북마크 탭 골격 = 내 북마크 목록 + 안내 레일(스크랩 폼 없음)', () => {
  const html = flat(<Collections store={createMockRepositories({ user: 'mock-member' })} />)
  expect(html).toContain('내 북마크')
  expect(html).toContain('인사이트')
  expect(html).toContain('불러오는 중')
  expect(html).not.toContain('링크 스크랩')
  expect(html).not.toContain('placeholder="https://..."')
})

test('북마크 목록 = 기사 표시 정보 동반(제목·슬러그·설명)', async () => {
  const store = createMockRepositories({ user: 'mock-member' })
  const rows = await store.interactions.listBookmarked()
  expect(rows.length).toBeGreaterThan(0)
  expect(rows[0].articles['제목']).toBeTruthy()
  expect(rows[0].articles['슬러그']).toBeTruthy()
  expect(rows[0].articles['설명']).toBeTruthy()
})

// 데이터 계층은 유지(화면만 폐지 — 재도입 = 오너 승인). 본인 격리 규칙이 그대로인지 고정.
test('collections 저장소 — 본인 것만 추가·수정·삭제(UI 폐지와 무관하게 계약 유지)', async () => {
  const store = createMockRepositories({ user: 'mock-member' })
  const before = await store.collections.listMine()
  const added = await store.collections.add({ url: 'https://example.com/new', 메모: '메모' })
  expect(await store.collections.listMine()).toHaveLength(before.length + 1)
  await store.collections.remove(added.id)
  expect(await store.collections.listMine()).toHaveLength(before.length)

  const other = createMockRepositories({ user: 'mock-staff' })
  await expect(other.collections.update('mock-c1', { 메모: 'x' })).rejects.toThrow('대상 없음')
  await expect(other.collections.remove('mock-c1')).rejects.toThrow('대상 없음')
})
