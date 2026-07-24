import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Articles from './Articles.jsx'
import { ArticleRow } from './insights-parts.jsx'

// 창 없는 기본 진입 = 전체 탭 = 허브 뷰.
test('허브 뷰(전체 탭) — 좌측 성격 탭 5개 + 성격 4섹션 헤더·정의 + 예시 기고 + 기고 가이드', () => {
  const html = renderToString(<Articles />)
  // 좌측 탭(전체 + 성격 4)
  for (const t of ['전체', '뉴스·동향', '심층 분석', '활용법·튜토리얼', '도구·프롬프트']) {
    expect(html).toContain(t)
  }
  expect(html).toContain('art-tabs')
  // 섹션 정의(허브 헤더 서브 = CONTRIBUTING 정의)
  expect(html).toContain('새 소식·출시·시장 변화의 사실 전달')
  expect(html).toContain('한 주제를 파고든 해석·시사점')
  // 예시 기고(심층 분석 섹션에 노출)
  expect(html).toContain('2026 AI 트렌드')
  // 기고 가이드 링크(허브 하단)
  expect(html).toContain('CONTRIBUTING.md')
  // 허브 = 월별 그룹 아님(성격 탭에서만)
  expect(html).not.toContain('art-month-head')
})

// 색 면 카드(AI in Use 이식) — 배경=성격 색 클래스, fallback 아이콘 타일 폐지(합성 데이터 = 콘텐츠 무관).
test('색 면 카드 — 성격별 배경 클래스 + 주제·성격·지금써먹기·자세히, fallback 타일 제거', () => {
  const a = {
    slug: 'x', title: '합성 제목', author: '홍길동', date: '2026-07-01',
    body: '요약용 본문 텍스트', 성격: '심층 분석', 주제: '에이전트', 지금써먹기: true,
  }
  const html = renderToString(<ArticleRow a={a} onOpen={() => {}} />)
  expect(html).toContain('art-card--analysis') // 성격 색 면 배경
  expect(html).toContain('art-card-topic')      // 주제 흰 필
  expect(html).toContain('art-tag-nature')      // 성격 진한 필
  expect(html).toContain('art-tag-now')         // 지금 써먹기 배지
  expect(html).toContain('자세히')              // View details 링크
  expect(html).not.toContain('art-tile')        // fallback 아이콘 타일 폐지
  expect(html).not.toContain('art-thumb')       // 이미지 없음 → 썸네일 미표시
})

// 4성격 색 클래스 매핑 무결 + 이미지 있을 때만 썸네일.
test('색 면 카드 — 4성격 색 클래스 매핑 + 이미지 시 썸네일 표시', () => {
  const cases = [['뉴스·동향', 'news'], ['심층 분석', 'analysis'], ['활용법·튜토리얼', 'howto'], ['도구·프롬프트', 'tools']]
  for (const [nature, key] of cases) {
    const html = renderToString(<ArticleRow a={{ slug: key, title: 't', author: 'A', date: '2026-07-01', body: 'b', 성격: nature }} onOpen={() => {}} />)
    expect(html).toContain(`art-card--${key}`)
  }
  const withImg = renderToString(
    <ArticleRow a={{ slug: 'y', title: 't', author: 'A', date: '2026-07-02', body: 'b', 성격: '도구·프롬프트', 이미지: '/img/logos/openai.svg' }} onOpen={() => {}} />,
  )
  expect(withImg).toContain('art-thumb')
  expect(withImg).toContain('/img/logos/openai.svg')
})

// 성격 탭 딥링크(?tab=analysis) = 그 성격만 월별 그룹 목록 + 필터·검색 유지.
test('성격 탭 뷰 — 월별 그룹 + 주제 필터 5종 + 지금 써먹기 토글 + 검색박스(카드 서식)', () => {
  const prev = globalThis.window
  globalThis.window = { location: { search: '?tab=analysis', pathname: '/insights/' } }
  try {
    const html = renderToString(<Articles />)
    expect(html).toContain('2026. 07')       // 월 헤더 유지
    expect(html).toContain('art-month-head')
    expect(html).toContain('art-card-title')
    expect(html).toContain('2026 AI 트렌드')  // 심층 분석 기고
    expect(html).toContain('placeholder="제목·요약 검색"') // 검색박스 유지
    expect(html).toContain('지금 써먹기')      // 토글 유지
    for (const v of ['에이전트', '모델·플랫폼', '워크플로·자동화', '거버넌스·리스크', '시장·생태계']) {
      expect(html).toContain(v) // 주제 필터 유지
    }
  } finally {
    if (prev === undefined) delete globalThis.window
    else globalThis.window = prev
  }
})

// 상세 진입(?p=<slug>) = 통일 셸. URL 반영(뒤로가기용)은 stateFromSearch 경유.
test('상세 = 통일 셸(문서 헤더·출처 카드 승격·목록 복귀)', () => {
  const prev = globalThis.window
  globalThis.window = { location: { search: '?p=2026-07-22-bapzzi-ai-trend-research', pathname: '/insights/' } }
  try {
    const html = renderToString(<Articles />)
    expect(html).toContain('AI INSIGHTS')
    expect(html).toContain('art-source')
    expect(html).toContain('Stanford HAI · Gartner')
    expect(html).toContain('← 목록')
  } finally {
    if (prev === undefined) delete globalThis.window
    else globalThis.window = prev
  }
})
