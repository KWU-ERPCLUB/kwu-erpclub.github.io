import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Articles, { ListView } from './Articles.jsx'
import { ArticleHero } from './ArticleDetail.jsx'
import { ArticleRow, FeatureCard } from './insights-parts.jsx'
import { loadContent } from '../content/loader.js'
import { toDbRow, fromDbRow } from '../content/db-map.js'
import { createMockRepositories } from '../data/mock.js'
import { PAGE_SIZE, FEATURE_COUNT } from './insights-logic.js'

// M2 — 서빙 원천이 DB로 바뀌었다. 두 경로 모두 네트워크 없이 검증한다(P4):
//   configured={false} = md 글롭 폴백(아래 기존 단언 전부 — 로컬 dev·포크·백엔드 미설정 상태)
//   configured + repos = DB 경로(목 저장소 주입 — 파일 하단 3건)

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
const noop = () => {}
const listProps = { tab: '전체', onTab: noop, topic: null, setTopic: noop, month: null, setMonth: noop, q: '', setQ: noop, onOpen: noop }
// 합성 기사(콘텐츠 비의존) — 필요한 필드만 채운다.
const art = (slug, over = {}) => ({ slug, title: `제목 ${slug}`, author: 'A', date: '2026-07-01', 설명: `설명 ${slug}`, body: '', 성격: '트렌드', 주제: '시장·생태계', ...over })

// 목록 리디자인(2026-08-05 오너 픽 A): 피처 행 + 성격 탭(5) + 검색·주제·기간 필터 + 썸네일 카드 그리드 + 더보기.
test('목록 = 성격 탭(전체+4) + 검색 + 주제 칩 + 카운트 라인 + 썸네일 카드 그리드', () => {
  const html = renderToString(<Articles configured={false} />)
  // 성격 탭 5개 상한(전체+4)
  for (const t of ['전체', '트렌드', '심층 분석', '활용법·튜토리얼', '도구·프롬프트']) {
    expect(html).toContain(t)
  }
  expect(html).toContain('ins-tabs')
  expect(html).toContain('role="tablist"')
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
  // 썸네일 카드 그리드 + 통일 썸네일 프레임
  expect(html).toContain('art-grid')
  expect(html).toContain('art-card-title')
  expect(html).toContain('art-cover')
  if (ALL.length > 0) expect(flat(<Articles configured={false} />)).toContain(esc(ALL[0].title)) // 실제 기고 1건(동적 선택)
  // 폐지된 구조 마크업 부재
  expect(html).not.toContain('art-tabs')       // 좌측 탭 폐지(구조 개혁 2026-07-24)
  expect(html).not.toContain('art-month-head') // 월별 그룹 폐지
  expect(html).not.toContain('hub-sec')        // 허브 4섹션 폐지
  expect(html).not.toContain('art-card--news') // 색면 카드 폐지(2026-08-05) — 성격은 라벨로만
})

// 월 필터 — 기사 있으면 상시 노출, 0건이면 숨김(픽스처 주입 — 콘텐츠 비의존).
test('월 필터 — 기사 있으면 기간 select 노출(쌓인 월 전부 옵션)·0건이면 숨김', () => {
  const none = renderToString(<ListView all={[]} {...listProps} />)
  expect(none).not.toContain('art-month')
  const two = renderToString(<ListView all={[art('a', { date: '2026-07-25' }), art('b', { date: '2026-08-03' })]} {...listProps} />)
  expect(two).toContain('art-month')
  expect(two).toContain('2026.08')
  expect(two).toContain('2026.07')
})

