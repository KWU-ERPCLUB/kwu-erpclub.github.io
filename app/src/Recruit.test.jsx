import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Recruit from './Recruit.jsx'
import {
  RECRUIT, ACADEMIC_RULE, COHORT_LABEL, AIM_ROADMAP, RECRUIT_FACTS,
  RECRUIT_GOAL_LEAD, RECRUIT_MOAT, RECRUIT_FLOW, formatWindow,
} from './data/recruit.js'
import { FAQ, RECRUIT_FAQ } from './data/faq.js'

// 구조·계약 검증 — IA 3차(2026-07-27) + v3.2 조정(2026-08-05 오너 피드백). 사실 서술만.
const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

// 4차(2026-08-06) — 페이지 헤드 = 공용 PageHead 중앙 정렬. 갱신 메타 = 인사이트만 유지 → 여기선 부재.
test('page-head = 키커 RECRUIT + 헤드라인 + 문장형 서브(메타 줄 없음)', () => {
  const html = flat(<Recruit />)
  expect(html).toContain('pg-label')
  expect(html).toContain('>RECRUIT<')
  expect(html).toContain('pg-title')
  expect(html).toContain('pg-sub')
  expect(html).toContain('첫 기수를 모집합니다') // 문장형 설명(대시 부연 폐지 2026-08-15)
  expect(html).not.toContain('pg-meta') // 갱신 메타 = 인사이트 전용(피드백 "다른 건 굳이")
  expect(html).not.toContain('rc-eyebrow') // 구 4구현 잔재 금지
})

