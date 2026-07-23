import { expect, test } from 'vitest'
import { validateEntry } from './schema.js'

const good = {
  title: 'AI 지형', author: 'bapzzi', date: '2026-07-22',
  source_url: 'https://hai.stanford.edu/x', source_name: 'Stanford HAI',
  용도: ['트렌드·시장'], 기술: ['에이전트'],
}

test('정상 기사 통과 (용도 필수·기술 선택)', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-ai-trend.md', good)).toEqual([])
})
test('기술 없어도 통과(선택)', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-ai-trend.md', { ...good, 기술: undefined })).toEqual([])
})
test('필수 필드 결측 검출(source_url)', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-ai-trend.md', { ...good, source_url: undefined }).length).toBeGreaterThan(0)
})
test('용도 결측 검출', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-x.md', { ...good, 용도: undefined }).some((e) => e.includes('용도'))).toBe(true)
})
test('용도 enum 밖 검출', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-x.md', { ...good, 용도: ['블록체인'] }).some((e) => e.includes('블록체인'))).toBe(true)
})
test('용도 3개 초과 검출(1~2개)', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-x.md', { ...good, 용도: ['업무자동화', '분석·리서치', '기타'] }).some((e) => e.includes('용도'))).toBe(true)
})
test('기술 enum 밖 검출', () => {
  expect(validateEntry('기사', '2026-07-22-bapzzi-x.md', { ...good, 기술: ['채용시장'] }).some((e) => e.includes('채용시장'))).toBe(true)
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
