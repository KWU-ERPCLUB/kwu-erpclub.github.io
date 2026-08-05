// /recruit 신청 폼 — 렌더 상태(연결/미연결) + 어댑터 검증·제출 규칙.
// 상호작용은 어댑터 함수 단위로 검증(SSR 테스트 체계 — testing-library 미사용).
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import RecruitForm from './RecruitForm.jsx'
import { validateApplication, submitApplication, EMPTY_APPLICATION } from './pages/apply-source.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

const VALID = { 이름: '가나다', 학번: '2024000004', 전공: '경영학부', 전화번호: '010-1234-5678', 써본ai: ' ChatGPT ', 관심주제: '' }

test('백엔드 연결 시 = 필수 4필드 + 자유 서술 2필드 + 개인정보 문구 렌더', () => {
  const html = flat(<RecruitForm configured={true} />)
  for (const label of ['이름', '학번', '학부/전공', '전화번호', '지금까지 써본 AI', '관심 있는 주제']) {
    expect(html).toContain(label)
  }
  expect(html).toContain('모집 연락·기수 운영')      // 개인정보 용도 1줄
  expect(html).toContain('신청 제출')
})

test('백엔드 미연결 시 = 폼 대신 제출 불가 안내(조용한 목 폴백 금지)', () => {
  const html = flat(<RecruitForm configured={false} />)
  expect(html).toContain('제출 불가')
  expect(html).not.toContain('신청 제출')
  expect(html).not.toContain('<input')
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
