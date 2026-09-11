// 2026-09-11 인사이트 개편 계약 — 축·보관·후보출처 잠금·이미지 필수·분량 상한(spec = erp-club/docs/specs/2026-09-11-인사이트-개편.md)
import { expect, test } from 'vitest'
import { validateEntry, validateCandidateLock, parseCandidateTable, isPublicArticle, bodyLength, AXES, NEW_RULES_FROM, BODY_LIMIT } from './schema.js'
import { toDbRow, fromDbRow } from './db-map.js'

const legacy = { title: 't', author: 'a', date: '2026-08-05', source_url: 'u', source_name: 'n', 성격: '심층 분석', 주제: '시장·생태계', 설명: 'd' }
const fresh = { title: 't', author: 'a', date: NEW_RULES_FROM, source_url: 'u', source_name: 'n', 성격: '심층 분석', 축: 'AI활용', 설명: 'd', 이미지: '/img/covers/x.jpg', 이미지설명: 'c', 후보출처: 'weekly-trend-w37#1' }
const f = (d) => `${d.date}-${d.author}-x.md`

test('레거시(개편일 전) = 주제만 있어도 통과 · 축 있으면 enum 검사', () => {
  expect(validateEntry('기사', f(legacy), legacy)).toEqual([])
  expect(validateEntry('기사', f(legacy), { ...legacy, 축: 'AI×MIS' })).toEqual([])
  expect(validateEntry('기사', f(legacy), { ...legacy, 축: '취업시장' })).toContainEqual(expect.stringContaining('축 enum 밖'))
  expect(validateEntry('기사', f(legacy), { ...legacy, 주제: undefined })).toContainEqual('주제 또는 축 필수(1개)')
})

test('새 규칙 글 = 축·이미지·이미지설명·후보출처(심층) 필수, 주제 금지', () => {
  expect(validateEntry('기사', f(fresh), fresh)).toEqual([])
  const errs = validateEntry('기사', f(fresh), { ...fresh, 축: undefined, 이미지: undefined, 이미지설명: undefined, 후보출처: undefined, 주제: '에이전트' })
  expect(errs).toContainEqual(expect.stringContaining('축 필수'))
  expect(errs).toContainEqual(expect.stringContaining('이미지 필수'))
  expect(errs).toContainEqual(expect.stringContaining('이미지설명 필수'))
  expect(errs).toContainEqual(expect.stringContaining('후보출처 필수'))
  expect(errs).toContainEqual(expect.stringContaining('주제는 폐지됨'))
  // 주간(트렌드)은 후보출처 불요
  expect(validateEntry('기사', f(fresh), { ...fresh, 성격: '트렌드', 후보출처: undefined })).toEqual([])
  // 보관 글은 새 규칙 면제
  expect(validateEntry('기사', f(fresh), { ...legacy, date: NEW_RULES_FROM, 보관: true })).toEqual([])
  expect(validateEntry('기사', f(fresh), { ...fresh, 보관: 'yes' })).toContainEqual(expect.stringContaining('보관은 boolean'))
  expect(validateEntry('기사', f(fresh), { ...fresh, 후보출처: 'w37-1' })).toContainEqual(expect.stringContaining('후보출처 형식'))
  expect(validateEntry('기사', f(fresh), { ...fresh, 후보출처: '요청' })).toEqual([])
})

test('분량 상한 = 공백 제외 글자 수(심층 3,000 · 주간 2,500) — 새 규칙 글만', () => {
  const long = '가'.repeat(BODY_LIMIT['심층 분석'] + 1)
  expect(bodyLength('가 나\n다')).toBe(3)
  expect(validateEntry('기사', f(fresh), fresh, long)).toContainEqual(expect.stringContaining('분량 초과'))
  expect(validateEntry('기사', f(fresh), fresh, '가'.repeat(BODY_LIMIT['심층 분석']))).toEqual([])
  expect(validateEntry('기사', f(fresh), { ...fresh, 성격: '트렌드', 후보출처: undefined }, '가'.repeat(2501))).toContainEqual(expect.stringContaining('> 2500자'))
  expect(validateEntry('기사', f(legacy), legacy, long)).toEqual([]) // 레거시 = 소급 없음
})

