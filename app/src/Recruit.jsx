// /recruit (IA 3차 2026-07-27) — AIM 기수 안내: 요강·활동 구성·참여 방법.
// 카피 = 개조식·사실 서술만(SPEC §4 개정 — 마케팅 어투 금지). [미정] 값 게재 금지(운영틀 §8):
// 확정값(운영틀 2026-07-27 오너 인터뷰)만 싣고, 요일·시간은 "참가자 조율로 확정" 과정 서술로만.
import { SiteNav, SiteFooter, REPO_URL, Arrow } from './shared.jsx'
import { RECRUIT_WINDOW } from './home-logic.js'

// 요강 — 값 원천 = erp-club docs/specs/2026-07-27-aim-운영틀.md(§2·§3·§7 확정 레코드)
const FACTS = [
  ['스터디', 'AIM — ERP연구회 산하 MIS·AI 스터디'],
  ['대상', '광운대 재학생 — 전공 무관'],
  ['인원', '6~10명'],
  ['모집 기간', `${RECRUIT_WINDOW.start} ~ ${RECRUIT_WINDOW.end}`],
  ['활동 기간', '2026-09 ~ 12 (2학기)'],
  ['모임', '매주 대면 60분 — 요일·시간 = 참가자 시간표 조율로 확정'],
  ['비용', '참가비 없음 — 무료 도구 기준(유료 도구 = 개인 선택)'],
]

// 활동 구성 — 2페이즈(전반 개인 산출물 → 후반 팀 프로젝트) + 시험 휴지.
const STEPS = [
  {
    era: '전반부 · 9월 ~ 10월 초 · 5회',
    title: '각자 반복 작업 하나를 AI로 자동화',
    desc: '본인이 매주 반복하는 작업(수업·과제·시험공부)에서 소재 선정 — 만든 것을 계속 쓰는 구조.',
    list: ['킥오프 — 소재 선정', 'AI 도구 개괄·체험', '공통 미니과제', '개인 산출물 제작·첨삭', '중간 쇼케이스 — 발표·사이트 게재'],
  },
  {
    era: '시험 휴지 · 10월 중순',
    title: '중간고사 기간 휴식',
    desc: '10-06 ~ 10-26 세션 없음.',
  },
  {
    era: '후반부 · 10월 말 ~ 12월',
    title: '팀 프로젝트 — 경영·업무 맥락',
    desc: '제시된 주제 풀에서 팀별 선택 → 매주 체크인 → 최종 발표·사이트 게재.',
  },
]

export default function Recruit() {
  return (
    <>
      <SiteNav />
      <main className="rc-main">
        <header className="rc-head">
          <div className="rc-head-in">
            <span className="rc-eyebrow">RECRUIT</span>
            <h1 className="rc-h1">AIM <em>1기</em> 모집</h1>
            <p className="rc-lead">ERP연구회 산하 MIS·AI 스터디 — 2026 2학기 첫 기수.</p>
            <p className="rc-meta">게재 2026-07-27 · 담당 운영진</p>
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
              코딩 경험 불필요 — 주제는 코딩이 아니라 AI 활용. 산출물 = 본인 소유,
              기록은 <a href="/seminars/">세미나</a>·<a href="/projects/">프로젝트</a> 페이지에 축적.
            </p>
          </div>
        </section>

        <section className="rc-secs" aria-labelledby="rc-steps-h">
          <div className="rc-band-in">
            <span className="rc-kicker">활동 구성</span>
            <h2 className="rc-h2" id="rc-steps-h">2단계 — 개인 산출물, 팀 프로젝트</h2>
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
