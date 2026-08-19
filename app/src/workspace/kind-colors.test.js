import { describe, it, expect } from 'vitest'
import { kindClass, itemCategory, itemClass, itemLabel, categoryLabel, LEGEND_CATEGORIES, FALLBACK_CLASS } from './kind-colors.js'
import { POSTING_KINDS } from './postings-logic.js'
import { CAL_CATEGORIES } from './postings-taxonomy.js'

describe('분류 → 클래스', () => {
  it('6분류 전부 서로 다른 클래스를 갖는다', () => {
    const classes = LEGEND_CATEGORIES.map(kindClass)
    expect(new Set(classes).size).toBe(LEGEND_CATEGORIES.length)
    expect(classes).not.toContain(FALLBACK_CLASS)
  })

  it('알 수 없는 분류 = 폴백(프론트가 DB 반영 전에도 깨지지 않는다)', () => {
    expect(kindClass('대외활동')).toBe(FALLBACK_CLASS)   // 0019 이전 값
    expect(kindClass('')).toBe(FALLBACK_CLASS)
    expect(kindClass(undefined)).toBe(FALLBACK_CLASS)
  })

  it('범례 = 구독 카테고리와 같은 집합(축이 갈라지지 않는다)', () => {
    expect(new Set(LEGEND_CATEGORIES)).toEqual(new Set(CAL_CATEGORIES))
    expect(LEGEND_CATEGORIES[0]).toBe('AIM')            // 가장 중요 = 맨 앞
    for (const k of POSTING_KINDS) expect(LEGEND_CATEGORIES).toContain(k)
  })
})

describe('캘린더 항목 → 분류', () => {
  it('공고 항목 = 공고종류별로 갈린다(구 단일 초록 폐기)', () => {
    const 채용 = { source: 'posting', 종류: '공고', 공고종류: '채용' }
    const 자격증 = { source: 'posting', 종류: '공고', 공고종류: '자격증' }
    expect(itemCategory(채용)).toBe('채용')
    expect(itemClass(채용)).not.toBe(itemClass(자격증))
    expect(itemClass(채용)).toBe(kindClass('채용'))
  })

  it('공고종류를 모르면 폴백', () => {
    expect(itemClass({ source: 'posting', 종류: '공고', 공고종류: '대외활동' })).toBe(FALLBACK_CLASS)
    expect(itemClass({ source: 'posting', 종류: '공고' })).toBe(FALLBACK_CLASS)
  })

  it('학사만 학사, 나머지 운영 일정·과제·세션은 전부 AIM', () => {
    expect(itemCategory({ source: 'event', 종류: '학사' })).toBe('학사')
    for (const k of ['일정', '세미나', '모집', '마감', 'AIM']) {
      expect(itemCategory({ source: 'event', 종류: k })).toBe('AIM')
    }
    expect(itemCategory({ source: 'assignment', 종류: '과제' })).toBe('AIM')
    expect(itemCategory({ source: 'session', 종류: '세션' })).toBe('AIM')
    expect(itemCategory({ source: 'weekly', 종류: '과제' })).toBe('AIM')
  })

  it('AIM 클래스는 학사·공고 어느 것과도 겹치지 않는다', () => {
    const aim = itemClass({ source: 'event', 종류: '세미나' })
    expect(aim).toBe(kindClass('AIM'))
    expect(aim).not.toBe(kindClass('학사'))
    for (const k of POSTING_KINDS) expect(aim).not.toBe(kindClass(k))
  })
})

describe('표시명', () => {
  it('일정 2종만 풀어 쓴다', () => {
    expect(categoryLabel('AIM')).toBe('AIM 일정')
    expect(categoryLabel('학사')).toBe('학사일정')
    expect(categoryLabel('채용')).toBe('채용')
    expect(categoryLabel('전체')).toBe('전체')
  })

  it('항목 라벨 — 폴백이면 원래 종류 글자를 그대로 보여 준다', () => {
    expect(itemLabel({ source: 'event', 종류: '세미나' })).toBe('AIM 일정')
    expect(itemLabel({ source: 'posting', 종류: '공고', 공고종류: '채용' })).toBe('채용')
    expect(itemLabel({ source: 'posting', 종류: '공고', 공고종류: '대외활동' })).toBe('공고')
  })
})
