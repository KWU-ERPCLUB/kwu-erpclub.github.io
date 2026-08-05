import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import App, { PROJECTS, RecruitBand, StatsBand } from './App.jsx'
import { COHORT_LABEL, formatWindowShort } from './data/recruit.js'
import { FAQ } from './data/faq.js'
import { loadContent } from './content/loader.js'
import { heldSeminars } from './home-logic.js'
import { HomeInsights, HOME_INSIGHTS_COUNT } from './home-parts.jsx'

// 구조 검증(콘텐츠·시점 무관) — v5 풀블리드 스크린 섹션: 100vh 히어로·계보 트리·풀폭 커버·대형 FAQ. (WHY 폐지 2026-07-25)
test('메인 = 풀블리드 3섹션 + 100vh 히어로(뷰포트 타이포·소개 2줄·마퀴·스크롤 유도)', () => {
  const html = renderToString(<App />)
  // 격자 폐지: .lattice/.cell 컨테이너 부재 → .home 풀블리드
  expect(html).toContain('class="home"')
  expect(html).not.toContain('class="lattice"')
  // 히어로 100vh: 뷰포트 타이포(hero-mega) + 문자 스태거 리빌(sc) + 브랜드 키커
  expect(html).toContain('hs-hero')
  expect(html).toContain('hero-mega')
  expect(/class="sc"|class="sc /.test(html)).toBe(true)
  // 소개 2줄(브랜드 개편 2026-08-05): 주체 = AIM, 서브 = 산하 계보 한 줄
  expect(html).toContain('광운대학교 ERP연구회 산하 MIS·AI 스터디')
  // 히어로 보강(2026-08-05 저녁): 확장 라인(AI × MIS) — AIM 폭 양끝 정렬(.hero-brand 묶음)
  expect(html).toContain('hero-brand')
  expect(html).toContain('hero-expand')
  expect(html).toContain('aria-label="AI × MIS"')
  expect(html).not.toContain('hero-reticle')
  expect(html).toContain('hero-desc')
  // 히어로 하단: 풀폭 마퀴 띠 + 스크롤 유도
  expect(html).toContain('marquee-track')
  expect(html).toContain('marquee-item')
  expect(html).toContain('scroll-cue')
})

test('섹션 라벨 4종(B2 좌 라벨 컬럼) + 각 섹션 구조 마크업', () => {
  const html = renderToString(<App />)
  for (const idx of ['01 — ROADMAP', '02 — PROJECTS', '03 — FAQ', '04 — INSIGHTS']) {
    expect(html).toContain(idx)
  }
  // B2(v3.1): ROADMAP·PROJECTS·FAQ·INSIGHTS = 좌 라벨 컬럼(hs-cols/hs-side/hs-label) 골격 4회
  expect((html.match(/hs-cols/g) || []).length).toBe(4)
  expect((html.match(/hs-label/g) || []).length).toBe(4)
  // ROADMAP: B3 워드 스택 — 계보 5노드(본류 2 + 분기 + 프로젝트 + 슬롯) 전량 + 톤다운 슬롯. DEEP DIVE(미개설) 부재
  expect(html).toContain('class="wl ')
  expect((html.match(/wl-item/g) || []).length).toBe(5)
  expect(html).toContain('wl-slot')
  for (const w of ['ERP연구회', 'SAP 특강', 'MIS·AI 스터디', 'ADsP 스터디 1기', '앞으로 채워갈 공간']) {
    expect(html).toContain(w)
  }
  expect(html).not.toContain('SAP Track')
  expect(html).not.toContain('class="rmap') // 구 계보 트리 폐지(v3.1 B3)
  // PROJECTS: 풀폭 커버 카드 + 커버 위 대형 제목 + /projects/ 딥링크
  expect(html).toContain('hp-card')
  expect(html).toContain('hp-cover')
  expect(html).toContain('hp-title')
  expect(html).toContain('/projects/?p=')
  // FAQ: 대형 아코디언(네이티브 details/summary) + WHY 이관 1문(챗 단독의 한계)
  expect(html).toContain('faq-xl')
  expect(html).toContain('fx-item')
  expect(html).toContain('스터디가 왜 필요한가요')
})

// 메인 PROJECTS 딥링크는 content/프로젝트/<슬러그>.md에 의존 — 어긋나면 빈 상세로 조용히 깨진다.
// 슬러그 존재 여부를 콘텐츠 글롭과 대조해 "조용한 깨짐"을 CI 실패로 드러낸다(개별 슬러그에 단언하지 않음).
test('메인 PROJECTS 딥링크 슬러그 = 실제 프로젝트 md 존재', () => {
  const slugs = new Set(loadContent('프로젝트').map((p) => p.slug))
  for (const [, , href] of PROJECTS) {
    const slug = new URLSearchParams(href.split('?')[1] || '').get('p')
    expect(slug, `${href} — ?p= 슬러그 없음`).toBeTruthy()
    expect(slugs.has(slug), `content/프로젝트/${slug}.md 없음`).toBe(true)
  }
})

// WHY(논증형 수치 스트립)는 폐지 유지(2026-07-25) — v3.1 B1 블랙 밴드는 논증이 아니라 실측 기록 면.
test('WHY 섹션 부재 유지 + B1 블랙 통계 밴드 1개(2×2 실측 수치·출처 표기·content 집계 일치)', () => {
  const html = renderToString(<App />)
  expect(html).not.toContain('id="why"')
  expect(html).not.toContain('stat-rows') // 구 WHY/증빙 문법은 메인에 재도입 안 함(증빙 원본 = /recruit)
  expect(html).not.toContain('data-note')
  // 블랙 대면적 = 페이지당 1개(§6-2a 판정 기준)
  expect((html.match(/class="stats-band"/g) || []).length).toBe(1)
  const band = renderToString(<StatsBand today="2026-08-05" />)
  expect((band.match(/sb-cell/g) || []).length).toBe(4) // 2×2
  // 수치 = 실측만: 게재 건수 = content/ 글롭 집계와 일치(recruit 증빙과 동일 원천)
  expect(band).toContain(`>${loadContent('기사').length}</span>`)
  for (const label of ['게재 기사', '세미나 기록', '라이브 실물']) expect(band).toContain(label)
  expect((band.match(/sb-src/g) || []).length).toBe(4) // 수치엔 출처 각주 의무(디자인규칙 §6)
})

// 정직성(2026-08-05) — "세미나 기록"은 개최 완료 집계다. 예정(일정미정·미래 date)이 1로 집계되면 허위 기록.
test('RECORD 세미나 기록 = 개최 완료만 집계(예정·일정미정 제외)', () => {
  const all = loadContent('세미나')
  const today = '2026-08-05'
  const held = heldSeminars(all, today).length
  expect(held).toBeLessThan(all.length) // 현재 콘텐츠 = 일정미정 1건 존재
  const band = renderToString(<StatsBand today={today} />)
  expect(band).toContain(`>${held}</span>`)
  expect(band).toContain('개최 완료만')
})

// "진행 중 스터디 1"은 ADsP 시험(2026-08-08) 이후 허위 → 날짜 파생 라벨.
test('RECORD 스터디 셀 = 시험일 경계로 진행 중 → 완주 전환', () => {
  const before = renderToString(<StatsBand today="2026-08-08" />)
  expect(before).toContain('진행 중 스터디')
  expect(before).toContain('ADsP 1기 — 진도 보드 운영')
  expect(before).not.toContain('완주 스터디')

  const after = renderToString(<StatsBand today="2026-08-09" />)
  expect(after).toContain('완주 스터디')
  expect(after).not.toContain('진행 중 스터디')
})

test('모집 섹션(확대 2026-08-05) = 국면별 렌더 — 전·중=대형 공고, 종료=다음 기수 안내', () => {
  // 모집 전(창 시작 전) — 대형 섹션 + 기수·기간·CTA
  const before = renderToString(<RecruitBand today="2026-08-20" />)
  expect(before).toContain('recruit-band')
  expect(before).toContain('rb-title')
  expect(before).toContain(COHORT_LABEL) // 기수 표기 = 모집 데이터에서 파생
  expect(before).toContain(formatWindowShort())
  expect(before).toContain('href="/recruit/"')
  // Primary 승격(2026-08-05) — 모집 밴드 CTA = 대형 Primary(.rc-cta-xl), Tertiary(proof-link) 아님
  expect(before).toContain('rc-cta-xl')
  expect(before).not.toContain('proof-link rb-cta')
  expect(/class="recruit-band[^"]*page/.test(before)).toBe(false) // 섹션 스파이 제외
  // 모집 중 — 마감 안내
  const open = renderToString(<RecruitBand today="2026-09-01" />)
  expect(open).toContain('모집 중')
  // 모집 종료 — 밴드 자리를 비우지 않고 "다음 기수 안내"로 교체(SPEC §4)
  const after = renderToString(<RecruitBand today="2026-09-09" />)
  expect(after).toContain('recruit-band')
  expect(after).toContain('다음 기수 안내')
  expect(after).toContain('모집 마감')
  expect(after).toContain('href="/recruit/"')
  expect(after).not.toContain('모집 중')
})

