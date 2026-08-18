// /recruit 신청 폼 — 렌더 상태(연결/미연결) + 어댑터 검증·제출 규칙.
// 상호작용은 어댑터 함수 단위로 검증(SSR 테스트 체계 — testing-library 미사용).
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import RecruitForm from './RecruitForm.jsx'
import {
  validateApplication, submitApplication, EMPTY_APPLICATION, applyPhase,
  composeAiText, composeTopicText, composeMajorText, isValidHakbeon,
} from './pages/apply-source.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

const VALID = { 이름: '가나다', 학번: '2024000004', 전공: '경영학부', 전화번호: '010-1234-5678', 써본ai: ' ChatGPT ', 관심주제: '' }

const OPEN_DAY = '2026-09-01' // 모집 창 안(RECRUIT.window ~ 09-08)

// 2026-08-18 개편(+같은 날 2차) — 세로 1열·빨간 *·체크 그룹 2벌(기타 내장)·지원 계기·설명 = 제목 아래 블록.
test('모집 창 안 + 백엔드 연결 시 = 필수 4필드(*) + 체크 그룹 2벌 + 지원 계기 + 개인정보 문구 렌더', () => {
  const html = flat(<RecruitForm configured={true} today={OPEN_DAY} />)
  for (const label of ['이름', '학번', '학부/전공', '전화번호', '지금까지 써본 AI', '관심 있는 주제', '지원 계기']) {
    expect(html).toContain(label)
  }
  expect(html).toContain('rc-req')                    // 필수 = * 표기
  expect(html).not.toContain('숫자 10자리')            // 학번 = 형식 설명·예시 미게재(3차 — 라이브 빨간 표시만)
  expect(html).not.toContain('2021508001')
  expect(html).toContain('예: 010-1234-5678')         // 전화번호 하이픈 예시
  // 전공 = 광운대 학부 토글 select(+부/복수전공)
  expect(html).toContain('<select')
  expect(html).toContain('경영대학')                   // optgroup(단과대학)
  expect(html).toContain('경영학부')                   // option(학부/전공)
  expect(html).toContain('복수전공')                   // 부/복수전공 구분
  expect(html).toContain('기타(직접 입력)')
  expect(html).toContain('중복 선택 가능')             // 체크 그룹 설명
  expect(html).toContain('추후 프로젝트 구성 시 참조')  // 주제 그룹 설명
  for (const ai of ['ChatGPT', 'Claude Code', 'Codex', 'Cursor', 'NotebookLM', '없음', '기타']) {
    expect(html).toContain(ai)                        // AI 목록 2026-08-18 기준 + 기타 내장
  }
  expect(html).toContain('연구회 운영 자동화')          // 주제 풀(§E) 체크 선택지
  expect(html).toContain('type="checkbox"')
  expect(html).not.toContain('rc-etc"')               // 구 별도 기타 필드 폐지(내장 rc-etc-input으로)
  expect(html).toContain('최대 500자')                 // 지원 계기 상한 안내
  expect(html).toContain('모집 연락·기수 운영')      // 개인정보 용도 1줄
  expect(html).toContain('신청 제출')
})

test('전공 합성 — 주전공 단독 / 부·복수전공 병기 / 주전공 없으면 빈 값(검증에 걸림)', () => {
  expect(composeMajorText('경영학부')).toBe('경영학부')
  expect(composeMajorText('경영학부', '복수전공', '소프트웨어학부')).toBe('경영학부 (복수전공: 소프트웨어학부)')
  expect(composeMajorText('경영학부', '부전공', ' 산업심리학과 ')).toBe('경영학부 (부전공: 산업심리학과)')
  expect(composeMajorText('경영학부', '복수전공', '')).toBe('경영학부')   // 구분만 고르고 전공 미선택 = 주전공만
  expect(composeMajorText('', '복수전공', '소프트웨어학부')).toBe('')
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
  // 학번 = 정확히 숫자 10자리(2026-08-18) — 9자리·11자리·문자 섞임 전부 오류(문구는 미노출 원칙 — '확인'만)
  expect(isValidHakbeon('2021508001')).toBe(true)
  for (const bad of ['20a4', '202150800', '20215080011', '']) expect(isValidHakbeon(bad)).toBe(false)
  expect(validateApplication({ ...VALID, 학번: '202150800' })['학번']).toContain('확인')
  expect(validateApplication({ ...VALID, 학번: '2021508001' })['학번']).toBeUndefined()
  expect(validateApplication({ ...VALID, 전화번호: '010-12' })['전화번호']).toContain('숫자·하이픈')
  expect(validateApplication({ ...VALID, 전화번호: '공일공-1234' })['전화번호']).toBeTruthy()
  // 지원 계기 = 500자 상한(선택 필드 — 비어도 통과)
  expect(validateApplication({ ...VALID, 지원계기: 'a'.repeat(501) })['지원계기']).toContain('500자')
  expect(validateApplication({ ...VALID, 지원계기: 'a'.repeat(500) })['지원계기']).toBeUndefined()
})

test('제출 — trim된 값으로 저장소 submit 호출, 미연결이면 즉시 오류', async () => {
  let sent = null
  const repos = { applications: { submit: async (row) => { sent = row; return true } } }
  await submitApplication(VALID, { repos, configured: true })
  expect(sent['써본ai']).toBe('ChatGPT')
  expect(sent['학번']).toBe('2024000004')
  expect('지원계기' in sent).toBe(false)   // 빈 계기 = 컬럼 자체 미포함(0017 미적용 DB 안전)

  await submitApplication({ ...VALID, 지원계기: ' 계기 텍스트 ' }, { repos, configured: true })
  expect(sent['지원계기']).toBe('계기 텍스트')

  await expect(submitApplication(VALID, { repos, configured: false })).rejects.toThrow('제출 불가')
})

// 0017 미적용 DB 폴백 — 지원계기 컬럼 오류면 관심주제에 합성해 1회 재시도(라이브 폼 무중단)
test('지원계기 컬럼 미적용 시 = 관심주제 합성으로 재시도', async () => {
  const calls = []
  const repos = { applications: { submit: async (row) => {
    calls.push(row)
    if ('지원계기' in row) throw new Error("Could not find the '지원계기' column of 'applications'")
    return true
  } } }
  await submitApplication({ ...VALID, 관심주제: '체크 주제', 지원계기: '계기' }, { repos, configured: true })
  expect(calls.length).toBe(2)
  expect('지원계기' in calls[1]).toBe(false)
  expect(calls[1]['관심주제']).toBe('체크 주제 / 지원계기: 계기')

  // 다른 오류는 재시도 없이 그대로 전파
  const failing = { applications: { submit: async () => { throw new Error('network down') } } }
  await expect(submitApplication({ ...VALID, 지원계기: '계기' }, { repos: failing, configured: true }))
    .rejects.toThrow('network down')
})