// 카드 요소 감축(오너 픽 C): 썸네일 + 성격 컬러 라벨 + 제목 + 설명 + 날짜. 해시태그·아바타 = 카드에서 제거.
test('그리드 카드 = 썸네일·성격 라벨·제목·설명·날짜 (해시태그·아바타 없음)', () => {
  const a = art('x', {
    title: '합성 제목', author: '홍길동', date: '2026-07-01', 시각: '14:30',
    성격: '심층 분석', 주제: '에이전트', 설명: '한 문장 설명.', 태그: ['클로드', '에이전트'], 지금써먹기: true,
  })
  const html = renderToString(<ArticleRow a={a} onOpen={noop} />)
  expect(html).toContain('art-cover')          // 썸네일 프레임(4계층 해석 결과)
  expect(html).toContain('art-label')          // 성격 컬러 라벨
  expect(html).toContain('chip-analysis')      // 성격 → 색 토큰 매핑
  expect(html).toContain('합성 제목')
  expect(html).toContain('한 문장 설명.')
  expect(html).toContain('2026-07-01 14:30')   // 날짜 + 게재 시각
  // 감축된 요소 부재
  expect(html).not.toContain('art-avatar')
  expect(html).not.toContain('art-card-hashtags')
  expect(html).not.toContain('#클로드')
  expect(html).not.toContain('art-card--analysis') // 색면 배경 폐지
  expect(html).not.toContain('자세히')             // "자세히 →" 폐지(카드 전체가 버튼)
})

// 시각 미기재 = 날짜만 표기(하위호환).
test('시각 없는 글 = 날짜만 표기', () => {
  const html = renderToString(<ArticleRow a={art('z', { date: '2026-07-03' })} onOpen={noop} />)
  expect(html).toContain('2026-07-03')
  expect(html).not.toContain('2026-07-03 ')
})

// 설명 = frontmatter(본문 발췌 폐지) — 2026-07-27 오너 지시 승계.
test('카드 = 설명 표시(본문 발췌 아님)', () => {
  const a = art('d', { body: '본문에만 있는 문장', 설명: '매주 발행하는 주간 AI 트렌드.' })
  const html = renderToString(<ArticleRow a={a} onOpen={noop} />)
  expect(html).toContain('매주 발행하는 주간 AI 트렌드.')
  expect(html).not.toContain('본문에만 있는 문장')
})

// 고정 핀 — 고정(true) 카드는 핀 배지 노출(pinned prop).
test('고정 카드 = 핀 배지(art-pin) 노출', () => {
  const html = renderToString(<ArticleRow a={art('p')} onOpen={noop} pinned />)
  expect(html).toContain('art-pin')
})

// 4성격 → 라벨 색 토큰 매핑 무결(색면 아님).
test('성격 4종 → 라벨 색 토큰(chip-*) 매핑', () => {
  const cases = [['트렌드', 'news'], ['심층 분석', 'analysis'], ['활용법·튜토리얼', 'howto'], ['도구·프롬프트', 'tools']]
  for (const [nature, key] of cases) {
    const html = renderToString(<ArticleRow a={art(key, { 성격: nature })} onOpen={noop} />)
    expect(html).toContain(`art-label chip-${key}`)
  }
})

// 피처 행(오너 픽 A) — 기본 뷰에서 상단 2건이 큰 썸네일 카드. 필터가 걸리면 사라진다.
test('피처 행 = 기본 뷰 상단 2건 · 필터 뷰에서는 미표시', () => {
  const all = Array.from({ length: 6 }, (_, i) => art(`a${i}`))
  const base = renderToString(<ListView all={all} {...listProps} />)
  expect(base).toContain('art-features')
  expect(base).toContain('art-cover--big')
  const filtered = renderToString(<ListView all={all} {...listProps} tab="트렌드" />)
  expect(filtered).not.toContain('art-features')
  // 기사 총량이 피처 수 이하이면 위계 없이 그리드만
  const few = renderToString(<ListView all={all.slice(0, FEATURE_COUNT)} {...listProps} />)
  expect(few).not.toContain('art-features')
})

