// 기고 1트랙 파서 계약 테스트 — spec 2026-08-05-기고-투트랙 §1-3·§6 T1·T2.
// 픽스처는 형식 상수(delimOf)로 조립한다 — 구분자 정의가 바뀌어도 계약(분배 규칙)만 검증.
import { expect, test } from 'vitest'
import { parseContribution } from './contrib-parser.js'
import { delimOf } from './contrib-format.js'
import { NATURES, TOPICS } from '../content/schema.js'

const block = (name, value) => `${delimOf(name)}\n${value}`

// T1: 정상 입력 → 7필드 전부 폼 키로 분배
test('정상 키트 출력 → 7필드 전부 분배', () => {
  const text = [
    block('제목', 'AI 에이전트 도입 현황'),
    block('설명', '카드 1줄 설명'),
    block('성격', NATURES[1]),
    block('주제', TOPICS[0]),
    block('출처링크', 'https://example.com/post'),
    block('출처이름', '예시 매체'),
    block('본문', '## 개요\n\n첫 문단.\n\n둘째 문단.'),
  ].join('\n')
  const r = parseContribution(text)
  expect(r.matched).toBe(7)
  expect(r.values).toEqual({
    제목: 'AI 에이전트 도입 현황',
    설명: '카드 1줄 설명',
    성격: NATURES[1],
    주제: TOPICS[0],
    source_url: 'https://example.com/post',
    source_name: '예시 매체',
    본문: '## 개요\n\n첫 문단.\n\n둘째 문단.',
  })
  expect(r.notices).toEqual([])
})

// T2-1: 필드 누락 → 해당 폼 키 미포함(빈칸 유지) + 누락 목록 안내
test('필드 누락 → 빈칸 유지 + 누락 목록 안내', () => {
  const text = [
    block('제목', '제목만 있는 초안'),
    block('본문', '본문 내용'),
  ].join('\n')
  const r = parseContribution(text)
  expect(r.values).toEqual({ 제목: '제목만 있는 초안', 본문: '본문 내용' })
  expect(r.values['설명']).toBeUndefined()
  expect(r.values.source_url).toBeUndefined()
  const notice = r.notices.find((n) => n.includes('누락 필드'))
  for (const name of ['설명', '성격', '주제', '출처링크', '출처이름']) expect(notice).toContain(name)
})

// T2-2: 성격·주제 enum 밖 → 기본값 유지(키 미포함) + 안내(조용한 실패 금지)
test('성격·주제 enum 밖 → 기본값 유지 + 안내', () => {
  const text = [
    block('제목', 'enum 밖 값 초안'),
    block('설명', '한 줄'),
    block('성격', '뉴스·동향'),
    block('주제', '블록체인'),
    block('출처링크', 'https://example.com'),
    block('출처이름', '예시'),
    block('본문', '본문'),
  ].join('\n')
  const r = parseContribution(text)
  expect(r.values['성격']).toBeUndefined()
  expect(r.values['주제']).toBeUndefined()
  expect(r.values['제목']).toBe('enum 밖 값 초안')
  expect(r.notices.some((n) => n.includes('성격') && n.includes('기본값'))).toBe(true)
  expect(r.notices.some((n) => n.includes('주제') && n.includes('기본값'))).toBe(true)
})

// T2-3: 구분자 0개 → 본문에 넣지 않고 형식 안내만(오붙임 방지)
test('구분자 0개 → 값 분배 없음 + 형식 안내만', () => {
  const r = parseContribution('구분자 없이 그냥 쓴 긴 글.\n둘째 줄.')
  expect(r.matched).toBe(0)
  expect(r.values).toEqual({})
  expect(r.values['본문']).toBeUndefined()
  expect(r.notices.length).toBe(1)
  expect(r.notices[0]).toContain('구분자')
})
