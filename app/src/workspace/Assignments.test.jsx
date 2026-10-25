// 과제 탭(2026-09-13 신설) — 3종 판정(순수) + 양식 레지스트리 + 화면 골격 + 저장소 계약(답변 jsonb).
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Assignments, { AssignmentSummary } from './Assignments.jsx'
import {
  dueLabel, dueKeyOf, ddayLabel, isClosed, progressOf, isSubmitted, statusOf,
  sortAssignments, openAssignments, filterAssignments,
} from './assignments-logic.js'
import { ASSIGNMENT_FORMS, FORM_OPTIONS, kindOf, formOf } from '../data/assignment-forms.js'
import { createMockRepositories } from '../data/mock.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')
const member = () => createMockRepositories({ user: 'mock-member' })

// ── 양식 레지스트리 = 코드 원천(오너 픽 2026-09-13: 운영 탭은 고르기만) ──
test('양식 레지스트리 — 체크리스트는 준비물 가이드에서 파생(항목 7·묶음 4), 폼은 재료 카드 4칸', () => {
  const check = ASSIGNMENT_FORMS['prep-ot-prep']
  expect(check.종류).toBe('체크리스트')
  expect(check.items).toHaveLength(7)
  expect(check.groups).toEqual(['계정', '신청', '설치', '제출'])
  expect(check.items[0].하는법).toBe('/guide/ot-prep/#item-pw')

  const form = ASSIGNMENT_FORMS['materials-4']
  expect(form.종류).toBe('폼')
  expect(form.fields).toHaveLength(4)
  expect(form.fields.map((f) => f.key)).toEqual(['q1', 'q2', 'q3', 'q4'])
  expect(FORM_OPTIONS.map((o) => o.key)).toContain('materials-4')
})

test('1기 에이전트 과제 양식 — 칸 2개(발주서 · 지시문 전문) + 자료 6개는 public 파일과 1:1', async () => {
  const { existsSync } = await import('node:fs')
  const { resolve } = await import('node:path')
  const f = ASSIGNMENT_FORMS['agent-order']
  expect(f.종류).toBe('폼')
  expect(f.fields.map((x) => x.key)).toEqual(['order', 'agent'])
  expect(f.fields[1]).toMatchObject({ wide: true, count: true })
  expect(f.자료).toHaveLength(6)
  for (const d of f.자료) {
    expect(d.href.startsWith('/files/aim-agent/')).toBe(true)
    expect(existsSync(resolve(process.cwd(), 'public', d.href.slice(1)))).toBe(true)
  }
  expect(FORM_OPTIONS.map((o) => o.key)).toContain('agent-order')
})

test('폼형 자료 — 내려받기 링크(download) · 넓은 칸 · 글자 수 표시', async () => {
  const { FieldForm } = await import('./AssignmentForms.jsx')
  const form = ASSIGNMENT_FORMS['agent-order']
  const html = flat(<FieldForm row={{ id: 'a9', 제목: '에이전트 과제' }} form={form} mine={null} onSubmit={() => {}} />)
  expect(html).toContain('자료 내려받기')
  expect(html).toContain('href="/files/aim-agent/aim-agent-orders.zip"')
  expect(html).toContain('download="AIM-에이전트-과제-파일.zip"')
  expect(html).toContain('ws-afield wide')
  expect(html).toContain('0자')
  expect(html).not.toContain('https://') // 주소를 글자로 쓰지 않는다(링크 표기 규칙)
})

test('kindOf·formOf — 0025 미적용이거나 모르는 양식키면 링크형으로 강등', () => {
  expect(kindOf({})).toBe('링크')
  expect(kindOf({ 종류: '폼', 양식키: 'materials-4' })).toBe('폼')
  expect(kindOf({ 종류: '폼', 양식키: '없는키' })).toBe('링크')
  expect(formOf({ 종류: '폼', 양식키: '없는키' })).toBeNull()
  expect(formOf({ 종류: '체크리스트', 양식키: 'prep-ot-prep' }).items).toHaveLength(7)
})

// ── 판정(순수) ──
test('마감 표시 — 없음·예정·지남 3상태', () => {
  const now = new Date('2026-09-10T00:00:00Z')
  expect(dueLabel(null, now)).toBe('마감 없음')
  expect(dueLabel('2026-09-20T09:00:00Z', now)).toContain('마감 2026-09-20')
  expect(dueLabel('2026-09-01T09:00:00Z', now)).toContain('마감됨')
  expect(dueKeyOf({ 마감: '2026-09-20T09:00:00+09:00' })).toBe('2026-09-20')
  expect(dueKeyOf({})).toBeNull()
  expect(isClosed({ 마감: '2026-09-01T09:00:00Z' }, now)).toBe(true)
  expect(ddayLabel({ 마감: '2026-09-01T09:00:00Z' }, '2026-09-10')).toBe('')
})

