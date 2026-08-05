import { expect, test } from 'vitest'
import { readEnv, createBackend } from './supabase.js'
import { createSupabaseRepositories, REPO_CONTRACT } from './repositories.js'
import { createMockRepositories } from './mock.js'
import { getRepositories, isBackendConfigured } from './index.js'
import { toLoginEmail, isHakbeon, MEMBER_EMAIL_DOMAIN } from './login-id.js'

// ── 학번 로그인 매핑(SPEC §0-4 개정) ──
test('toLoginEmail — 학번은 가상 이메일로, @ 포함 입력은 그대로(오너 폴백)', () => {
  expect(toLoginEmail('2021123456')).toBe(`s2021123456@${MEMBER_EMAIL_DOMAIN}`)
  expect(toLoginEmail('  2021123456 ')).toBe(`s2021123456@${MEMBER_EMAIL_DOMAIN}`)
  expect(toLoginEmail('owner@example.com')).toBe('owner@example.com')
  expect(() => toLoginEmail('')).toThrow('학번 입력 필요')
  expect(() => toLoginEmail('20a1')).toThrow('숫자만')
  expect(isHakbeon('2021123456')).toBe(true)
  expect(isHakbeon('abc')).toBe(false)
})

test('supabase 저장소 — signIn에 학번을 넘기면 가상 이메일로 GoTrue 호출', async () => {
  let sent = null
  const fakeFetch = async (url, options) => {
    sent = JSON.parse(options.body)
    return { ok: true, text: async () => JSON.stringify({ access_token: 't', user: { id: 'u1' } }) }
  }
  const backend = createBackend({ url: 'https://x.supabase.co', key: 'anon' }, { fetch: fakeFetch, storage: null })
  await createSupabaseRepositories(backend).auth.signIn('2021123456', 'pw')
  expect(sent.email).toBe(`s2021123456@${MEMBER_EMAIL_DOMAIN}`)
})

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

// ── 만료 세션 복구(2026-08-05 라이브 사고 회귀) — 401이면 refresh 시도, 실패 시 익명 강등 재시도 ──
test('request — 만료 토큰 401 → refresh 실패 → 세션 버리고 익명으로 재시도 성공', async () => {
  const store = new Map([[
    'erpclub.workspace.session',
    JSON.stringify({ access_token: 'expired', refresh_token: 'dead', user: { id: 'u1' } }),
  ]])
  const storage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, v),
    removeItem: (k) => store.delete(k),
  }
  const calls = []
  const fakeFetch = async (url, options = {}) => {
    calls.push({ url, auth: options.headers?.Authorization })
    if (url.includes('grant_type=refresh_token')) return { ok: false, status: 401, text: async () => '{}', json: async () => ({}) }
    if (options.headers?.Authorization === 'Bearer expired') {
      return { ok: false, status: 401, text: async () => JSON.stringify({ message: 'JWT expired' }) }
    }
    return { ok: true, status: 200, text: async () => JSON.stringify([{ 슬러그: 'a' }]) }
  }
  const backend = createBackend({ url: 'https://x.supabase.co', key: 'anon' }, { fetch: fakeFetch, storage })
  const rows = await backend.db.select('articles', { filters: { 상태: '게재' } })
  expect(rows).toEqual([{ 슬러그: 'a' }])
  expect(calls.at(-1).auth).toBe('Bearer anon')                     // 익명 강등 재시도
  expect(store.has('erpclub.workspace.session')).toBe(false)       // 죽은 세션 제거
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

// P5 재해석(§0-5 개정 2026-08-05): 학번 = 로그인 ID → 명단 포함. 사적 필드로 남는 것은 전공뿐.
test('목 저장소 — 명단에 전공 없음(P5), 학번은 로그인 ID로 포함', async () => {
  const repos = createMockRepositories({ user: 'mock-staff' })
  for (const m of await repos.members.list()) {
    expect(m).not.toHaveProperty('전공')
    expect(typeof m.학번).toBe('string')
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

// ── 상호작용(D3): 열람=공개, 토글=로그인 멤버 ──
test('목 저장소 — 총계는 비로그인도 조회, 토글은 로그인 필요', async () => {
  const anon = createMockRepositories()
  const counts = await anon.interactions.counts()
  expect(counts.length).toBeGreaterThan(0)
  expect(counts[0]).toHaveProperty('좋아요수')
  expect(await anon.interactions.mine()).toEqual({ likes: [], bookmarks: [] })
  expect(await anon.interactions.listBookmarked()).toEqual([])
  await expect(anon.interactions.toggleLike('mock-a1', true)).rejects.toThrow('로그인 필요')
})

test('목 저장소 — 좋아요 토글 = 켜기/끄기 대칭, 총계 반영', async () => {
  const me = createMockRepositories({ user: 'mock-staff' })
  const before = (await me.interactions.counts()).find((c) => c.article_id === 'mock-a1')['좋아요수']
  await me.interactions.toggleLike('mock-a1', true)
  const on = (await me.interactions.counts()).find((c) => c.article_id === 'mock-a1')['좋아요수']
  expect(on).toBe(before + 1)
  expect((await me.interactions.mine()).likes).toContain('mock-a1')
  await me.interactions.toggleLike('mock-a1', false)
  const off = (await me.interactions.counts()).find((c) => c.article_id === 'mock-a1')['좋아요수']
  expect(off).toBe(before)
  expect((await me.interactions.mine()).likes).not.toContain('mock-a1')
})

test('supabase 저장소 — 총계는 뷰 조회, 좋아요 해제는 본인 행 DELETE', async () => {
  const calls = []
  const fakeFetch = async (url, options) => {
    calls.push({ url, method: options.method || 'GET' })
    return { ok: true, text: async () => '[]' }
  }
  const backend = createBackend({ url: 'https://x.supabase.co', key: 'anon' }, { fetch: fakeFetch, storage: null })
  backend.auth.getSession = () => ({ user: { id: 'u1' } })
  const repos = createSupabaseRepositories(backend)

  await repos.interactions.counts()
  expect(calls[0].url).toContain('/rest/v1/article_interaction_counts')

  await repos.interactions.toggleLike('a1', false)
  expect(calls[1].method).toBe('DELETE')
  expect(calls[1].url).toContain('/rest/v1/article_likes')
  expect(calls[1].url).toContain('member_id=eq.u1')
})

test('supabase 저장소 — 삭제 화이트리스트 밖 테이블은 요청 자체가 만들어지지 않음', async () => {
  let called = false
  const fakeFetch = async () => { called = true; return { ok: true, text: async () => '[]' } }
  const backend = createBackend({ url: 'https://x.supabase.co', key: 'anon' }, { fetch: fakeFetch, storage: null })
  expect(() => backend.db.remove('articles', { id: 'x' })).toThrow('삭제 불가 테이블')
  expect(called).toBe(false)
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