// v3.1(§6-2a NEXTERS 실측 문법) — B2 좌 라벨 컬럼 골격 + B1 블랙 통계 밴드(집계 수치·출처 각주).
test('v3.1 골격 — 좌 라벨(INSIGHTS·FEATURED·LATEST + ■) + 블랙 통계 밴드(집계·출처)', () => {
  const all = Array.from({ length: 6 }, (_, i) => art(`v${i}`))
  const page = renderToString(<Articles configured={false} />)
  expect(page).toContain('ins-sec-label')          // B2 좌 라벨 컬럼
  expect(page).toContain('ins-sq')                 // 버건디 ■ 마이크로 불릿
  expect(page).toContain('INSIGHTS')               // 헤드 좌 라벨
  const html = renderToString(<ListView all={all} {...listProps} />)
  expect(html).toContain('FEATURED')               // 피처 구간 라벨
  expect(html).toContain('LATEST')                 // 그리드 구간 라벨
  expect(html).toContain('ins-band')               // B1 블랙 통계 밴드
  expect(html).toContain('ins-band-num">6<')       // 숫자 = 게재 데이터 집계(합성 6건)
  expect(html).toContain('출처')                   // 수치 출처 각주(§6 스탯 문법)
  // 밴드 = 데이터 확정 후에만(로딩·0건 = 미표시)
  expect(renderToString(<ListView all={[]} {...listProps} status="loading" />)).not.toContain('ins-band')
  expect(renderToString(<ListView all={[]} {...listProps} />)).not.toContain('ins-band')
})

// 더보기(무한스크롤 금지) — PAGE_SIZE 초과분은 접히고 남은 건수를 버튼에 표기.
test('더보기 = PAGE_SIZE 초과 시 노출 + 남은 건수 표기', () => {
  const many = Array.from({ length: PAGE_SIZE + FEATURE_COUNT + 4 }, (_, i) => art(`m${i}`))
  const html = flat(<ListView all={many} {...listProps} />)
  expect(html).toContain('art-more')
  expect(html).toContain('더 보기')
  expect(html).toContain('4건 남음')
  const few = renderToString(<ListView all={many.slice(0, 4)} {...listProps} />)
  expect(few).not.toContain('art-more')
})

