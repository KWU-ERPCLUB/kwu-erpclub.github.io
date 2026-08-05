import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Recruit, { RecruitProof } from './Recruit.jsx'
import { RECRUIT, COHORT_LABEL, formatWindow, shortDate } from './data/recruit.js'
import { FAQ, RECRUIT_FAQ } from './data/faq.js'
import { loadContent } from './content/loader.js'

// 구조·계약 검증 — IA 3차(2026-07-27): 모집 페이지 = 요강·활동 구성·참여 방법. 사실 서술만.
const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

test('page-head(§3-1) = 눈썹 RECRUIT + 헤드라인 + 서브 + 메타 줄', () => {
  const html = flat(<Recruit />)
  expect(html).toContain('rc-eyebrow">RECRUIT')
  expect(html).toContain('rc-h1')
  expect(html).toContain('rc-lead')
  expect(html).toContain('rc-meta')
})

test('요강 = 확정값만 게재(오너 개정 2026-08-05) — 기간·인원 미정·대상·모임·비용', () => {
  const html = flat(<Recruit />)
  expect(html).toContain(formatWindow()) // 모집 기간 = 데이터 파생(하드코딩 아님)
  expect(html).toContain(RECRUIT.활동기간)
  expect(html).toContain('미정 — 추후 확정')          // 인원(구 6~10명 — 오너 개정)
  expect(html).not.toContain('6~10명')
  expect(html).toContain('경영학부 중심 — 전공 무관')
  expect(html).toContain('매주 대면 60분')
  expect(html).toContain('요일 추후 확정')
  expect(html).toContain('참가비 없음')
})

test('활동 구성 = 2페이즈 스텝(전반 5회 목록·시험 휴지·후반 팀) + 콜아웃', () => {
  const html = flat(<Recruit />)
  expect(html).toContain('rc-steps')
  expect(html).toContain('킥오프')
  expect(html).toContain('중간 쇼케이스')
  expect(html).toContain('중간고사 기간 휴식')
  expect(html).toContain(`${shortDate(RECRUIT.일정.휴지.start)} ~ ${shortDate(RECRUIT.일정.휴지.end)}`) // 시험 휴지 = 데이터 파생
  expect(html).toContain('팀 프로젝트')
  expect(html).toContain('rc-callout')
})

test('마케팅 어투 금지(SPEC §4 개정 목록) + 신청 폼 섹션 + 문의 링크', () => {
  const html = flat(<Recruit />)
  for (const banned of ['지금 바로', '놓치지', '마지막 기회', '서두르', '얼른']) {
    expect(html).not.toContain(banned)
  }
  // 온사이트 신청 폼(오너 보류 해제 2026-08-05) — 상세 검증 = RecruitForm.test.jsx
  expect(html).toContain('rc-apply-h')
  expect(html).toContain('btn-2nd') // GitHub 문의 링크(Secondary)
  expect(html).toContain('href="/#faq"') // 메인 FAQ 연결
})

// 운영 증빙(IA 4차 2026-08-05 — about 폐지 이관): 실측 정량 3종 + 출처, 콘텐츠 건수 = content/ 집계 파생.
test('운영 증빙 = stat-rows 3행(스터디·실물·게재 건수) + 출처 표기 + content 집계 일치', () => {
  const html = flat(<RecruitProof />)
  expect(html).toContain('stat-rows')
  expect(html).toContain('진행 중 스터디')
  expect(html).toContain('라이브 실물')
  expect(html).toContain('게재된 기사·세미나')
  expect(html).toContain('stat-row-src') // 수치엔 출처 각주 의무(디자인규칙 §6)
  const total = loadContent('기사').length + loadContent('세미나').length
  expect(html).toContain(`>${total}<`) // 하드코딩 아님 — 콘텐츠 글롭에서 파생
  // 전체 페이지에도 섹션이 붙는다
  expect(flat(<Recruit />)).toContain('운영 증빙')
})

// ── 레퍼런스 픽 E1~E6(오너 확정 2026-08-05, 원천 = docs/2026-08-05-리쿠르트-레퍼런스-후보.md §2) ──

test('E1 모집 일정 타임라인 = 확정 3단계만(접수→개별 안내→활동 시작) — 선발 단계 날조 없음', () => {
  const html = flat(<Recruit />)
  expect(html).toContain('rc-timeline-h')
  expect(html).toContain('신청 폼 제출')
  expect(html).toContain('개별 안내')
  expect(html).toContain(`${COHORT_LABEL} 활동 개시`) // 기수·활동 시작 = 데이터 파생
  for (const invented of ['면접', '서류 심사', '합격']) {
    expect(html, `미정 선발 단계 날조: ${invented}`).not.toContain(invented)
  }
})

test('E2 이런 사람 = 사실 서술 카드 4장(경영학부·코딩 불필요·대면 60분·직접 실험)', () => {
  const html = flat(<Recruit />)
  expect(html).toContain('rc-fit')
  expect(html).toContain('이런 사람')
  for (const t of ['경영학부 중심', '코딩 경험 불필요', '매주 대면 60분', 'AI 활용 직접 실험']) {
    expect(html).toContain(t)
  }
})

test('E3 순서 = 운영 증빙이 요강 직후(활동 구성보다 앞) — 전체 섹션 순서 고정', () => {
  const html = flat(<Recruit />)
  const order = ['id="rc-facts"', 'rc-proof-h', 'rc-fit-h', 'rc-timeline-h', 'rc-steps-h', 'rc-faq-h', 'rc-apply-h', 'rc-join-h']
  const idx = order.map((k) => html.indexOf(k))
  idx.forEach((v, i) => expect(v, `${order[i]} 부재`).toBeGreaterThan(-1))
  expect([...idx].sort((a, b) => a - b)).toEqual(idx)
})

test('E4 FAQ 서브셋 = data/faq.js 단일원천(모집 문항만·아코디언) + 전체 FAQ 링크', () => {
  const html = flat(<Recruit />)
  expect(RECRUIT_FAQ.length).toBeGreaterThan(0)
  expect(RECRUIT_FAQ.length).toBeLessThan(FAQ.length) // 서브셋 — 전량 복제 아님
  for (const { q } of RECRUIT_FAQ) expect(html).toContain(q)
  expect(html).not.toContain('스터디가 왜 필요한가요') // 비모집 문항은 메인만
  expect(html).toContain('rc-faq-item')
  expect(html).toContain('<details')
})

test('E5 키비주얼 = 교차·겹침 장식 존재, 조준점(reticle) 부재(오너 반려 2026-08-05)', () => {
  const html = flat(<Recruit />)
  expect(html).toContain('rc-visual')
  expect(html).toContain('aria-hidden="true"')
  expect(html).not.toContain('reticle')
})

test('E6 CTA = 헤더 신청하기 앵커 → 하단 폼 섹션 id 연결', () => {
  const html = flat(<Recruit />)
  expect(html).toContain('신청하기')
  expect(html).toContain('href="#apply"')
  expect(html).toContain('id="apply"')
})
