import { expect, test } from 'vitest'
import { validateEntry, isContentFile } from './schema.js'

// ── 게재·검증 대상 판별(`_` 시작=템플릿·초안 제외) ──
test('isContentFile — .md만·`_` 시작 제외', () => {
  expect(isContentFile('2026-07-22-bapzzi-x.md')).toBe(true)
  expect(isContentFile('_template.md')).toBe(false) // 템플릿 제외
  expect(isContentFile('_draft-초안.md')).toBe(false) // 초안 제외
  expect(isContentFile('README.txt')).toBe(false)
  expect(isContentFile(undefined)).toBe(false)
})

const good = {
  title: 'AI 지형', author: 'bapzzi', date: '2026-07-22',
  source_url: 'https://hai.stanford.edu/x', source_name: 'Stanford HAI',
  성격: '심층 분석', 주제: '시장·생태계',
}

test('정상 기사 통과 (성격·주제 필수·지금써먹기 없음)', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-ai-trend.md', good)).toEqual([])
})
test('지금써먹기=true(boolean)면 통과', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-ai-trend.md', { ...good, 지금써먹기: true })).toEqual([])
})
test('지금써먹기=false(boolean)면 통과', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-ai-trend.md', { ...good, 지금써먹기: false })).toEqual([])
})
test('지금써먹기가 boolean 아니면 검출(문자열 위반)', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-x.md', { ...good, 지금써먹기: 'true' }).some((e) => e.includes('지금써먹기'))).toBe(true)
})
test('이미지=문자열 경로면 통과', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-ai-trend.md', { ...good, 이미지: '/img/기사/claude.png' })).toEqual([])
})
test('이미지=URL이면 통과', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-ai-trend.md', { ...good, 이미지: 'https://ex.com/a.png' })).toEqual([])
})
test('이미지가 문자열 아니면 검출(빈문자열·불리언 위반)', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-x.md', { ...good, 이미지: '' }).some((e) => e.includes('이미지'))).toBe(true)
  expect(validateEntry('기사', '2026-07-22-bapzzi-x.md', { ...good, 이미지: true }).some((e) => e.includes('이미지'))).toBe(true)
})
test('고정=true(boolean)면 통과', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-ai-trend.md', { ...good, 고정: true })).toEqual([])
})
test('고정이 boolean 아니면 검출(문자열 위반)', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-x.md', { ...good, 고정: 'true' }).some((e) => e.includes('고정'))).toBe(true)
})
test('필수 필드 결측 검출(source_url)', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-ai-trend.md', { ...good, source_url: undefined }).length).toBeGreaterThan(0)
})
test('성격 결측 검출', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-x.md', { ...good, 성격: undefined }).some((e) => e.includes('성격'))).toBe(true)
})
test('성격 enum 밖 검출', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-x.md', { ...good, 성격: '블록체인' }).some((e) => e.includes('블록체인'))).toBe(true)
})
test('성격 배열이면 검출(단일 문자열만 허용)', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-x.md', { ...good, 성격: ['심층 분석'] }).some((e) => e.includes('성격'))).toBe(true)
})
test('주제 결측 검출', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-x.md', { ...good, 주제: undefined }).some((e) => e.includes('주제'))).toBe(true)
})
test('주제 enum 밖 검출', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-x.md', { ...good, 주제: '채용시장' }).some((e) => e.includes('채용시장'))).toBe(true)
})
test('주제 배열이면 검출(단일 문자열만 허용)', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-x.md', { ...good, 주제: ['에이전트'] }).some((e) => e.includes('주제'))).toBe(true)
})
test('파일명-frontmatter 불일치 검출(date·author 프리픽스)', () => {
  expect(validateEntry('기사', '2026-01-01-other-x.md', good).length).toBeGreaterThan(0)
})

// ── 세미나 (CR4: 유형=실습 → 3블록 헤딩 전부 존재) ──
const semBase = { title: '1회', author: 'bapzzi', date: '2026-09-01', 회차: '1' }
const LAB_BODY = '서문\n\n## 준비\n환경 세팅\n\n## 진행\n실습 단계\n\n## 재현 가이드\n혼자 따라하기\n'

test('세미나 인지: 회차·유형만 통과(본문 자유)', () => {
  expect(validateEntry('세미나', '2026-09-01-bapzzi-s1.md', { ...semBase, 유형: '인지' }, '자유 본문')).toEqual([])
})
test('세미나 회차 비숫자·유형 enum 밖 검출', () => {
  expect(validateEntry('세미나', '2026-09-01-bapzzi-s1.md', { ...semBase, 회차: '일', 유형: '토론' }, '').length).toBe(2)
})
test('세미나 실습: 3블록 헤딩 모두 있으면 통과', () => {
  expect(validateEntry('세미나', '2026-09-01-bapzzi-s1.md', { ...semBase, 유형: '실습' }, LAB_BODY)).toEqual([])
})
test('CR4 실증 — 실습인데 헤딩 결측 → 실패(위반 픽스처)', () => {
  const missing = '서문\n\n## 준비\n환경만 있음\n' // 진행·재현 가이드 없음
  const errs = validateEntry('세미나', '2026-09-01-bapzzi-s1.md', { ...semBase, 유형: '실습' }, missing)
  expect(errs.some((e) => e.includes('진행'))).toBe(true)
  expect(errs.some((e) => e.includes('재현 가이드'))).toBe(true)
})
test('frontmatter 자체 없음(data null)', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-x.md', null)).toEqual(['frontmatter 없음'])
})