const weeklyBody = `::: 요약
x
:::

## 심층 후보

| # | 소재 | 축 | ⓪ | ① | ② | ③ | ④ | ⑤ | 링크 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 자소서 폐지 | AI×취업 | T | T | T | T | T | T | 3 |
| 2 | 모델 출시 | AI활용 | T | T | F | T | F | T | 1 |

::: 출처
`

test('parseCandidateTable — ## 심층 후보 절의 표만 파싱(번호·축·⓪~⑤·링크 수)', () => {
  const rows = parseCandidateTable(weeklyBody)
  expect(rows).toHaveLength(2)
  expect(rows[0]).toEqual({ no: 1, 소재: '자소서 폐지', 축: 'AI×취업', gates: [true, true, true, true, true, true], links: 3 })
  expect(rows[1].gates).toEqual([true, true, false, true, false, true])
  expect(parseCandidateTable('## 다른 절\n| 1 | a |')).toEqual([])
  expect(parseCandidateTable('')).toEqual([])
})

test('validateCandidateLock — 후보 표에 있고 전부 T인 소재만 심층 통과', () => {
  const weekly = { file: '2026-09-14-a-weekly-trend-w37.md', slug: '2026-09-14-a-weekly-trend-w37', data: { ...fresh, 성격: '트렌드' }, body: weeklyBody }
  const deep = (ref, over = {}) => ({ file: `${NEW_RULES_FROM}-a-${ref.replace('#', '-')}.md`, slug: 'd', data: { ...fresh, 후보출처: ref, ...over }, body: '' })
  expect(validateCandidateLock([weekly, deep('weekly-trend-w37#1', { 축: 'AI×취업' })])).toEqual([])
  expect(validateCandidateLock([weekly, deep('weekly-trend-w37#2')])[0].errs[0]).toContain('F 있음')
  expect(validateCandidateLock([weekly, deep('weekly-trend-w37#9')])[0].errs[0]).toContain('#9 없음')
  expect(validateCandidateLock([weekly, deep('weekly-trend-w38#1')])[0].errs[0]).toContain('w38 없음')
  expect(validateCandidateLock([weekly, deep('weekly-trend-w37#1', { 축: 'AI활용' })])[0].errs[0]).toContain('축 불일치')
  // 요청 소재·레거시·주간 = 잠금 대상 아님
  expect(validateCandidateLock([weekly, deep('요청')])).toEqual([])
  expect(validateCandidateLock([{ file: 'l', slug: 'l', data: legacy, body: '' }])).toEqual([])
})

test('isPublicArticle — 보관 true만 제외', () => {
  expect(isPublicArticle({ 보관: true })).toBe(false)
  expect(isPublicArticle({ 보관: false })).toBe(true)
  expect(isPublicArticle({})).toBe(true)
  expect(isPublicArticle(null)).toBe(false)
  expect(AXES).toEqual(['AI활용', 'AI×취업', 'AI×MIS'])
})

test('db-map — 축·보관·후보출처 왕복(컬럼 미적용 행은 기본값)', () => {
  const row = toDbRow({ slug: 's', data: fresh, body: 'b' })
  expect(row['축']).toBe('AI활용'); expect(row['보관']).toBe(false); expect(row['후보출처']).toBe('weekly-trend-w37#1'); expect(row['주제']).toBe(null)
  const back = fromDbRow({ ...row, 슬러그: 's', 제목: 't', 게재일: NEW_RULES_FROM, 보관: true })
  expect(back['축']).toBe('AI활용'); expect(back['보관']).toBe(true); expect(back['후보출처']).toBe('weekly-trend-w37#1')
  expect(fromDbRow({ 슬러그: 'x', 제목: 't', 게재일: '2026-08-01' })['보관']).toBe(false)
})
