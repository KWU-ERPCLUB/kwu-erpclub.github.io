import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Articles, { ListView } from './Articles.jsx'
import { ArticleRow } from './insights-parts.jsx'
import { loadContent } from '../content/loader.js'

// 실 콘텐츠 비결합 원칙: 특정 기사(슬러그·제목·본문 문자열)에 단언을 묶지 않는다 —
// 기사 1건 삭제로 CI 전체가 죽는 사고 방지(2026-07-31 사고 1회). 실 콘텐츠가 필요한 단언은
// 로더에서 "존재하는 아무 기사나" 동적으로 골라 쓰고, 0건이면 해당 단언을 건너뛴다.
const ALL = loadContent('기사')
const pick = (fn) => ALL.find(fn) || null
// React SSR 이스케이프 + 텍스트 노드 사이 주석 제거 후 비교(문자열 포함 검사용).
const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

// 구조 개혁(2026-07-24 2차): 좌측 탭·허브 4섹션·월별 그룹 폐지 → AI in Use 구조(상단 컨트롤 바 + 2열 색면 카드 그리드).
test('목록 = 상단 컨트롤 바(성격 칩+주제 칩+토글+검색) + 카운트 라인 + 2열 카드 그리드', () => {
  const html = renderToString(<Articles />)
  // 상단 컨트롤 바 — 성격 칩(전체+4)
  for (const t of ['전체', '트렌드', '심층 분석', '활용법·튜토리얼', '도구·프롬프트']) {
    expect(html).toContain(t)
  }
  expect(html).toContain('ins-controls')
  // 주제 칩(전체 + 5종)
  for (const v of ['에이전트', '모델·플랫폼', '워크플로·자동화', '거버넌스·리스크', '시장·생태계']) {
    expect(html).toContain(v)
  }
  // 검색 인풋 + 지금써먹기 필터 폐지(2026-07-25 오너 지시)
  expect(html).toContain('placeholder="제목·요약 검색"')
  expect(html).not.toContain('지금 써먹기 필터')
  // N건 표시 중 / 전체 M건 카운트 라인
  expect(html).toContain('ins-count')
  expect(html).toContain('표시 중')
  expect(html).toContain('전체')
  // 2열 색면 카드 그리드
  expect(html).toContain('art-grid')
  expect(html).toContain('art-card-title')
  if (ALL.length > 0) expect(html.replace(/<!-- -->/g, '')).toContain(esc(ALL[0].title)) // 실제 기고 1건(동적 선택)
  // 폐지된 구조 마크업 부재
  expect(html).not.toContain('art-tabs')      // 좌측 탭 폐지
  expect(html).not.toContain('art-month-head') // 월별 그룹 폐지
  expect(html).not.toContain('hub-sec')        // 허브 4섹션 폐지
})

// 월 필터 — 기사 있으면 상시 노출, 0건이면 숨김(픽스처 주입 — 콘텐츠 비의존).
test('월 필터 — 기사 있으면 기간 select 노출(쌓인 월 전부 옵션)·0건이면 숨김', () => {
  const art = (slug, date) => ({ slug, title: slug, author: 'A', date, 성격: '트렌드', 설명: 'd', body: '' })
  const noop = () => {}
  const props = { tab: '전체', onTab: noop, topic: null, setTopic: noop, month: null, setMonth: noop, q: '', setQ: noop, onOpen: noop }
  const none = renderToString(<ListView all={[]} {...props} />)
  expect(none).not.toContain('art-month')
  const two = renderToString(<ListView all={[art('a', '2026-07-25'), art('b', '2026-08-03')]} {...props} />)
  expect(two).toContain('art-month')
  expect(two).toContain('2026.08')
  expect(two).toContain('2026.07')
})

// 색 면 카드(AI in Use 이식) — 배경=성격 색 클래스, 제목 아래 태그 줄(성격·주제·지금써먹기), 날짜+시각(2026-07-25 개정).
test('색 면 카드 — 성격별 배경 + 태그 줄(성격·주제·지금써먹기) + 날짜·시각 + 자세히', () => {
  const a = {
    slug: 'x', title: '합성 제목', author: '홍길동', date: '2026-07-01', 시각: '14:30',
    body: '요약용 본문 텍스트', 성격: '심층 분석', 주제: '에이전트', 지금써먹기: true,
  }
  const html = renderToString(<ArticleRow a={a} onOpen={() => {}} />)
  expect(html).toContain('art-card--analysis') // 성격 색 면 배경
  expect(html).toContain('art-card-tagline')    // 제목 아래 태그 줄
  expect(html).toContain('art-tag-fill')        // 성격 진한 필
  expect(html).toContain('에이전트')            // 주제 칩
  expect(html).toContain('art-tag-now')         // 지금 써먹기 배지
  expect(html).toContain('2026-07-01 14:30')    // 날짜 + 게재 시각
  expect(html).toContain('자세히')              // View details 링크
  expect(html).not.toContain('art-thumb')       // 이미지 없음 → 썸네일 미표시
})

