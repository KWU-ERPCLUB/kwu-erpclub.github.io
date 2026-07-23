import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Articles from './Articles.jsx'

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

test('썸네일 fallback — 이미지 없는 예시 기고 = 성격 모노그램 타일(심/analysis)', () => {
  const html = renderToString(<Articles />)
  expect(html).toContain('art-mono--analysis') // 심층 분석 저채도 타일
  expect(html).toContain('>심<') // 모노그램 글자
})

// 성격 탭 딥링크(?tab=analysis) = 그 성격만 월별 그룹 목록 + 필터·검색 유지.
test('성격 탭 뷰 — 월별 그룹 + 영역 필터 7종 + 지금 써먹기 토글 + 검색박스(기존 서식 유지)', () => {
  const prev = globalThis.window
  globalThis.window = { location: { search: '?tab=analysis', pathname: '/insights/' } }
  try {
    const html = renderToString(<Articles />)
    expect(html).toContain('2026. 07')       // 월 헤더 유지
    expect(html).toContain('art-month-head')
    expect(html).toContain('art-row-title')
    expect(html).toContain('2026 AI 트렌드')  // 심층 분석 기고
    expect(html).toContain('placeholder="제목·요약 검색"') // 검색박스 유지
    expect(html).toContain('지금 써먹기')      // 토글 유지
    for (const v of ['마케팅·영업', '기획·전략', '고객지원·운영', '문서·지식관리', '데이터·분석', '개발·IT', 'AI 거버넌스·리스크']) {
      expect(html).toContain(v) // 영역 필터 유지
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
