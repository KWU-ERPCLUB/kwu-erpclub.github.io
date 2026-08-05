import { expect, test } from 'vitest'
import { toDbRow, fromDbRow, sortByDateDesc } from './db-map.js'
import { readEntries } from '../../scripts/content-files.mjs'

const ENTRY = {
  slug: '2026-08-05-bapzzi-sample',
  data: {
    title: '합성 제목', author: 'bapzzi', date: '2026-08-05', 시각: '09:10',
    source_url: 'https://example.com', source_name: '예시',
    성격: '트렌드', 주제: '에이전트', 설명: '한 줄 설명', 태그: ['가', '나'], 고정: true,
  },
  body: '## 본문\n텍스트',
}

test('toDbRow — frontmatter가 articles 컬럼으로, 상태는 게재 고정', () => {
  const row = toDbRow(ENTRY)
  expect(row['슬러그']).toBe(ENTRY.slug)
  expect(row['상태']).toBe('게재')
  expect(row['작성자표기']).toBe('bapzzi')
  expect(row['본문']).toBe('## 본문\n텍스트')   // md 원문 보존
  expect(row['태그']).toEqual(['가', '나'])
  expect(row['고정']).toBe(true)
  expect(row['지금써먹기']).toBe(false)          // 미기재 = false
  expect(row['이미지']).toBeNull()
  expect(row['이미지설명']).toBeNull()           // 미기재 = null
  expect(row).not.toHaveProperty('작성자')       // uuid 컬럼은 동기화가 건드리지 않음
})

test('toDbRow·fromDbRow — 이미지설명(캡션)이 왕복에서 보존됨(0004 컬럼)', () => {
  const 캡션 = '알리바바 클라우드 로고 — 이번에 오픈웨이트로 공개된 모델의 개발사'
  const row = toDbRow({ ...ENTRY, data: { ...ENTRY.data, 이미지: '/img/logos/alibabacloud.svg', 이미지설명: 캡션 } })
  expect(row['이미지']).toBe('/img/logos/alibabacloud.svg')
  expect(row['이미지설명']).toBe(캡션)
  expect(fromDbRow(row)['이미지설명']).toBe(캡션)
})

test('fromDbRow — DB 행이 md 로더와 같은 모양으로 돌아옴(카드·상세 컴포넌트 재사용 조건)', () => {
  const ui = fromDbRow(toDbRow(ENTRY))
  expect(ui.slug).toBe(ENTRY.slug)
  expect(ui.title).toBe('합성 제목')
  expect(ui.author).toBe('bapzzi')
  expect(ui.date).toBe('2026-08-05')
  expect(ui['성격']).toBe('트렌드')
  expect(ui['시각']).toBe('09:10')
  expect(ui.body).toBe('## 본문\n텍스트')
  expect(ui.source_name).toBe('예시')
})

test('실제 기사 md도 왕복 매핑에서 키가 보존됨(콘텐츠 비결합 — 첫 파일 아무거나)', () => {
  const [first] = readEntries('기사')
  if (!first) return
  const ui = fromDbRow(toDbRow(first))
  expect(ui.title).toBe(first.data.title)
  expect(ui.slug).toBe(first.slug)
  expect(ui.body).toBe(first.body)
})

test('sortByDateDesc — 최신 먼저, 같은 날짜는 늦은 시각 먼저', () => {
  const list = [
    { slug: 'a', date: '2026-08-01' },
    { slug: 'b', date: '2026-08-05', 시각: '03:00' },
    { slug: 'c', date: '2026-08-05', 시각: '15:00' },
  ]
  expect(sortByDateDesc(list).map((x) => x.slug)).toEqual(['c', 'b', 'a'])
})