// E4 공용화(2026-08-05) 회귀 가드 — 메인 FAQ = data/faq.js 전체 렌더(서브셋 아님·문항 유실 없음)
test('메인 FAQ = data/faq.js 원천 전량 렌더', () => {
  const html = renderToString(<App />)
  expect(FAQ.length).toBe(6)
  for (const { q } of FAQ) expect(html).toContain(q)
})

test('FAQ 모집 답 = 확정 기간 반영(비정기 문구 폐지) — 기간은 데이터 파생', () => {
  const html = renderToString(<App />)
  expect(html).toContain(formatWindowShort())
  expect(html).not.toContain('모집은 비정기')
})

// 메인 하단 최근 활동(북극성 §5) — 구 v5 'RECENT 현황판'은 폐지 유지, 대신 INSIGHTS 리스트 3건.
test('메인 하단 INSIGHTS = 최근 기사 3건(제목·성격·날짜·설명) + 전체 보기 링크', () => {
  const html = renderToString(<HomeInsights />)
  const recent = loadContent('기사').slice(0, HOME_INSIGHTS_COUNT)
  expect(recent.length).toBe(3)
  expect((html.match(/hi-item/g) || []).length).toBe(3)
  for (const a of recent) {
    expect(html).toContain(a.title)
    expect(html).toContain(a['성격'])
    expect(html).toContain(a.date)
    expect(html).toContain(`/insights/?p=${a.slug}`)
  }
  expect(html).toContain('전체 보기')
  expect(html).toContain('href="/insights/"')
})

test('구 RECENT 현황판 부재 유지 + 삭제 페이지 링크(/join /reports /labs) 부재', () => {
  const html = renderToString(<App />)
  expect(html).not.toContain('id="recent"')
  expect(html).not.toContain('RECENT')
  expect(html).not.toContain('recent-item')
  expect(html).not.toContain('/join/')
  expect(html).not.toContain('/reports/')
  expect(html).not.toContain('/labs/')
})

// 디자인규칙 §4 — Primary는 화면당 1개. 메인의 Primary = 모집 밴드 CTA 하나뿐이어야 한다.
test('메인 Primary = 1개(모집 밴드 CTA) — 나머지 행동 유도는 Secondary·Tertiary', () => {
  const html = renderToString(<App />)
  expect((html.match(/rc-cta-xl/g) || []).length).toBe(1)
  expect((html.match(/class="cta[ "]/g) || []).length).toBe(0) // 구 Primary(.cta) 병존 금지
})
