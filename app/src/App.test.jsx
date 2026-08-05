import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import App, { PROJECTS } from './App.jsx'
import { COHORT_LABEL, formatWindowShort } from './data/recruit.js'
import { loadContent } from './content/loader.js'

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
  // 히어로 보강(2026-08-05 저녁): 확장 라인(AI × MIS) + 조준점 시그니처
  expect(html).toContain('hero-expand')
  expect(html).toContain('aria-label="AI × MIS"')
  expect(html).toContain('hero-reticle')
  expect(html).toContain('hero-desc')
  // 히어로 하단: 풀폭 마퀴 띠 + 스크롤 유도
  expect(html).toContain('marquee-track')
  expect(html).toContain('marquee-item')
  expect(html).toContain('scroll-cue')
})

test('섹션 인덱스 3종 + 각 섹션 구조 마크업', () => {
  const html = renderToString(<App />)
  for (const idx of ['01 — ROADMAP', '02 — PROJECTS', '03 — FAQ']) {
    expect(html).toContain(idx)
  }
  // ROADMAP: 계보 트리(본류 → 분기 하위 목록) + "앞으로 채워갈 공간" 점선 슬롯. DEEP DIVE(미개설) 부재
  expect(html).toContain('class="rmap')
  expect(html).toContain('rm-sub')
  expect(html).toContain('rm-slot')
  expect(html).not.toContain('SAP Track')
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

test('WHY 섹션 부재(2026-07-25 폐지) — 수치 스트립·섹션 앵커 없음', () => {
  const html = renderToString(<App />)
  expect(html).not.toContain('id="why"')
  expect(html).not.toContain('stat-rows')
  expect(html).not.toContain('stat-num')
  expect(html).not.toContain('data-note')
})

test('모집 밴드(IA 3차) = 히어로 직하 공고 + /recruit/ 링크 + 상태 배지 · 섹션 스파이 제외(.page 미부여)', () => {
  const html = renderToString(<App />)
  expect(html).toContain('recruit-band')
  expect(html).toContain('href="/recruit/"')
  expect(html).toContain(COHORT_LABEL) // 기수 표기 = 모집 데이터에서 파생
  expect(/class="recruit-band[^"]*page/.test(html)).toBe(false)
  // FAQ 모집 답 = 확정 기간 반영(비정기 문구 폐지) — 기간도 데이터 파생
  expect(html).toContain(formatWindowShort())
  expect(html).not.toContain('모집은 비정기')
})

test('RECENT 섹션 부재 + 삭제 페이지 링크(/join /reports /labs) 부재', () => {
  const html = renderToString(<App />)
  expect(html).not.toContain('id="recent"')
  expect(html).not.toContain('RECENT')
  expect(html).not.toContain('recent-item')
  expect(html).not.toContain('/join/')
  expect(html).not.toContain('/reports/')
  expect(html).not.toContain('/labs/')
})
