import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Recruit from './Recruit.jsx'
import {
  RECRUIT, PHASES, ACADEMIC_RULE, COHORT_LABEL, RECRUIT_DO, RECRUIT_STEPS,
  RECRUIT_SHOWCASE, SHOWCASE_LEAD, formatWindow, shortDate,
} from './data/recruit.js'
import { FAQ, RECRUIT_FAQ } from './data/faq.js'

// 구조·계약 검증 — IA 3차(2026-07-27) + v3.2 조정(2026-08-05 오너 피드백). 사실 서술만.
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

// v3.2 ① — 운영 증빙 블랙 밴드 제거(신생 스터디 = 증빙 무의미), 자리 = WHAT WE DO.
test('v3.2 운영 증빙·블랙 밴드·키비주얼 부재 — rc-black·stat-rows·rc-visual 0', () => {
  const html = flat(<Recruit />)
  expect(html).not.toContain('운영 증빙')
  expect(html).not.toContain('rc-black')
  expect(html).not.toContain('stat-rows')
  expect(html).not.toContain('rc-visual') // ④ 과녁/원 키비주얼(두 원+×) 완전 삭제
})

test('v3.2 WHAT WE DO = 이 스터디가 하는 일 — 활동 4카드(기고·세미나·효율화 산출물·팀 프로젝트)', () => {
  const html = flat(<Recruit />)
  expect(html).toContain('>WHAT WE DO<') // 좌 라벨(골격 유지)
  expect(html).toContain('rc-do-h')
  expect(html).toContain('이 스터디가 하는 일')
  expect(RECRUIT_DO.length).toBe(4)
  for (const [t] of RECRUIT_DO) expect(html, `활동 카드 부재: ${t}`).toContain(t)
  expect(html).toContain('주 1건 기고')
  expect(html).toContain('세미나')
})

// SHOWCASE(2026-08-05 2차) — "챗GPT면 충분" 반론에 대한 실물 증거 3건.
test('SHOWCASE = 실물 3건(보드·허브·세미나 자료) — 이름·사실 1줄·링크·썸네일', () => {
  const html = flat(<Recruit />)
  expect(html).toContain('rc-show-h')
  expect(html).toContain('>SHOWCASE<')
  expect(RECRUIT_SHOWCASE.length).toBe(3)
  for (const { name, fact, href, img } of RECRUIT_SHOWCASE) {
    expect(html, `실물 이름 부재: ${name}`).toContain(name)
    expect(html, `사실 서술 부재: ${name}`).toContain(fact)
    expect(html, `링크 부재: ${name}`).toContain(`href="${href}"`)
    expect(html, `썸네일 부재: ${name}`).toContain(`src="${img}"`)
  }
  expect(html).toContain(SHOWCASE_LEAD)
  expect(html).toContain('rc-fit rc-show') // 카드 문법 = 기존 rc-fit 승계(새 시각 언어 0)
})

test('SHOWCASE 카피 = 개조식·과장 없음(경어체·마케팅 어휘 0)', () => {
  const strs = [SHOWCASE_LEAD, ...RECRUIT_SHOWCASE.flatMap((s) => [s.name, s.fact])]
  for (const s of strs) {
    for (const banned of ['습니다', '입니다', '됩니다', '하세요', '최고', '완벽', '혁신']) {
      expect(s, `금지 표현 «${banned}» 포함: ${s}`).not.toContain(banned)
    }
  }
})

// v3.2 ② — 활동 구성 = 로드맵 단순화: 회차 수 + 회차별 주제 한 줄. 세로 레일 문법 재사용.
test('활동 구성 로드맵 = 1차(개인 5회)·시험 휴지·2차(팀) — 날짜 = PHASES 파생', () => {
  const html = flat(<Recruit />)
  expect(html).toContain('rc-steps')
  expect(html).toContain('1차 프로젝트')
  expect(html).toContain('2차 프로젝트')
  expect(html).not.toContain('전반부') // 구 명명 = 대외 표기에서 제거(운영틀 개정 이력 2026-08-05)
  expect(html).not.toContain('후반부')
  expect(html).toContain(`${PHASES.p1.형태} — ${PHASES.p1.회차}회`) // 회차 수 명기
  expect(html).toContain('중간고사 기간 활동 중지')
  // 날짜 = data/recruit.js PHASES 파생(운영틀 §2 — 하드코딩 아님)
  expect(html).toContain(`${shortDate(PHASES.p1.킥오프주간)} 주간 ~ ${shortDate(PHASES.p1.쇼케이스주간)} 주간`)
  expect(html).toContain(`${shortDate(PHASES.휴지.start)} ~ ${shortDate(PHASES.휴지.end)}`)
  expect(html).toContain(`${shortDate(PHASES.p2.개시주간)} 주간 ~ ${shortDate(PHASES.p2.상한주간)} 주간`)
  expect(html).toContain('팀 프로젝트')
  expect(html).toContain(ACADEMIC_RULE) // 학사일정 연동 원칙 1줄 명기
  expect(html).toContain('rc-callout')
})