test('제출 인정 — 링크형 = url · 폼형 = 한 칸 이상 · 체크리스트형 = 전 항목', () => {
  const link = { id: 'a1', 종류: '링크' }
  expect(isSubmitted(link, null)).toBe(false)
  expect(isSubmitted(link, { url: 'https://x.test/a' })).toBe(true)

  const form = { id: 'a2', 종류: '폼', 양식키: 'materials-4' }
  expect(isSubmitted(form, { 답변: { q1: '  ' } })).toBe(false)
  expect(isSubmitted(form, { 답변: { q1: '경영정보시스템' } })).toBe(true)

  const check = { id: 'a3', 종류: '체크리스트', 양식키: 'prep-ot-prep' }
  const all = Object.fromEntries(ASSIGNMENT_FORMS['prep-ot-prep'].items.map((i) => [i.key, true]))
  expect(progressOf(formOf(check), { 답변: { pw: true } })).toEqual({ done: 1, total: 7 })
  expect(isSubmitted(check, { 답변: { pw: true } })).toBe(false)
  expect(isSubmitted(check, { 답변: all })).toBe(true)
})

test('상태 3값 — 제출했으면 늦어도 제출함', () => {
  const now = new Date('2026-09-22T00:00:00+09:00')
  const past = { id: 'a1', 종류: '링크', 마감: '2026-09-21T18:00:00+09:00' }
  expect(statusOf(past, null, now)).toBe('마감됨')
  expect(statusOf(past, { url: 'https://x.test/a' }, now)).toBe('제출함')
  expect(statusOf({ id: 'a2', 종류: '링크' }, null, now)).toBe('미제출')
})

test('정렬 — 미제출·마감 가까운 순 → 마감 없는 것 → 끝난 것', () => {
  const now = new Date('2026-09-15T00:00:00+09:00')
  const rows = [
    { id: 'done', 제목: '끝', 종류: '링크', 마감: '2026-09-16T18:00:00+09:00' },
    { id: 'far', 제목: '먼 것', 종류: '링크', 마감: '2026-09-28T18:00:00+09:00' },
    { id: 'none', 제목: '마감 없음', 종류: '링크' },
    { id: 'soon', 제목: '가까운 것', 종류: '링크', 마감: '2026-09-17T18:00:00+09:00' },
  ]
  const subs = [{ assignment_id: 'done', url: 'https://x.test/a' }]
  expect(sortAssignments(rows, subs, now).map((r) => r.id)).toEqual(['soon', 'far', 'none', 'done'])
  expect(openAssignments(rows, subs, now).map((r) => r.id)).toEqual(['soon', 'far', 'none'])
  expect(filterAssignments(rows, subs, '제출함', now).map((r) => r.id)).toEqual(['done'])
  expect(filterAssignments(rows, subs, '전체', now)).toHaveLength(4)
})

// ── 화면 ──
test('과제 탭 골격 = 2열(본문 + 레일) · 5건 미만이면 필터 칩 없음', () => {
  const html = flat(<Assignments store={member()} />)
  expect(html).toContain('ws-assignments')
  expect(html).toContain('ws-cols')
  expect(html).toContain('ws-crail')
  expect(html).toContain('내는 법')
  expect(html).not.toContain('ws-nchips')
})

test('홈 요약 = 과제 제목·마감만, 제출 칸 없음(오너 2026-09-13)', () => {
  const html = flat(<AssignmentSummary store={member()} />)
  expect(html).toContain('과제')
  expect(html).not.toContain('ws-aform')
  expect(html).not.toContain('ws-achecklist')
})

// ── 저장소 계약(0025 답변 jsonb) ──
test('제출 저장 — 링크와 답변은 서로를 지우지 않는다', async () => {
  const store = member()
  const created = await store.submissions.submit({ assignment_id: 'mock-h1', 답변: { q1: '가' } })
  expect(created['답변']).toEqual({ q1: '가' })
  expect(created.url).toBeUndefined()

  const again = await store.submissions.submit({ id: created.id, assignment_id: 'mock-h1', 답변: { q1: '가', q2: '나' } })
  expect(again['답변']).toEqual({ q1: '가', q2: '나' })

  const withUrl = await store.submissions.submit({ id: created.id, assignment_id: 'mock-h1', url: 'https://x.test/a' })
  expect(withUrl.url).toBe('https://x.test/a')
  expect(withUrl['답변']).toEqual({ q1: '가', q2: '나' })   // 답변이 살아 있다
})
