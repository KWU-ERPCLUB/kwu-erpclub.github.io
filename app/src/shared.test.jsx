// 공개 헤더의 로그인 상태 동적 표시(M3 ④) — 세션 없으면 워크스페이스 존재를 노출하지 않는다.
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import { SiteNav, PageHead, latestUpdated } from './shared.jsx'
import { hasWorkspaceSession } from './data/session-flag.js'
import { SESSION_KEY } from './data/session-key.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

test('비로그인 헤더 = 워크스페이스 링크 없음(공개 탭만)', () => {
  const html = flat(<SiteNav signedIn={false} />)
  expect(html).not.toContain('/workspace/')
  expect(html).not.toContain('WORKSPACE')
  expect(html).not.toContain('/about/') // about·log 폐지(IA 4차 2026-08-05)
  expect(html).not.toContain('/log/')
  for (const label of ['INSIGHTS', 'SEMINARS', 'PROJECTS', 'RECRUIT']) {
    expect(html).toContain(label)
  }
})

test('스킵 링크 = 문서 첫 요소·#main 대상(접근성 3차)', () => {
  const html = flat(<SiteNav signedIn={false} />)
  expect(html.indexOf('skip-link')).toBeLessThan(html.indexOf('class="nav"'))
  expect(html).toContain('href="#main"')
  expect(html).toContain('본문 바로가기')
})

test('로그인 세션 있으면 헤더 끝에 워크스페이스 링크', () => {
  const html = flat(<SiteNav signedIn />)
  expect(html).toContain('href="/workspace/"')
  expect(html).toContain('WORKSPACE')
})

// 페이지 헤드 골격 통일(3차 2026-08-05) — 4페이지가 이 한 구현을 소비한다.
test('PageHead = 좌 라벨(■)+h1+서브+메타+children 골격', () => {
  const html = flat(
    <PageHead label="INSIGHTS" title={<>AI <em>인사이트</em></>} sub="서브 문구" meta="최종 갱신 2026-08-05">
      <div className="extra-filter" />
    </PageHead>,
  )
  expect(html).toContain('pg-head')
  expect(html).toContain('pg-sq') // 버건디 ■ 눈썹 불릿
  expect(html).toContain('>INSIGHTS<')
  expect(html).toContain('<em>인사이트</em>')
  expect(html).toContain('서브 문구')
  expect(html).toContain('최종 갱신 2026-08-05')
  expect(html).toContain('extra-filter') // 페이지 고유 부가 요소 = children
})

test('갱신일 메타 = 콘텐츠 최신 게재일 파생(없으면 null = 줄 생략)', () => {
  expect(latestUpdated([{ date: '2026-07-01' }, { date: '2026-08-04' }])).toBe('최종 갱신 2026-08-04')
  expect(latestUpdated([])).toBe(null)
  expect(latestUpdated([{ title: '날짜 없음' }])).toBe(null)
  // 메타 없으면 줄 자체가 렌더되지 않는다(하드코딩 날짜 금지)
  expect(flat(<PageHead label="X" title="제목" />)).not.toContain('pg-meta')
})

test('세션 판정 = 저장소 키 존재 여부만(없는 환경·차단 환경 = 비로그인)', () => {
  const box = new Map()
  const storage = { getItem: (k) => box.get(k) ?? null }
  expect(hasWorkspaceSession(storage)).toBe(false)
  box.set(SESSION_KEY, '{"access_token":"t"}')
  expect(hasWorkspaceSession(storage)).toBe(true)

  expect(hasWorkspaceSession(null)).toBe(false)
  const blocked = { getItem() { throw new Error('차단') } }
  expect(hasWorkspaceSession(blocked)).toBe(false)
})
