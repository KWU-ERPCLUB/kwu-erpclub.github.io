import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Articles, { excerpt, filterArticles, groupByMonth, neighbors } from './Articles.jsx'

test('목록 렌더 — 예시 기고 제목 + 성격 4종·영역 7종 칩 + 지금 써먹기 토글 + 검색박스', () => {
  const html = renderToString(<Articles />)
  expect(html).toContain('2026 AI 트렌드')
  for (const chip of ['뉴스·동향', '심층 분석', '활용법·튜토리얼', '도구·프롬프트']) {
    expect(html).toContain(chip) // 성격 축
  }
  for (const chip of ['마케팅·영업', '기획·전략', '고객지원·운영', '문서·지식관리', '데이터·분석', '개발·IT', 'AI 거버넌스·리스크']) {
    expect(html).toContain(chip) // 영역 축
  }
  expect(html).toContain('지금 써먹기') // 토글 칩
  expect(html).toContain('placeholder="제목·요약 검색"') // 검색박스
})

test('목록 = 월별 그룹 헤더 + 조밀 행(요약 발췌 제거)', () => {
  const html = renderToString(<Articles />)
  expect(html).toContain('2026. 07') // 월 헤더 "YYYY. MM"
  expect(html).toContain('art-month-head')
  expect(html).toContain('art-row-title')
  // 행에서 요약(본문 발췌) 제거 — 본문 첫 구절이 목록에 노출되지 않음
  expect(html).not.toContain('다중 출처 리서치')
})

test('groupByMonth — 같은 달 묶고 순서 유지 · "YYYY. MM" 라벨', () => {
  const g = groupByMonth([
    { slug: 'a', date: '2026-07-22' },
    { slug: 'b', date: '2026-07-01' },
    { slug: 'c', date: '2026-06-30' },
  ])
  expect(g.map((x) => x.month)).toEqual(['2026. 07', '2026. 06'])
  expect(g[0].items.map((x) => x.slug)).toEqual(['a', 'b'])
  expect(g[1].items.map((x) => x.slug)).toEqual(['c'])
})

test('neighbors — 역시간순 배열에서 prev=과거·next=최근, 경계는 null', () => {
  const all = [{ slug: 'new' }, { slug: 'mid' }, { slug: 'old' }]
  expect(neighbors(all, 'mid')).toEqual({ prev: { slug: 'old' }, next: { slug: 'new' } })
  expect(neighbors(all, 'new').next).toBe(null)
  expect(neighbors(all, 'old').prev).toBe(null)
})

test('상세 = 통일 셸(문서 헤더·출처 카드 승격·목록 복귀)', () => {
  const prevWin = globalThis.window
  globalThis.window = { location: { search: '?p=2026-07-22-bapzzi-ai-trend-research', pathname: '/insights/' } }
  try {
    const html = renderToString(<Articles />)
    expect(html).toContain('AI INSIGHTS')           // 문서 헤더 눈썹
    expect(html).toContain('art-source')            // 출처 카드 블록
    expect(html).toContain('Stanford HAI · Gartner')// source_name 시각 승격
    expect(html).toContain('← 목록')                 // 하단 목록 복귀
  } finally {
    if (prevWin === undefined) delete globalThis.window
    else globalThis.window = prevWin
  }
})

test('3필터 — 성격·영역·지금써먹기 AND 결합', () => {
  const all = [
    { slug: 'a', 성격: '심층 분석', 영역: '기획·전략', 지금써먹기: true },
    { slug: 'b', 성격: '뉴스·동향', 영역: '데이터·분석' },
    { slug: 'c', 성격: '심층 분석', 영역: '데이터·분석', 지금써먹기: true },
  ]
  expect(filterArticles(all, {}).map((x) => x.slug)).toEqual(['a', 'b', 'c'])
  expect(filterArticles(all, { nature: '심층 분석' }).map((x) => x.slug)).toEqual(['a', 'c'])
  expect(filterArticles(all, { area: '데이터·분석' }).map((x) => x.slug)).toEqual(['b', 'c'])
  expect(filterArticles(all, { nowUse: true }).map((x) => x.slug)).toEqual(['a', 'c'])
  expect(filterArticles(all, { nature: '심층 분석', area: '데이터·분석', nowUse: true }).map((x) => x.slug)).toEqual(['c'])
})

test('검색 — 제목·요약 부분일치 + 필터 AND', () => {
  const all = [
    { slug: 'a', title: '에이전트 실전', body: '업무 자동화 사례', 성격: '활용법·튜토리얼' },
    { slug: 'b', title: '리서치 요약', body: '시장 동향 정리', 성격: '뉴스·동향' },
  ]
  expect(filterArticles(all, { q: '에이전트' }).map((x) => x.slug)).toEqual(['a'])
  expect(filterArticles(all, { q: '동향' }).map((x) => x.slug)).toEqual(['b']) // 본문 매치
  expect(filterArticles(all, { q: '없는말' })).toEqual([])
  expect(filterArticles(all, { nature: '활용법·튜토리얼', q: '리서치' })).toEqual([]) // 축·검색 AND
})

test('요약 발췌 — 마크다운 기호 제거 + 길이 제한', () => {
  const out = excerpt('**굵게** 그리고 [링크](http://x) 텍스트', 100)
  expect(out).not.toContain('**')
  expect(out).not.toContain('](')
  expect(out).toContain('링크')
  expect(excerpt('가'.repeat(200), 96).endsWith('…')).toBe(true)
})
