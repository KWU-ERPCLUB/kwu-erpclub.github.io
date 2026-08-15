// /recruit 신청 폼 — 렌더 상태(연결/미연결) + 어댑터 검증·제출 규칙.
// 상호작용은 어댑터 함수 단위로 검증(SSR 테스트 체계 — testing-library 미사용).
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import RecruitForm from './RecruitForm.jsx'
import { validateApplication, submitApplication, EMPTY_APPLICATION, applyPhase } from './pages/apply-source.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

const VALID = { 이름: '가나다', 학번: '2024000004', 전공: '경영학부', 전화번호: '010-1234-5678', 써본ai: ' ChatGPT ', 관심주제: '' }

const OPEN_DAY = '2026-09-01' // 모집 창 안(RECRUIT.window 2026-08-25 ~ 09-08)

test('모집 창 안 + 백엔드 연결 시 = 필수 4필드 + 자유 서술 2필드 + 개인정보 문구 렌더', () => {
  const html = flat(<RecruitForm configured={true} today={OPEN_DAY} />)
  for (const label of ['이름', '학번', '학부/전공', '전화번호', '지금까지 써본 AI', '관심 있는 주제']) {
    expect(html).toContain(label)
  }
  expect(html).toContain('모집 연락·기수 운영')      // 개인정보 용도 1줄
  expect(html).toContain('신청 제출')
})

test('백엔드 미연결 시 = 폼 대신 제출 불가 안내(조용한 목 폴백 금지)', () => {
  const html = flat(<RecruitForm configured={false} today={OPEN_DAY} />)
  expect(html).toContain('받을 수 없습니다') // 문안 개정 2026-08-15(대시·기계 표현 제거) — 의미 = 제출 불가
  expect(html).not.toContain('신청 제출')
  expect(html).not.toContain('<input')
})

// 모집 창 연동(2026-08-05) — 창 밖 상시 접수는 "기간 내 접수분만 유효" 카피와 모순이었다.
test('접수 국면 3분기 — 창 전=접수 시작일 안내 / 창 안=폼 / 창 후=다음 기수 안내', () => {
  expect(applyPhase('2026-08-24', {})).toBe('before')
  expect(applyPhase('2026-08-25', {})).toBe('open')   // 경계일 포함
  expect(applyPhase('2026-09-08', {})).toBe('open')
  expect(applyPhase('2026-09-09', {})).toBe('after')

  const before = flat(<RecruitForm configured={true} today="2026-08-01" />)
  expect(before).toContain('접수 시작 2026-08-25')
  expect(before).not.toContain('<input')

  const open = flat(<RecruitForm configured={true} today={OPEN_DAY} />)
  expect(open).toContain('<input')

  const after = flat(<RecruitForm configured={true} today="2026-09-20" />)
  expect(after).toContain('모집 마감')
  expect(after).toContain('다음 기수')
  expect(after).not.toContain('<input')
})

// 로컬 폼 점검용 탈출구 — 프로덕션엔 미설정(창 밖에서도 열리는 유일한 경로)
test('개발 오버라이드 VITE_APPLY_FORCE_OPEN=1 = 창 무관 open', () => {
  expect(applyPhase('2026-01-01', { VITE_APPLY_FORCE_OPEN: '1' })).toBe('open')
})

test('필수 검증 — 빈 폼은 4필드 전부 오류, 유효 폼은 통과', () => {
  const empty = validateApplication(EMPTY_APPLICATION)
  expect(Object.keys(empty).sort()).toEqual(['이름', '전공', '전화번호', '학번'].sort())
  expect(validateApplication(VALID)).toEqual({})
  expect(validateApplication({ ...VALID, 학번: '20a4' })['학번']).toContain('숫자만')
  expect(validateApplication({ ...VALID, 전화번호: '010-12' })['전화번호']).toContain('숫자·하이픈')
  expect(validateApplication({ ...VALID, 전화번호: '공일공-1234' })['전화번호']).toBeTruthy()
})

test('제출 — trim된 값으로 저장소 submit 호출, 미연결이면 즉시 오류', async () => {
  let sent = null
  const repos = { applications: { submit: async (row) => { sent = row; return true } } }
  await submitApplication(VALID, { repos, configured: true })
  expect(sent['써본ai']).toBe('ChatGPT')
  expect(sent['학번']).toBe('2024000004')

  await expect(submitApplication(VALID, { repos, configured: false })).rejects.toThrow('제출 불가')
})
