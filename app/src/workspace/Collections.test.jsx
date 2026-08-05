import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Collections from './Collections.jsx'
import { createMockRepositories } from '../data/mock.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

// SSR = 초기(로딩) 상태만 그린다 — 페치 후 목록은 저장소 계약으로 검증(아래).
test('컬렉션 탭 골격 = 내 북마크 + 링크 스크랩 입력폼', () => {
  const html = flat(<Collections store={createMockRepositories({ user: 'mock-member' })} />)
  expect(html).toContain('내 북마크')
  expect(html).toContain('링크 스크랩')
  expect(html).toContain('placeholder="https://..."')
  expect(html).toContain('aria-label="스크랩 메모"')
  expect(html).toContain('불러오는 중')
})

test('스크랩 CRUD — 추가·수정·삭제가 본인 것만 반영(목 저장소)', async () => {
  const store = createMockRepositories({ user: 'mock-member' })
  const before = await store.collections.listMine()

  const added = await store.collections.add({ url: 'https://example.com/new', 메모: '메모' })
  expect((await store.collections.listMine())).toHaveLength(before.length + 1)

  const patched = await store.collections.update(added.id, { 메모: '고침' })
  expect(patched['메모']).toBe('고침')

  await store.collections.remove(added.id)
  expect(await store.collections.listMine()).toHaveLength(before.length)
})

test('남의 스크랩은 수정·삭제 대상이 아님', async () => {
  const other = createMockRepositories({ user: 'mock-staff' })
  await expect(other.collections.update('mock-c1', { 메모: 'x' })).rejects.toThrow('대상 없음')
  await expect(other.collections.remove('mock-c1')).rejects.toThrow('대상 없음')
})

test('북마크 목록 = 기사 표시 정보 동반(제목·슬러그)', async () => {
  const store = createMockRepositories({ user: 'mock-member' })
  const rows = await store.interactions.listBookmarked()
  expect(rows.length).toBeGreaterThan(0)
  expect(rows[0].articles['제목']).toBeTruthy()
  expect(rows[0].articles['슬러그']).toBeTruthy()
})
