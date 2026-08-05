// /recruit (IA 3차 2026-07-27) — AIM 기수 안내: 요강·활동 구성·참여 방법.
// + 운영 증빙(IA 4차 2026-08-05 — about 폐지로 이관): 실측 정량 3종 + 출처(stat-rows/CountUp 문법 재사용).
// + 레퍼런스 픽 E1~E6(오너 확정 2026-08-05, 원천 = erp-club docs/2026-08-05-리쿠르트-레퍼런스-후보.md §2):
//   E1 모집 일정 타임라인(확정 단계만) · E2 이런 사람 카드 · E3 증빙 요강 직후 상향 · E4 FAQ 서브셋(원천 = data/faq.js)
//   E5 교차·겹침 키비주얼(조준점 재사용 금지 — 히어로 반려 이력) · E6 헤더 '신청하기' 앵커 CTA.
// 카피 = 개조식·사실 서술만(SPEC §4 개정 — 마케팅 어투 금지). [미정] 값 게재 금지(운영틀 §8):
// 확정값(운영틀 2026-07-27 오너 인터뷰)만 싣고, 요일·시간은 "참가자 조율로 확정" 과정 서술로만.
import { useMemo } from 'react'
import { SiteNav, SiteFooter, REPO_URL, Arrow } from './shared.jsx'
import { RECRUIT, PHASES, ACADEMIC_RULE, COHORT_LABEL, formatWindow, shortDate } from './data/recruit.js'
import { RECRUIT_FAQ } from './data/faq.js'
import { loadContent } from './content/loader.js'
import { CountUp } from './home-motion.jsx'
import RecruitForm from './RecruitForm.jsx'

// 요강 — 기수·기간·일정 값의 원천 = data/recruit.js(그 원천 = erp-club docs/specs/2026-07-27-aim-운영틀.md §2·§3·§7)
// 인원·모임·대상 개정 = 오너 확정 2026-08-05(인원 6~10명 → 미정, 요일 추후 확정, 경영학부 중심 명시)
const FACTS = [
  ['스터디', `${RECRUIT.study} — ERP연구회 산하 MIS·AI 스터디`],
  ['대상', '경영학부 중심 — 전공 무관'],
  ['인원', '미정 — 추후 확정'],
  ['모집 기간', formatWindow()],
  ['활동 기간', RECRUIT.활동기간],
  ['모임', '매주 대면 60분 — 요일 추후 확정'],
  ['비용', '참가비 없음 — 무료 도구 기준(유료 도구 = 개인 선택)'],
]

// 이런 사람(E2) — 자격·지향 사실 서술 4카드(권유형 수사 금지). 콜아웃의 '코딩 경험 불필요'는 여기로 이동.
const FIT = [
  ['경영학부 중심', '전공 무관 — 지원 제한 없음.'],
  ['코딩 경험 불필요', '주제 = 코딩이 아니라 AI 활용. 도구 사용법은 스터디에서 함께 다룸.'],
  ['매주 대면 60분', '주 1회 교내 모임 참여 가능 전제 — 요일은 참가자 조율로 확정.'],
  ['AI 활용 직접 실험', '본인 반복 작업(수업·과제·시험공부)의 자동화를 직접 만들어 보는 사람.'],
]

// 모집 일정(E1) — 확정 단계만(선발 방식 미정 → 단계 날조 금지, 픽 시트 §3). 날짜 = data/recruit.js 파생.
const 시작월 = RECRUIT.일정.전반.기간.split(' ')[0] // '9월'
const TIMELINE = [
  {
    era: `서류 접수 · ${formatWindow()}`,
    title: '신청 폼 제출',
    desc: '이 페이지 하단 폼에서 온라인 제출 — 기간 내 접수분만 유효.',
  },
  {
    era: '접수 마감 후',
    title: '개별 안내',
    desc: '접수 정보 기준 개별 연락 — 이후 절차는 연락 시 안내.',
  },
  {
    era: `활동 시작 · ${시작월}`,
    title: `${COHORT_LABEL} 활동 개시`,
    desc: `첫 회차 = ${PHASES.p1.라벨} 킥오프(${shortDate(PHASES.p1.킥오프주간)} 주간, 소재 선정) — 활동 기간 ${RECRUIT.활동기간}.`,
  },
]