// 시각 미기재 = 날짜만 표기(하위호환).
test('시각 없는 글 = 날짜만 표기', () => {
  const a = { slug: 'z', title: 't', author: 'A', date: '2026-07-03', body: 'b', 성격: '트렌드' }
  const html = renderToString(<ArticleRow a={a} onOpen={() => {}} />)
  expect(html).toContain('2026-07-03')
  expect(html).not.toContain('2026-07-03 ')
})

// 설명·해시태그 — 카드 = frontmatter 설명(본문 발췌 폐지) + #태그 표시 전용(2026-07-27 오너 지시).
test('카드 = 설명 표시(본문 발췌 아님) + #해시태그 줄', () => {
  const a = {
    slug: 'd', title: 't', author: 'A', date: '2026-07-27', 성격: '트렌드',
    body: '본문에만 있는 문장', 설명: '매주 발행하는 주간 AI 트렌드.', 태그: ['클로드', '에이전트'],
  }
  const html = renderToString(<ArticleRow a={a} onOpen={() => {}} />)
  expect(html).toContain('매주 발행하는 주간 AI 트렌드.')
  expect(html).not.toContain('본문에만 있는 문장')   // 본문 발췌 폐지
  expect(html).toContain('art-card-hashtags')
  expect(html).toContain('#클로드 #에이전트')
})

// 고정 핀 — 고정(true) 카드는 핀 배지 노출(pinned prop).
test('고정 카드 = 핀 배지(art-pin) 노출', () => {
  const a = { slug: 'p', title: '고정 글', author: 'A', date: '2026-07-01', body: 'b', 성격: '트렌드' }
  const html = renderToString(<ArticleRow a={a} onOpen={() => {}} pinned />)
  expect(html).toContain('art-pin')
})

// 4성격 색 클래스 매핑 무결 + 이미지 있을 때만 썸네일.
test('색 면 카드 — 4성격 색 클래스 매핑 + 이미지 시 썸네일 표시', () => {
  const cases = [['트렌드', 'news'], ['심층 분석', 'analysis'], ['활용법·튜토리얼', 'howto'], ['도구·프롬프트', 'tools']]
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

// 성격 칩 딥링크(?tab=analysis) = 해당 성격만 그리드 + 컨트롤 바·검색 유지(URL 상태 복원).
// 대조 기사 = 로더에서 동적 선택(심층 분석 1건 포함 / 그 외 성격 1건 제외).
test('성격 칩 딥링크 — ?tab=analysis 복원 + 해당 성격 카드만', () => {
  const inTab = pick((a) => a['성격'] === '심층 분석')
  const outTab = pick((a) => a['성격'] && a['성격'] !== '심층 분석')
  const prev = globalThis.window
  globalThis.window = { location: { search: '?tab=analysis', pathname: '/insights/' } }
  try {
    const html = flat(<Articles />)
    expect(html).toContain('art-grid')
    expect(html).toContain('art-card-title')
    if (inTab) expect(html).toContain(esc(inTab.title))       // 심층 분석 기고 = 표시
    if (outTab) expect(html).not.toContain(esc(outTab.title)) // 다른 성격 = 필터링됨
    expect(html).toContain('placeholder="제목·요약 검색"')   // 검색박스 유지
    expect(html).not.toContain('art-month-head')             // 월별 그룹 폐지
  } finally {
    if (prev === undefined) delete globalThis.window
    else globalThis.window = prev
  }
})

// 상세 진입(?p=<slug>) = 통일 셸(변경 없음). URL 반영은 stateFromSearch 경유.
// 대상 기사 = 출처 있는 아무 기사(동적 선택) — 특정 슬러그에 묶지 않는다.
test('상세 = 통일 셸(문서 헤더·출처 카드 승격·목록 복귀)', () => {
  const cur = pick((a) => a.source_url)
  if (!cur) return
  const prev = globalThis.window
  globalThis.window = { location: { search: `?p=${cur.slug}`, pathname: '/insights/' } }
  try {
    const html = flat(<Articles />)
    expect(html).toContain('AI INSIGHTS')
    expect(html).toContain('art-source')
    expect(html).toContain(esc(cur.source_name || cur.source_url))
    expect(html).toContain('← 목록')
  } finally {
    if (prev === undefined) delete globalThis.window
    else globalThis.window = prev
  }
})