// 성격 탭 딥링크(?tab=analysis) = 해당 성격만 그리드 + 필터 바 유지(URL 상태 복원 — 계약 불변).
test('성격 탭 딥링크 — ?tab=analysis 복원 + 해당 성격 카드만', () => {
  const inTab = pick((a) => a['성격'] === '심층 분석')
  const outTab = pick((a) => a['성격'] && a['성격'] !== '심층 분석')
  const prev = globalThis.window
  globalThis.window = { location: { search: '?tab=analysis', pathname: '/insights/' } }
  try {
    const html = flat(<Articles configured={false} />)
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

// ── M2: DB 서빙 경로(목 저장소 — 네트워크 0, P4) ──

// 페치 대기 = 카드 그리드 자리에 골격(레이아웃 점프 없음). 필터 바는 그대로 노출.
test('DB 경로 — 페치 전 = 로딩 골격(role=status) + 필터 바 유지', () => {
  const repos = createMockRepositories()
  const html = renderToString(<Articles configured repos={repos} />)
  expect(html).toContain('art-card--skeleton')
  expect(html).toContain('role="status"')
  expect(html).toContain('ins-controls')          // 필터 바 = 로딩 중에도 동일
  expect(html).toContain('ins-tabs')
  expect(html).not.toContain('ins-count')         // 숫자는 확정 후에만
  expect(html).not.toContain('art-features')      // 피처 행도 확정 후에만
})

// 오류 = 짧은 안내 + 재시도 버튼(빈 상태와 같은 블록 문법).
test('DB 경로 — 오류 상태 = 안내 + 다시 시도 버튼', () => {
  const html = renderToString(<ListView all={[]} {...listProps} status="error" onRetry={noop} />)
  expect(html).toContain('role="alert"')
  expect(html).toContain('불러오지 못함')
  expect(html).toContain('art-retry')
  expect(html).toContain('다시 시도')
})

// DB 행 → 카드 마크업이 md 경로와 동일(디자인 불변 조건).
test('DB 행으로 그린 카드 = md 경로와 같은 마크업(썸네일·라벨·제목)', async () => {
  const rows = await createMockRepositories().articles.listPublished()
  const items = rows.map(fromDbRow)
  expect(items.length).toBeGreaterThan(0)
  const html = renderToString(<FeatureCard a={items[0]} onOpen={noop} />)
  expect(html).toContain('art-cover')
  expect(html).toContain('art-card-title')
  expect(html).toContain(esc(items[0].title))
})

// md 파일에서 만든 DB 행도 같은 화면 객체로 돌아온다(이전 무손실 — P6의 화면 측 대응).
test('md → DB 행 → 화면 객체 왕복에서 제목·슬러그 보존', () => {
  if (ALL.length === 0) return
  const src = ALL[0]
  const ui = fromDbRow(toDbRow({ slug: src.slug, data: src, body: src.body }))
  expect(ui.title).toBe(src.title)
  expect(ui.slug).toBe(src.slug)
})

// 상세 진입(?p=<slug>) = 통일 셸(변경 없음). URL 반영은 stateFromSearch 경유.
// 대상 기사 = 출처 있는 아무 기사(동적 선택) — 특정 슬러그에 묶지 않는다.
test('상세 = 통일 셸(문서 헤더·출처 카드 승격·목록 복귀)', () => {
  const cur = pick((a) => a.source_url)
  if (!cur) return
  const prev = globalThis.window
  globalThis.window = { location: { search: `?p=${cur.slug}`, pathname: '/insights/' } }
  try {
    const html = flat(<Articles configured={false} />)
    expect(html).toContain('AI INSIGHTS')
    expect(html).toContain('art-source')
    expect(html).toContain(esc(cur.source_name || cur.source_url))
    expect(html).toContain('← 목록')
  } finally {
    if (prev === undefined) delete globalThis.window
    else globalThis.window = prev
  }
})

// 히어로 이미지 + 캡션(오너 판정 2026-08-05) — 기고 맨 위에서 그 이미지가 무엇인지 밝힌다.
// 합성 기사로 검증(콘텐츠 비결합): 이미지·캡션 유무 조합의 렌더 규칙을 고정한다.
test('상세 히어로 — 이미지 있으면 캡션과 함께 렌더(로고 = contain)', () => {
  const a = art('hero', { 이미지: '/img/logos/openai.svg', 이미지설명: 'OpenAI 로고 — 가격을 내린 개발사' })
  const html = flat(<ArticleHero a={a} />)
  expect(html).toContain('art-hero')
  expect(html).toContain('/img/logos/openai.svg')
  expect(html).toContain('art-hero-cap')
  expect(html).toContain(esc('OpenAI 로고 — 가격을 내린 개발사'))
  expect(html).toContain('art-hero--fit-contain')
})

test('상세 히어로 — 이미지설명 없으면 캡션 줄만 생략(도판·사진 = cover)', () => {
  const html = flat(<ArticleHero a={art('h2', { 이미지: '/img/기사/chart.svg' })} />)
  expect(html).toContain('art-hero')
  expect(html).not.toContain('art-hero-cap')
  expect(html).toContain('art-hero--fit-cover')
})

test('상세 히어로 — 명시 이미지 없으면 통째로 생략(자동 커버·주제 스톡은 목록 전용)', () => {
  expect(flat(<ArticleHero a={art('h3', { 주제: '시장·생태계' })} />)).toBe('')
  expect(flat(<ArticleHero a={art('h4', { title: 'Claude 정리' })} />)).toBe('')
})

test('목록 카드 alt = 이미지설명(명시 이미지) / 자동 폴백은 빈 alt', () => {
  const withCap = flat(<ArticleRow a={art('c1', { 이미지: '/img/logos/openai.svg', 이미지설명: '오픈AI 로고 — 발표 주체' })} onOpen={noop} />)
  expect(withCap).toContain(`alt="${esc('오픈AI 로고 — 발표 주체')}"`)
  const auto = flat(<ArticleRow a={art('c2', { title: 'Claude 정리' })} onOpen={noop} />)
  expect(auto).toContain('alt=""')
})
