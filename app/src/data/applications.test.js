// 신청 폼 저장소(0006) — 제출 = 익명 허용·return=minimal / 열람 = 운영진만.
// data-layer.test.js에서 분리(300줄 상한). 계약 일치는 data-layer.test.js의 REPO_CONTRACT 테스트가 잡는다.
import { expect, test } from 'vitest'
import { createBackend } from './supabase.js'
import { createSupabaseRepositories } from './repositories.js'
import { createMockRepositories } from './mock.js'

test('목 저장소 — 신청 제출은 비로그인도 가능, 열람은 운영진만(비운영진 = 0행)', async () => {
  const anon = createMockRepositories()
  await anon.applications.submit({ 이름: '가', 학번: '2024000004', 전공: '경영학부', 전화번호: '010-1234-5678', 써본ai: '', 관심주제: '' })
  expect(await anon.applications.list()).toEqual([])            // RLS 동형 — 제출자도 목록 못 봄

  const member = createMockRepositories({ user: 'mock-member' })
  expect(await member.applications.list()).toEqual([])

  const staff = createMockRepositories({ user: 'mock-staff' })
  const rows = await staff.applications.list()
  expect(rows.length).toBeGreaterThan(0)
  expect(rows[0]).toHaveProperty('전화번호')
})

test('supabase 저장소 — 신청 제출은 POST + return=minimal(익명은 select 권한 없음)', async () => {
  const calls = []
  const fakeFetch = async (url, options = {}) => {
    calls.push({ url, method: options.method || 'GET', prefer: options.headers?.Prefer })
    return { ok: true, text: async () => '' }
  }
  const backend = createBackend({ url: 'https://x.supabase.co', key: 'anon' }, { fetch: fakeFetch, storage: null })
  const repos = createSupabaseRepositories(backend)
  await repos.applications.submit({ 이름: '가', 학번: '2024000004', 전공: '경영학부', 전화번호: '010-1234-5678' })
  expect(calls[0].method).toBe('POST')
  expect(calls[0].url).toContain('/rest/v1/applications')
  expect(calls[0].prefer).toBe('return=minimal')

  await repos.applications.list()
  expect(calls[1].url).toContain('/rest/v1/applications')
  expect(calls[1].url).toContain('order=created_at.desc')
})
