import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Contribute from './Contribute.jsx'
import Review from './Review.jsx'
import { createMockRepositories } from '../data/mock.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')
const DRAFT = {
  제목: '합성 초안', 설명: '한 줄', 성격: '트렌드', 주제: '에이전트',
  본문: '## 본문', source_url: 'https://example.com', source_name: '예시', 상태: '승인대기',
}

test('기고 폼 = 제목·성격·주제·설명·출처·본문 + 초안 저장/승인 요청', () => {
  const html = flat(<Contribute store={createMockRepositories({ user: 'mock-member' })} />)
  for (const label of ['제목', '성격', '주제', '설명(카드 1줄)', '출처 링크', '출처 이름', '본문(마크다운)']) {
    expect(html).toContain(label)
  }
  expect(html).toContain('초안 저장')
  expect(html).toContain('승인 요청')
  expect(html).toContain('ws-textarea')
})

// 1트랙(spec 2026-08-05-기고-투트랙 §1): 프롬프트 키트 패널 — 수기 폼과 공존(수기 경로 존치).
test('기고 탭 = 프롬프트 복사 + AI 초안 붙여넣기 패널 존재', () => {
  const html = flat(<Contribute store={createMockRepositories({ user: 'mock-member' })} />)
  expect(html).toContain('프롬프트 복사')
  expect(html).toContain('AI 초안 붙여넣기')
  expect(html).toContain('폼에 반영')
})

// M3: 승인 대기함은 기고 탭에서 빠지고 운영 탭으로 이관됐다(운영진 전용 영역 통합).
test('기고 탭에는 승인 대기함 없음 — 운영진이 봐도 동일', () => {
  expect(flat(<Contribute store={createMockRepositories({ user: 'mock-member' })} />)).not.toContain('승인 대기')
  expect(flat(<Contribute store={createMockRepositories({ user: 'mock-staff' })} />)).not.toContain('승인 대기')
})

// SSR은 effect 전 상태(대기 0건)만 그린다 — 행 단위 동작은 아래 저장소 계약 테스트가 검증한다.
test('운영진 승인 화면 골격 = 승인 대기함 + 0건 안내', () => {
  const html = flat(<Review store={createMockRepositories({ user: 'mock-staff' })} />)
  expect(html).toContain('승인 대기')
  expect(html).toContain('ws-count')
  expect(html).toContain('대기 0건')
})

// ── 저장소 계약(상태 전이) ──
test('기고 저장 = 본인 글로 생성, 상태 승인대기', async () => {
  const store = createMockRepositories({ user: 'mock-member' })
  const saved = await store.articles.save(DRAFT)
  expect(saved['작성자']).toBe('mock-member')
  expect(saved['상태']).toBe('승인대기')
  expect(saved['슬러그']).toBeTruthy()
  expect((await store.articles.listMine()).some((a) => a.id === saved.id)).toBe(true)
})

test('승인대기함은 운영진만 조회, 게재 전환도 운영진만', async () => {
  const member = createMockRepositories({ user: 'mock-member' })
  const saved = await member.articles.save(DRAFT)
  expect(await member.articles.listPending()).toEqual([])
  await expect(member.articles.setStatus(saved.id, '게재')).rejects.toThrow('권한 없음')
})

test('게재 전환 = 공개 목록에 즉시 등장 + 게재일 채움', async () => {
  const store = createMockRepositories({ user: 'mock-staff' })
  const saved = await store.articles.save(DRAFT)
  const before = await store.articles.listPublished()
  expect((await store.articles.listPending()).some((a) => a.id === saved.id)).toBe(true)

  const published = await store.articles.setStatus(saved.id, '게재')
  expect(published['상태']).toBe('게재')
  expect(published['게재일']).toBeTruthy()
  const after = await store.articles.listPublished()
  expect(after.length).toBe(before.length + 1)
})

test('반려 = 초안으로 되돌림(삭제 아님)', async () => {
  const store = createMockRepositories({ user: 'mock-staff' })
  const saved = await store.articles.save(DRAFT)
  const back = await store.articles.setStatus(saved.id, '초안')
  expect(back['상태']).toBe('초안')
  expect((await store.articles.listMine()).some((a) => a.id === saved.id)).toBe(true)
})
