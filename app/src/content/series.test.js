import { expect, test } from 'vitest'
import { SERIES, SERIES_IDS, seriesById, seriesFromSlug, seriesIdOf, seriesOf, seriesCaption } from './series.js'
import { validateEntry } from './schema.js'
import { toDbRow, fromDbRow } from './db-map.js'

// 레지스트리 레코드 형태 = 새 시리즈를 1레코드로 추가할 수 있는지의 계약.
test('레지스트리 — 레코드 5필드 + 1기 weekly 등록', () => {
  expect(SERIES.length).toBeGreaterThan(0)
  for (const s of SERIES) {
    expect(typeof s.id).toBe('string')
    // 커버 = 정적 파일 경로가 아니라 **컴포넌트 id**(v3, 2026-08-05 — 커버에 회차 주차 텍스트가 들어감)
    for (const k of ['표시명', '설명', '주기', '커버컴포넌트']) expect(typeof s[k]).toBe('string')
    expect(s.커버).toBe(undefined)
  }
  expect(SERIES_IDS).toContain('weekly')
  expect(seriesById('weekly').표시명).toBe('주간 AI 트렌드')
  expect(seriesById('없는id')).toBe(null)
})

// 슬러그 자동 인식 = 주간 트렌드 발행 루틴을 고치지 않고 호환시키는 장치.
test('슬러그 자동 인식 — weekly-trend 포함 = weekly 귀속', () => {
  expect(seriesFromSlug('2026-08-03-bapzzi-weekly-trend-w31')).toBe('weekly')
  expect(seriesFromSlug('2026-08-05-bapzzi-eu-ai-act-aug2')).toBe(null)
  expect(seriesFromSlug('')).toBe(null)
  // frontmatter 없이 슬러그만으로도 귀속
  expect(seriesIdOf({ slug: '2026-08-03-bapzzi-weekly-trend-w31' })).toBe('weekly')
})

test('귀속 우선순위 — frontmatter 시리즈 우선, enum 밖이면 슬러그 폴백', () => {
  expect(seriesIdOf({ '시리즈': 'weekly', slug: '아무거나' })).toBe('weekly')
  expect(seriesIdOf({ '시리즈': '오타', slug: 'x-weekly-trend-y' })).toBe('weekly')
  expect(seriesIdOf({ '시리즈': '오타', slug: '무관' })).toBe(null)
  expect(seriesOf({ slug: '무관' })).toBe(null)
})

test('상세 히어로 캡션 자동 생성 — 표시명 + 주기', () => {
  expect(seriesCaption(seriesById('weekly'))).toBe('주간 AI 트렌드 — 매주 월요일 발행하는 시리즈')
  expect(seriesCaption(null)).toBe('')
})

// 계약 검사 = 오타 차단(생략은 허용 — 슬러그 인식이 받는다).
test('schema — 시리즈는 선택, 값은 레지스트리 id만', () => {
  const base = {
    title: 't', author: 'a', date: '2026-08-05', source_url: 'u', source_name: 'n',
    성격: '트렌드', 주제: '시장·생태계', 설명: 'd',
  }
  const file = '2026-08-05-a-x.md'
  expect(validateEntry('기사', file, base)).toEqual([])
  expect(validateEntry('기사', file, { ...base, 시리즈: 'weekly' })).toEqual([])
  expect(validateEntry('기사', file, { ...base, 시리즈: 'weekli' }).join()).toContain('시리즈 enum 밖')
})

// DB 왕복 — 슬러그 인식이 sync(toDbRow)·서빙(fromDbRow) 양쪽에서 동일하게 작동한다.
test('db-map — 시리즈 왕복 + 슬러그 인식(0005 미적용 행도 복원)', () => {
  const data = { title: 't', author: 'a', date: '2026-08-03', 설명: 'd', 성격: '트렌드', 주제: '시장·생태계' }
  const row = toDbRow({ slug: '2026-08-03-a-weekly-trend-w31', data, body: '' })
  expect(row['시리즈']).toBe('weekly')
  expect(fromDbRow(row)['시리즈']).toBe('weekly')
  // 시리즈 컬럼이 없는(0005 미적용) 행도 슬러그로 복원된다
  expect(fromDbRow({ 슬러그: 'x-weekly-trend-y', 제목: 't' })['시리즈']).toBe('weekly')
  // 소속 없는 글 = null / undefined
  expect(toDbRow({ slug: '2026-08-05-a-eu-ai-act', data, body: '' })['시리즈']).toBe(null)
  expect(fromDbRow({ 슬러그: '2026-08-05-a-eu-ai-act' })['시리즈']).toBe(undefined)
})
