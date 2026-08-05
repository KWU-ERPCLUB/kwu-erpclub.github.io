import { expect, test } from 'vitest'
import { readEnv, createBackend } from './supabase.js'
import { createSupabaseRepositories, REPO_CONTRACT } from './repositories.js'
import { createMockRepositories } from './mock.js'
import { getRepositories, isBackendConfigured } from './index.js'

// ── env 미설정 = null (throw 금지) ──
test('readEnv — 키 없으면 null, 있으면 후행 슬래시 제거', () => {
  expect(readEnv({})).toBeNull()
  expect(readEnv({ VITE_SUPABASE_URL: 'https://x.supabase.co' })).toBeNull()
  expect(readEnv({ VITE_SUPABASE_URL: ' https://x.supabase.co/ ', VITE_SUPABASE_ANON_KEY: 'anon' }))
    .toEqual({ url: 'https://x.supabase.co', key: 'anon' })
})

test('createBackend — config 없으면 null 반환(예외 던지지 않음)', () => {
  expect(createBackend(null)).toBeNull()
  expect(() => createBackend(readEnv({}))).not.toThrow()
})

test('isBackendConfigured / getRepositories — 미설정이면 목 저장소로 폴백', async () => {
  expect(isBackendConfigured({})).toBe(false)
  const repos = getRepositories({ env: {} })
  expect(await repos.articles.listPublished()).toHaveLength(1)
})

// ── 계약 일치: 목 구현과 supabase 구현의 메서드 집합이 같아야 화면이 갈아끼워도 안전 ──
test('저장소 계약 — mock·supabase 구현이 REPO_CONTRACT를 동일하게 만족', () => {
  const fakeBackend = { auth: { getSession: () => null }, db: { select: async () => [], insert: async () => [] } }
  const impls = [createMockRepositories(), createSupabaseRepositories(fakeBackend)]
  for (const repos of impls) {
    for (const [domain, methods] of Object.entries(REPO_CONTRACT)) {
      expect(Object.keys(repos[domain]).sort()).toEqual([...methods].sort())
      for (const m of methods) expect(typeof repos[domain][m]).toBe('function')
    }
  }
})

// ── 목 저장소 = 네트워크 무의존(P4) ──
test('목 저장소 — 비로그인은 개인 데이터 0건, 로그인 시 본인 것만', async () => {
  const anon = createMockRepositories()
  expect(anon.auth.currentUser()).toBeNull()
  expect(await anon.collections.listMine()).toEqual([])
  expect(await anon.submissions.listMine()).toEqual([])

  const mine = createMockRepositories({ user: 'mock-member' })
  expect((await mine.collections.listMine()).every((c) => c.member_id === 'mock-member')).toBe(true)
  expect((await mine.articles.listMine()).every((a) => a.작성자 === 'mock-member')).toBe(true)
})

test('목 저장소 — 명단에 학번·전공 없음(P5)', async () => {
  const repos = createMockRepositories({ user: 'mock-staff' })
  for (const m of await repos.members.list()) {
    expect(m).not.toHaveProperty('학번')
    expect(m).not.toHaveProperty('전공')
  }
})

test('목 저장소 — 컬렉션 추가는 로그인 필요·본인 소유로 저장', async () => {
  const anon = createMockRepositories()
  await expect(anon.collections.add({ url: 'https://example.com' })).rejects.toThrow('로그인 필요')

  const mine = createMockRepositories({ user: 'mock-member' })
  const row = await mine.collections.add({ url: 'https://example.com/new', 메모: 'ㅁ' })
  expect(row.member_id).toBe('mock-member')
  expect(await mine.collections.listMine()).toHaveLength(2)
})

// ── supabase 저장소 = 주입 fetch로 호출 형태만 검증(실네트워크 없음) ──
test('supabase 저장소 — 로그인은 GoTrue password grant, 세션 토큰이 이후 요청에 실림', async () => {
  const calls = []
  const fakeFetch = async (url, options) => {
    calls.push({ url, options })
    if (url.includes('/auth/v1/token')) {
      return { ok: true, text: async () => JSON.stringify({ access_token: 'tok', user: { id: 'u1' } }) }
    }
    return { ok: true, text: async () => JSON.stringify([{ id: 'u1', 이름: '홍길동', role: '스터디원' }]) }
  }
  const backend = createBackend({ url: 'https://x.supabase.co', key: 'anon' }, { fetch: fakeFetch, storage: null })
  const repos = createSupabaseRepositories(backend)

  await repos.auth.signIn('a@example.com', 'pw')
  expect(calls[0].url).toBe('https://x.supabase.co/auth/v1/token?grant_type=password')
  expect(repos.auth.currentUser()).toEqual({ id: 'u1' })

  const me = await repos.members.me()
  expect(me.이름).toBe('홍길동')
  expect(calls[1].url).toContain('/rest/v1/members?select=*&id=eq.u1')
  expect(calls[1].options.headers.Authorization).toBe('Bearer tok')
})

test('supabase 저장소 — 명단은 members_public 뷰 조회(학번·전공 미포함, P5)', async () => {
  const seen = []
  const fakeFetch = async (url) => {
    seen.push(url)
    return { ok: true, text: async () => '[]' }
  }
  const backend = createBackend({ url: 'https://x.supabase.co', key: 'anon' }, { fetch: fakeFetch, storage: null })
  await createSupabaseRepositories(backend).members.list()
  expect(seen[0]).toContain('/rest/v1/members_public')
  expect(seen.join(' ')).not.toContain('member_private')
})

test('supabase 저장소 — 실패 응답은 메시지가 담긴 Error', async () => {
  const fakeFetch = async () => ({ ok: false, status: 400, text: async () => JSON.stringify({ msg: '잘못된 로그인' }) })
  const backend = createBackend({ url: 'https://x.supabase.co', key: 'anon' }, { fetch: fakeFetch, storage: null })
  await expect(createSupabaseRepositories(backend).auth.signIn('a@b.c', 'x')).rejects.toThrow('잘못된 로그인')
})
