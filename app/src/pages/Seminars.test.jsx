import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Seminars, { splitSeminarBody } from './Seminars.jsx'

test('디자인된 빈 상태 — 무엇이 쌓이는지 + 기고 방법', () => {
  const html = renderToString(<Seminars />)
  expect(html).toContain('아직 세미나 기록이 없습니다.')
  expect(html).toContain('content/세미나/') // 기고 방법 안내
  expect(html).toContain('SEMINARS') // 눈썹 인덱스(§3-1)
})

test('본문 3블록 분할 — ## 헤딩 기준', () => {
  const body = '서문 문장\n\n## 준비\n환경 세팅\n\n## 진행\n실습 단계\n\n## 재현 가이드\n혼자 따라하기'
  const { intro, sections } = splitSeminarBody(body)
  expect(intro).toBe('서문 문장')
  expect(sections['준비']).toBe('환경 세팅')
  expect(sections['진행']).toBe('실습 단계')
  expect(sections['재현 가이드']).toBe('혼자 따라하기')
})

test('헤딩 없는 본문 — intro만', () => {
  const { intro, sections } = splitSeminarBody('그냥 본문')
  expect(intro).toBe('그냥 본문')
  expect(Object.keys(sections)).toEqual([])
})