// 활동 구성 — 1차 프로젝트(개인 산출물) → 시험 휴지 → 2차 프로젝트(팀). 명명 = 운영틀 개정 이력(2026-08-05).
// 날짜 = data/recruit.js PHASES 파생(운영틀 §2 확정값만 — 최종 발표 주간 [미정] 게재 금지).
const STEPS = [
  {
    era: `${PHASES.p1.라벨} · ${shortDate(PHASES.p1.킥오프주간)} 주간 ~ ${shortDate(PHASES.p1.쇼케이스주간)} 주간 · ${PHASES.p1.회차}회`,
    title: `${PHASES.p1.형태} — 각자 반복 작업 하나를 AI로 자동화`,
    desc: '본인이 매주 반복하는 작업(수업·과제·시험공부)에서 소재 선정 — 만든 것을 계속 쓰는 구조. 마지막 회 = 중간 쇼케이스.',
    list: ['킥오프 — 소재 선정', 'AI 도구 개괄·체험', '공통 미니과제', '개인 산출물 제작·첨삭', '중간 쇼케이스 — 발표·사이트 게재'],
  },
  {
    era: `시험 휴지 · ${shortDate(PHASES.휴지.start)} ~ ${shortDate(PHASES.휴지.end)}`,
    title: '중간고사 기간 활동 중지',
    desc: `중간고사 ${shortDate(PHASES.휴지.중간고사.start)} ~ ${shortDate(PHASES.휴지.중간고사.end)} — 시험 2주 전부터 세션 없음.`,
  },
  {
    era: `${PHASES.p2.라벨} · ${shortDate(PHASES.p2.개시주간)} 주간 ~ ${shortDate(PHASES.p2.상한주간)} 주간`,
    title: `${PHASES.p2.형태} 프로젝트 — 경영·업무 맥락`,
    desc: `제시된 주제 풀에서 팀별 선택 → 매주 체크인 → 최종 발표·사이트 게재. 활동 = 기말고사(${shortDate(PHASES.p2.기말고사.start)}~) 2주 전까지, 발표 주간 = 추후 확정.`,
  },
]

