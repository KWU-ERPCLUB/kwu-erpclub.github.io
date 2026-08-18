// /recruit 신청 폼 — 렌더 상태(연결/미연결) + 어댑터 검증·제출 규칙.
// 상호작용은 어댑터 함수 단위로 검증(SSR 테스트 체계 — testing-library 미사용).
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import RecruitForm from './RecruitForm.jsx'
import { validateApplication, submitApplication, EMPTY_APPLICATION, applyPhase, composeAiText, composeTopicText } from './pages/apply-source.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

const VALID = { 이름: '가나다', 학번: '2024000004', 전공: '경영학부', 전화번호: '010-1234-5678', 써본ai: ' ChatGPT ', 관심주제: '' }

const OPEN_DAY = '2026-09-01' // 모집 창 안(RECRUIT.window ~ 09-08)

// 2026-08-18 개편 — 세로 1열·빨간 *·써본 AI 체크형·팀 프로젝트 주제 관심 체크.
test('모집 창 안 + 백엔드 연결 시 = 필수 4필드(*) + 체크 그룹 2벌 + 개인정보 문구 렌더', () => {
  const html = flat(<RecruitForm configured={true} today={OPEN_DAY} />)
  for (const label of ['이름', '학번', '학부/전공', '전화번호', '지금까지 써본 AI', '팀 프로젝트 주제']) {
    expect(html).toContain(label)
  }
  expect(html).toContain('rc-req')                    // 필수 = * 표기
  expect(html).toContain('ChatGPT')                   // AI 체크 선택지
  expect(html).toContain('연구회 운영 자동화')          // 주제 풀(§E) 체크 선택지
  expect(html).toContain('type="checkbox"')
  expect(html).not.toContain('rc-form-grid')          // 2열 그리드 폐지 — 세로 1열
  expect(html).toContain('모집 연락·기수 운영')      // 개인정보 용도 1줄
  expect(html).toContain('신청 제출')
})

test('체크 합성 — 써본 AI(체크+기타)·주제(체크+자유)를 text 컬럼 문자열로', () => {
  expect(composeAiText(['ChatGPT', 'Claude'], ' 감마 ')).toBe('ChatGPT, Claude, 기타: 감마')
  expect(composeAiText([], '')).toBe('')
  expect(composeTopicText(['알바 업무 재설계'], '프롬프트')).toBe('알바 업무 재설계 / 프롬프트')
  expect(composeTopicText([], '프롬프트만')).toBe('프롬프트만')
  expect(composeTopicText(['교내 행정 재설계'], '')).toBe('교내 행정 재설계')
})

test('백엔드 미연결 시 = 폼 대신 제출 불가 안내(조용한 목 폴백 금지)', () => {
  const html = flat(<RecruitForm configured={false} today={OPEN_DAY} />)
  expect(html).toContain('받을 수 없습니다') // 문안 개정 2026-08-15(대시·기계 표현 제거) — 의미 = 제출 불가
  expect(html).not.toContain('신청 제출')
  expect(html).not.toContain('<input')
})

// 창 개편(오너 2026-08-18 2차) — start = 폼 공개일(08-18)로 당김: "25일부터"는 폐기, 표기는 마감만.
test('접수 국면 — 폼 공개일부터 open, 마감 다음 날 after', () => {
  expect(applyPhase('2026-08-18', {})).toBe('open')   // 폼 공개일 = 접수 시작
  expect(applyPhase('2026-08-25', {})).toBe('open')
  expect(applyPhase('2026-09-08', {})).toBe('open')   // 마감일 포함
  expect(applyPhase('2026-09-09', {})).toBe('after')

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
