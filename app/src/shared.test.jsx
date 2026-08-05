// 공개 헤더의 로그인 상태 동적 표시(M3 ④) — 세션 없으면 워크스페이스 존재를 노출하지 않는다.
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import { SiteNav } from './shared.jsx'
import { hasWorkspaceSession } from './data/session-flag.js'
import { SESSION_KEY } from './data/session-key.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

test('비로그인 헤더 = 워크스페이스 링크 없음(공개 탭만)', () => {
  const html = flat(<SiteNav signedIn={false} />)
  expect(html).not.toContain('/workspace/')
  expect(html).not.toContain('WORKSPACE')
  expect(html).not.toContain('/about/') // about 폐지(IA 4차 2026-08-05)
  for (const label of ['INSIGHTS', 'SEMINARS', 'PROJECTS', 'RECRUIT', 'LOG']) {
    expect(html).toContain(label)
  }
})

test('로그인 세션 있으면 헤더 끝에 워크스페이스 링크', () => {
  const html = flat(<SiteNav signedIn />)
  expect(html).toContain('href="/workspace/"')
  expect(html).toContain('WORKSPACE')
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