test('요강 = 확정값만 게재(2026-08-27 개정) — 기간·인원 00명·대상·모임 월 18~20시·준비물 노트북', () => {
  const html = flat(<Recruit />)
  expect(html).toContain(formatWindow()) // 모집 기간 = 데이터 파생(하드코딩 아님)
  expect(html).toContain(RECRUIT.활동기간)
  // 값 = 핵심(strong)+부연(span) 분리 렌더(2026-08-07) — 연속 문자열 대신 두 조각으로 단언
  expect(html).toContain('<strong>00명</strong>')     // 인원 미정 관례 표기(오너 2026-08-27)
  expect(html).toContain('추후 확정')
  expect(html).not.toContain('6~10명')
  expect(html).toContain('<strong>경영학부 중심</strong>')
  expect(html).toContain('비전공자도 환영')   // 구 '전공 무관' = 배제 어휘(오너 2026-08-19 톤 완화)
  expect(html).toContain('매주 월요일 18:00 ~ 20:00 대면')
  for (const [, v] of RECRUIT_FACTS) expect(v, `요강에 온라인 표기: ${v}`).not.toContain('온라인') // 2026-08-27 — 온라인 회차 0(요강 값만 — 폼 미설정 안내문의 '온라인 접수'는 별개)
  expect(html).toContain('00명')
  expect(html).toContain('개인 노트북 필수')
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

test('이 스터디의 목표(2026-08-27 5차) = 리드 + 해자 4(뒤집기 카드 앞/뒤) + 흐름 3 — 대시·AI투 0', () => {
  const html = flat(<Recruit />)
  expect(html).toContain('rc-do-h')
  expect(html).toContain('이 스터디의 목표')
  expect(html).not.toContain('이 스터디가 하는 일')
  expect(html).toContain(RECRUIT_GOAL_LEAD)
  expect(RECRUIT_MOAT.length).toBe(4)   // 2×2 — 고아 카드 0
  expect(RECRUIT_FLOW.length).toBe(3)
  for (const [t, alone, here] of RECRUIT_MOAT) {
    expect(html, `해자 제목 부재: ${t}`).toContain(t)
    expect(html, `앞면(혼자서는) 부재: ${t}`).toContain(alone)
    expect(html, `뒷면(여기서는) 부재: ${t}`).toContain(here)
  }
  for (const [t, w, d] of RECRUIT_FLOW) {
    expect(html).toContain(t); expect(html).toContain(w); expect(html).toContain(d)
  }
  expect(html).toContain('rc-moat-card')
  expect(html).toContain('aria-pressed="false"')      // 뒤집기 = 버튼(키보드 접근)
  expect((html.match(/rc-moat-front/g) || []).length).toBe(4)
  expect((html.match(/rc-moat-back/g) || []).length).toBe(4)
  expect(html).toContain('rc-flow')
  expect(html).not.toContain('rc-show-h')
  expect(html).not.toContain('주 1건 기고')
  expect(html).not.toContain('회사처럼')
  expect(html).not.toContain('AX')
  // 카피 가드: 대시 금지 · 경어체/AI투 금지
  const strs = [RECRUIT_GOAL_LEAD, ...RECRUIT_MOAT.flat(), ...RECRUIT_FLOW.flatMap((f) => [f[0], f[2]])]
  for (const s of strs) {
    for (const banned of ['—', ' - ', '습니다', '입니다', '최고', '완벽', '혁신', '여정', '경험을 선사', '한 단계', '레벨업', '체계적으로']) {
      expect(s, `금지 표현 «${banned}»: ${s}`).not.toContain(banned)
    }
  }
})

// 2026-08-14 일원화 — AIM 1기 로드맵: 원천 = data/aim-roadmap.js(워크스페이스 로드맵과 완전 동일 값, 2단 재편 1차 4 + 2차 5).
test('AIM 1기 로드맵 = 페이즈 3 + 회차 9 — 단일원천 파생·진행선 구조', () => {
  const html = flat(<Recruit />)
  expect(html).toContain(`${COHORT_LABEL} 로드맵`) // 섹션명
  expect(html).toContain('rc-rm')
  expect(html).toContain('rc-rm-fill') // 스크롤 진행 채움선
  expect(AIM_ROADMAP.filter((n) => n.type === 'phase').length).toBe(3) // 1차·시험기간·2차(모집 구간 = 공개면 제외)
  expect(AIM_ROADMAP.filter((n) => n.type === 'session').length).toBe(8) // 회차 7 + 과제 주 1(2026-08-27)
  expect(html).toContain('1차 프로젝트')
  expect(html).toContain('2차 프로젝트')
  expect(html).toContain('시험기간')               // '시험 휴지' 개명(오너 2026-08-14)
  expect(html).not.toContain('시험 휴지')
  expect(html).not.toContain('전반부') // 구 명명 = 대외 표기에서 제거
  expect(html).not.toContain('후반부')
  // 날짜 = 단일원천(aim-roadmap.js — 운영틀 §2 2026-08-13 재편 값)
  expect(html).toContain('09-14 ~ 10-05')   // 월요일 확정(2026-08-27)
  expect(html).toContain('10-07 ~ 10-25')
  expect(html).toContain('10-26 ~ 11-16')
  expect(html).toContain(ACADEMIC_RULE) // 학사일정 연동 원칙 1줄 명기
  expect(html).not.toContain('산출물 = 본인 소유') // 요강 하단 콜아웃 = 오너 삭제 2026-08-07(폼 안내 rc-callout은 별개)
})

test('로드맵 회차 = 번호·주제·배움·세부 전량 렌더 + OT·쇼케이스·최종 발표 태그', () => {
  const html = flat(<Recruit />)
  for (const s of AIM_ROADMAP.filter((n) => n.type === 'session')) {
    expect(html, `회차 번호 부재: ${s.no}`).toContain(`>${s.no}<`)
    expect(html, `회차 주제 부재: ${s.주제}`).toContain(s.주제)
    expect(html, `배움 부재: ${s.no}`).toContain(s.배움)
    for (const d of s.세부) expect(html, `세부 부재: ${d}`).toContain(d)
  }
  expect(html).toContain('>OT<') // 1회 = OT 태그(오너 "맨 처음은 OT")
  expect(html).toContain('과제 주')        // 10/5 태그(2026-08-27 — 쇼케이스 회차 폐지)
  expect(html).toContain('최종 발표')      // 9회 태그
  expect(html).not.toContain('중간 쇼케이스') // 2026-08-13 재편 — 폐기 노드
  expect(html).not.toContain('다섯 활용 축')  // 구 커리큘럼 잔재 금지
  expect(html).not.toContain('rc-rounds') // 구 차시 목록 폐지
  expect(html).not.toContain('rc-steps-spy')
})

test('2차 프로젝트 페이즈 = 버건디 포인트(rc-rm-hl)', () => {
  const html = flat(<Recruit />)
  expect((html.match(/rc-rm-hl/g) || []).length).toBe(1) // 2차 프로젝트(최종 발표 = 9회차로 흡수)
})

test('[미정] 게재 금지(운영틀 §8) — 최종 발표 주간·요일·인원·선발 방식 값 없음', () => {
  const html = flat(<Recruit />)
  expect(html).toContain('추후 확정') // 인원 = 미정 표기만
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

test('타임라인 섹션 삭제(오너 2026-08-07) + 미정 선발 단계 날조 없음', () => {
  const html = flat(<Recruit />)
  expect(html).not.toContain('rc-timeline-h') // 「접수부터 활동 시작까지」 폐지
  expect(html).not.toContain('접수부터 활동 시작까지')
  for (const invented of ['면접', '서류 심사', '합격']) {
    expect(html, `미정 선발 단계 날조: ${invented}`).not.toContain(invented)
  }
})

// 2026-08-19 오너: "톤이 너무 빡빡하다" — 선발 문법("이런 분을 찾습니다"·요건 어휘)을 문턱 낮은 서술로.
// 심사 없이 받는 스터디라 요건을 세우면 사실과도 어긋난다. 체크리스트 형태(rc-who)는 유지.
test('E2 참여 조건 = 문턱 낮은 체크리스트 4행 — 선발 어휘 금지', () => {
  const html = flat(<Recruit />)
  expect(html).toContain('rc-who')
  expect(html).toContain('rc-who-check')
  expect(html).toContain('이 정도면 충분합니다')
  expect(html).not.toContain('WHO SHOULD APPLY')
  expect(html).not.toContain('이런 분을 찾습니다')
  for (const t of ['비전공자 환영', '코딩 몰라도 됨', '주 1회 참여', '직접 해보고 싶은 마음']) {
    expect(html).toContain(t)
  }
  // '전공 무관' = 배제 어휘로 읽힌다(오너) → 페이지 전역에서 '비전공자 환영' 계열로 통일
  expect(html).not.toContain('전공 무관')
})

test('E3 순서 = WHAT WE DO가 요강 직후(구 운영 증빙 자리) — 전체 섹션 순서 고정', () => {
  const html = flat(<Recruit />)
  const order = ['id="rc-facts"', 'rc-do-h', 'rc-fit-h', 'rc-steps-h', 'rc-faq-h', 'rc-apply-h', 'rc-join-h']
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

// FAQ 증보(2026-08-05 2차) → 오너 삭제 3문항 반영(2026-08-07: ERP연구회 관계·학점·개인정보).
test('FAQ 잔존 증보 문항(시간·전공) 노출 + 삭제 3문항 부재', () => {
  const html = flat(<Recruit />)
  const added = ['주당 시간이 얼마나 드나요?', '전공 제한이 있나요?']
  for (const q of added) {
    expect(RECRUIT_FAQ.some((f) => f.q === q), `모집 서브셋 누락: ${q}`).toBe(true)
    expect(html, `모집 페이지 미노출: ${q}`).toContain(q)
  }
  for (const gone of ['ERP연구회와는 어떤 관계', '학점·졸업요건', '제출한 개인정보']) {
    expect(FAQ.some((f) => f.q.includes(gone)), `삭제 문항 잔존: ${gone}`).toBe(false)
  }
  const byQ = (needle) => FAQ.find((f) => f.q.includes(needle)).a
  expect(byQ('주당 시간')).toContain('매주 월요일 18:00~20:00 대면') // 요강 값과 동일
  expect(byQ('주당 시간')).toContain('기고 의무는 없습니다') // 2026-08-27 기고 의무 폐지
  expect(byQ('웹사이트를 만드는')).toContain('커리큘럼에 없습니다') // 웹 제작 오인 차단 문항
  expect(byQ('주당 시간')).toContain(ACADEMIC_RULE)      // 시험 전 활동 중지 = 공용 상수
  expect(byQ('전공 제한')).toContain('경영학부 중심')
})

test('FAQ 증보 = 미확정 항목 문항·값 없음(선발 기준·정원·결석)', () => {
  const all = FAQ.map((f) => `${f.q} ${f.a}`).join(' ')
  for (const banned of ['선발 기준', '정원', '결석', '[미정]']) {
    expect(all, `미확정 항목 게재: ${banned}`).not.toContain(banned)
  }
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

test('인터랙션 = 런타임 클래스 게이트 — 정적 렌더에 rc-js·rc-spy-js·rc-in·on 없음 + 로드맵 구조 존재', () => {
  const html = flat(<Recruit />)
  expect((html.match(/class="rc-rm"/g) || []).length).toBe(1) // AIM 1기 로드맵 = 스파이·진행선 대상
  // 감쇠·리빌은 훅이 런타임에만 부여(rc-js/rc-spy-js/rc-in/.on) → no-JS 정적 렌더 = 전부 선명
  expect(html).not.toContain('rc-js')
  expect(html).not.toContain('rc-spy-js')
  expect(html).not.toContain('rc-in"')
  expect(html).not.toContain('rc-rm-s on')
})

// 4차(2026-08-06) — 좌 라벨 레일(rc-label·rc-grid) 전면 폐지(피드백 "왼쪽 네모들 다 삭제").
test('4차 — 좌 라벨 레일 부재 + 섹션 9개 구조 유지', () => {
  const html = flat(<Recruit />)
  expect(html).not.toContain('rc-label')
  expect(html).not.toContain('rc-grid')
  expect((html.match(/class="rc-secs"/g) || []).length).toBe(7) // 요강~문의 7섹션(SHOWCASE 삭제 2026-08-27, 헤더 별도)
})