// 키비주얼(E5) — AI×MIS 교차(×)·겹침(두 원) 모티프, v3 강도 상향(2026-08-05 §6-2):
// 헤더 = N3 버건디 색 면 → 라인 = 화이트 알파(면 위 장식 — §1 버건디 터치 예산과 별개).
// 조준점(원+십자 관통) 도형 재사용 금지 — 오너가 히어로에서 반려(2026-08-05). ×는 원을 관통하지 않고 겹침 렌즈 안에만.
function CrossVisual() {
  return (
    <svg className="rc-visual" viewBox="0 0 320 240" fill="none" aria-hidden="true" focusable="false">
      <circle cx="122" cy="120" r="92" stroke="rgba(255,255,255,0.42)" strokeWidth="2.5" />
      <circle cx="198" cy="120" r="92" stroke="rgba(255,255,255,0.28)" strokeWidth="2.5" />
      <path d="M142 102 L178 138 M178 102 L142 138" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// 운영 증빙 — 실측 정량만(콘텐츠 건수 = content/ 집계, 나머지 = 확인된 사실). 구 About Proof 이관(수치·출처 그대로).
// 위치 = 요강 직후(E3 상향 2026-08-05 — 구 페이지 최하단).
export function RecruitProof() {
  const articleCount = useMemo(() => loadContent('기사').length, [])
  const seminarCount = useMemo(() => loadContent('세미나').length, [])
  const proof = [
    { num: '1', label: '진행 중 스터디', src: 'ADsP 1기 — 진도 보드로 운영' },
    { num: '2', label: '라이브 실물', src: 'ADsP 진도 보드 · 이 사이트 (KWU-ERPCLUB 저장소)' },
    { num: String(articleCount + seminarCount), label: '게재된 기사·세미나', src: 'content/ 집계 (기사 ' + articleCount + ' · 세미나 ' + seminarCount + ')' },
  ]
  return (
    <section className="rc-secs" aria-labelledby="rc-proof-h">
      <div className="rc-band-in">
        <span className="rc-kicker">기록</span>
        <h2 className="rc-h2" id="rc-proof-h">운영 증빙</h2>
        <div className="stat-rows">
          {proof.map((p) => (
            <div className="stat-row" key={p.label}>
              <CountUp value={p.num} />
              <div>
                <span className="stat-row-label">{p.label}</span>
                <span className="stat-row-src">{p.src}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Recruit() {
  return (
    <>
      <SiteNav />
      <main className="rc-main">
        <header className="rc-head">
          <div className="rc-head-in">
            <CrossVisual />
            <span className="rc-eyebrow">RECRUIT</span>
            <h1 className="rc-h1">{RECRUIT.study} <em>{RECRUIT.cohort}</em> 모집</h1>
            <p className="rc-lead">
              {RECRUIT.study} = ERP연구회 산하 스터디 · 경영학부를 대상으로 AI와 MIS를 함께 공부하기 위해 개설 ·
              전공 무관 모집 — 2026 {RECRUIT.term} 첫 기수.
            </p>
            <p className="rc-meta">게재 2026-07-27 · 개정 2026-08-05 · 담당 운영진</p>
            <div className="rc-head-cta">
              <a className="btn-2nd" href="#apply">신청하기</a>
            </div>
          </div>
        </header>

        <section className="rc-facts-sec" aria-labelledby="rc-facts">
          <div className="rc-band-in">
            <span className="rc-kicker" id="rc-facts">요강</span>
            <dl className="rc-facts">
              {FACTS.map(([label, value]) => (
                <div className="rc-fact" key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <p className="rc-callout">
              산출물 = 본인 소유, 기록은 <a href="/seminars/">세미나</a>·<a href="/projects/">프로젝트</a> 페이지에 축적.
            </p>
          </div>
        </section>

        <RecruitProof />

        <section className="rc-secs" aria-labelledby="rc-fit-h">
          <div className="rc-band-in">
            <span className="rc-kicker">대상</span>
            <h2 className="rc-h2" id="rc-fit-h">이런 사람</h2>
            <ul className="rc-fit">
              {FIT.map(([title, desc]) => (
                <li key={title}>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rc-secs" aria-labelledby="rc-timeline-h">
          <div className="rc-band-in">
            <span className="rc-kicker">모집 일정</span>
            <h2 className="rc-h2" id="rc-timeline-h">접수부터 활동 시작까지</h2>
            <ol className="rc-steps">
              {TIMELINE.map((t) => (
                <li className="rc-step" key={t.title}>
                  <span className="rc-step-era">{t.era}</span>
                  <h3>{t.title}</h3>
                  <p>{t.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rc-secs" aria-labelledby="rc-steps-h">
          <div className="rc-band-in">
            <span className="rc-kicker">활동 구성</span>
            <h2 className="rc-h2" id="rc-steps-h">1차 프로젝트 — 개인 · 2차 프로젝트 — 팀</h2>
            <p className="rc-sched-rule">{ACADEMIC_RULE}</p>
            <ol className="rc-steps">
              {STEPS.map((s) => (
                <li className="rc-step" key={s.title}>
                  <span className="rc-step-era">{s.era}</span>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  {s.list && (
                    <ol>
                      {s.list.map((it) => <li key={it}>{it}</li>)}
                    </ol>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rc-secs" aria-labelledby="rc-faq-h">
          <div className="rc-band-in">
            <span className="rc-kicker">FAQ</span>
            <h2 className="rc-h2" id="rc-faq-h">자주 묻는 질문 — 모집 관련</h2>
            <div className="rc-faq">
              {RECRUIT_FAQ.map(({ q, a }) => (
                <details className="rc-faq-item" key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
            <p className="rc-faq-more">
              <a className="proof-link" href="/#faq">전체 FAQ <Arrow /></a>
            </p>
          </div>
        </section>

        <section className="rc-secs" id="apply" aria-labelledby="rc-apply-h">
          <div className="rc-band-in">
            <span className="rc-kicker">신청</span>
            <h2 className="rc-h2" id="rc-apply-h">신청 폼 — 이 페이지에서 제출</h2>
            <RecruitForm />
          </div>
        </section>

        <section className="rc-secs" aria-labelledby="rc-join-h">
          <div className="rc-band-in">
            <span className="rc-kicker">참여 방법</span>
            <h2 className="rc-h2" id="rc-join-h">문의 — 스터디 단톡방</h2>
            <div className="rc-actions">
              <a className="btn-2nd" href={REPO_URL}>GitHub 저장소</a>
              <a className="proof-link" href="/#faq">자주 묻는 질문 <Arrow /></a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