test('로드맵 회차 한 줄 = 1차 5회 주제(rc-rounds — 구 워드 스택 폐지)', () => {
  const html = flat(<Recruit />)
  expect(html).toContain('rc-rounds')
  expect(html).not.toContain('rc-words') // B3 워드 스택 = v3.2 폐지
  expect(RECRUIT_STEPS[0].rounds.length).toBe(5)
  for (const r of ['킥오프 — 소재 선정', 'AI 도구 개괄·체험', '공통 미니과제', '본인 소재 제작', '중간 쇼케이스']) {
    expect(html, `회차 주제 부재: ${r}`).toContain(r)
  }
})

test('2차 팀 프로젝트 구간 = 버건디 포인트(rc-step-hl) + 예상 시기 표기', () => {
  const html = flat(<Recruit />)
  expect((html.match(/rc-step-hl/g) || []).length).toBe(1) // 강조 = 2차 구간 1곳만
  expect(html).toContain('예상 시기')
  const p2Start = html.indexOf('rc-step-hl')
  expect(html.indexOf('2차 프로젝트', p2Start)).toBeGreaterThan(-1) // 강조 대상 = 2차 구간
})

test('[미정] 게재 금지(운영틀 §8) — 최종 발표 주간·요일·인원·선발 방식 값 없음', () => {
  const html = flat(<Recruit />)
  expect(html).toContain('발표 주간 = 추후 확정') // 최종 발표 = 과정 서술만, 날짜 없음
  expect(html).not.toContain('최종 발표 주간 · ')
  expect(html).not.toContain('12-01') // 기말 전 주간을 발표 주간으로 날조 금지
  expect(html).not.toContain('11-30')
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

// ── 레퍼런스 픽 E1~E6(오너 확정 2026-08-05 — E5 키비주얼은 v3.2에서 삭제) ──

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

test('E3 순서 = WHAT WE DO가 요강 직후(구 운영 증빙 자리) — 전체 섹션 순서 고정', () => {
  const html = flat(<Recruit />)
  const order = ['id="rc-facts"', 'rc-do-h', 'rc-show-h', 'rc-fit-h', 'rc-timeline-h', 'rc-steps-h', 'rc-faq-h', 'rc-apply-h', 'rc-join-h']
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

test('E6 CTA = 헤더 신청하기 앵커 → 하단 폼 섹션 id 연결 + 대형 CTA(유지)', () => {
  const html = flat(<Recruit />)
  expect(html).toContain('신청하기')
  expect(html).toContain('href="#apply"')
  expect(html).toContain('id="apply"')
  expect(html).toContain('rc-cta-xl') // 대형 CTA(차콜 필 + 버건디 원형 화살표 — Primary 확대판)
})

// ── v3.1 골격 유지분(B2 좌 라벨 2단) — v3.2에서도 불변 ──

// ── v3.3 스크롤 인터랙션 복원(2026-08-05) — SSR/no-JS 폴백 가드: 게이트 클래스가 정적 렌더에 없어야 전부 선명 ──

test('v3.3 인터랙션 = 런타임 클래스 게이트 — 정적 렌더에 rc-js·rc-spy-js·rc-in·on 없음 + 스파이 대상 클래스 존재', () => {
  const html = flat(<Recruit />)
  expect(html).toContain('rc-steps rc-steps-spy') // PROGRAM 로드맵 = 스파이 대상(SCHEDULE은 비대상)
  expect((html.match(/rc-steps-spy/g) || []).length).toBe(1)
  // 감쇠·리빌은 훅이 런타임에만 부여(rc-js/rc-spy-js/rc-in/.on) → no-JS 정적 렌더 = 전부 선명
  expect(html).not.toContain('rc-js')
  expect(html).not.toContain('rc-spy-js')
  expect(html).not.toContain('rc-in"')
  expect(html).not.toContain('rc-step on')
})

test('B2 좌 라벨 컬럼 = 전 섹션 9개(버건디 ■ + 영문 라벨) — RECORD → WHAT WE DO 교체 + SHOWCASE 신설', () => {
  const html = flat(<Recruit />)
  expect((html.match(/class="rc-label"/g) || []).length).toBe(9)
  for (const en of ['OVERVIEW', 'WHAT WE DO', 'SHOWCASE', 'TARGET', 'SCHEDULE', 'PROGRAM', 'FAQ', 'APPLY', 'CONTACT']) {
    expect(html, `좌 라벨 부재: ${en}`).toContain(`>${en}<`)
  }
  expect(html).not.toContain('>RECORD<')
})
