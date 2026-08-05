// /recruit (IA 3차 2026-07-27) — AIM 기수 안내: 요강·하는 일·활동 구성·참여 방법.
// v3.2 조정(2026-08-05 오너 피드백 — v3.1 좌 라벨 2단 골격 유지):
//   ① 운영 증빙 블랙 밴드 제거(신생 스터디 = 증빙 무의미) → 같은 자리에 WHAT WE DO(이 스터디가 하는 일) 신설 — 활동 4카드.
//   ② 활동 구성 = 로드맵 단순화 — 회차 수 + 회차별 주제 한 줄(rc-rounds), 2차 팀 구간 = 버건디 포인트(rc-step-hl).
//      B3 스크롤 연동 워드 스택 폐지(세부 서사와 함께 제거).
//   ③ 타이포 한 단계 다운 — h1 상한 6.4rem → 3.8rem, h2·요강 값 축소(수치 = recruit.css). 본문 불변.
//   ④ 과녁/원 키비주얼(두 원+× 그래픽) 완전 삭제.
// 유지 = B2 좌 고정 라벨 컬럼(버건디 ■ + 영문 라벨) / 우 콘텐츠 2단 골격 · B4 라이트 헤더 · 대형 CTA(E6).
// 정적 카피(FACTS·DO·FIT·TIMELINE·STEPS) = data/recruit.js(300줄 규격) — 카피 규칙 주석도 그쪽.
import { SiteNav, SiteFooter, REPO_URL, Arrow } from './shared.jsx'
import {
  RECRUIT, ACADEMIC_RULE, formatWindow,
  RECRUIT_FACTS, RECRUIT_DO, RECRUIT_FIT, RECRUIT_TIMELINE, RECRUIT_STEPS,
} from './data/recruit.js'
import { RECRUIT_FAQ } from './data/faq.js'
import RecruitForm from './RecruitForm.jsx'

// B2 좌 라벨 — 버건디 ■(CSS ::before) + 영문 라벨(§5 라벨 영문 정책). aria-hidden = 우측 h2가 접근성 제목.
function SecLabel({ en }) {
  return <div className="rc-label" aria-hidden="true">{en}</div>
}

export default function Recruit() {
  return (
    <>
      <SiteNav />
      <main className="rc-main">
        {/* B4 — 라이트 헤더(키비주얼 없음 — v3.2 삭제) + h1(3rem대) + 대형 CTA(E6) */}
        <header className="rc-head">
          <div className="rc-head-in">
            <span className="rc-eyebrow">RECRUIT</span>
            <h1 className="rc-h1">{RECRUIT.study} <em>{RECRUIT.cohort}</em> 모집</h1>
            <p className="rc-lead">
              {RECRUIT.study} = ERP연구회 산하 스터디 · 경영학부를 대상으로 AI와 MIS를 함께 공부하기 위해 개설 ·
              전공 무관 모집 — 2026 {RECRUIT.term} 첫 기수.
            </p>
            <p className="rc-meta">게재 2026-07-27 · 개정 2026-08-05 · 담당 운영진</p>
            <div className="rc-head-cta">
              <a className="rc-cta-xl" href="#apply">신청하기 <Arrow /></a>
              <span className="rc-cta-note">접수 {formatWindow()}</span>
            </div>
          </div>
        </header>

        <section className="rc-secs" aria-labelledby="rc-facts">
          <div className="rc-band-in rc-grid">
            <SecLabel en="OVERVIEW" />
            <div className="rc-body">
              <h2 className="rc-h2" id="rc-facts">모집 요강</h2>
              <dl className="rc-facts">
                {RECRUIT_FACTS.map(([label, value]) => (
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
          </div>
        </section>

        {/* WHAT WE DO(v3.2) — 구 운영 증빙 블랙 밴드 자리. 활동 사실 서술 4카드(rc-fit 카드 문법 승계) */}
        <section className="rc-secs" aria-labelledby="rc-do-h">
          <div className="rc-band-in rc-grid">
            <SecLabel en="WHAT WE DO" />
            <div className="rc-body">
              <h2 className="rc-h2" id="rc-do-h">이 스터디가 하는 일</h2>
              <ul className="rc-fit rc-do">
                {RECRUIT_DO.map(([title, desc]) => (
                  <li key={title}>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="rc-secs" aria-labelledby="rc-fit-h">
          <div className="rc-band-in rc-grid">
            <SecLabel en="TARGET" />
            <div className="rc-body">
              <h2 className="rc-h2" id="rc-fit-h">이런 사람</h2>
              <ul className="rc-fit">
                {RECRUIT_FIT.map(([title, desc]) => (
                  <li key={title}>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="rc-secs" aria-labelledby="rc-timeline-h">
          <div className="rc-band-in rc-grid">
            <SecLabel en="SCHEDULE" />
            <div className="rc-body">
              <h2 className="rc-h2" id="rc-timeline-h">접수부터 활동 시작까지</h2>
              <ol className="rc-steps">
                {RECRUIT_TIMELINE.map((t) => (
                  <li className="rc-step" key={t.title}>
                    <span className="rc-step-era">{t.era}</span>
                    <h3>{t.title}</h3>
                    <p>{t.desc}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* 활동 구성 = 로드맵(v3.2 단순화) — 세로 레일 재사용, 회차별 주제 한 줄(rc-rounds), 2차 = 버건디 포인트 */}
        <section className="rc-secs" aria-labelledby="rc-steps-h">
          <div className="rc-band-in rc-grid">
            <SecLabel en="PROGRAM" />
            <div className="rc-body">
              <h2 className="rc-h2" id="rc-steps-h">1차 프로젝트 — 개인 · 2차 프로젝트 — 팀</h2>
              <p className="rc-sched-rule">{ACADEMIC_RULE}</p>
              <ol className="rc-steps">
                {RECRUIT_STEPS.map((s) => (
                  <li className={s.hl ? 'rc-step rc-step-hl' : 'rc-step'} key={s.title}>
                    <span className="rc-step-era">{s.era}</span>
                    <h3>{s.title}</h3>
                    {s.desc && <p>{s.desc}</p>}
                    {s.rounds && (
                      <ol className="rc-rounds">
                        {s.rounds.map((r) => <li key={r}>{r}</li>)}
                      </ol>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* FAQ = NEXTERS 문법 그대로 — 좌 라벨 / 우 아코디언 */}
        <section className="rc-secs" aria-labelledby="rc-faq-h">
          <div className="rc-band-in rc-grid">
            <SecLabel en="FAQ" />
            <div className="rc-body">
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
          </div>
        </section>

        <section className="rc-secs" id="apply" aria-labelledby="rc-apply-h">
          <div className="rc-band-in rc-grid">
            <SecLabel en="APPLY" />
            <div className="rc-body">
              <h2 className="rc-h2" id="rc-apply-h">신청 폼 — 이 페이지에서 제출</h2>
              <RecruitForm />
            </div>
          </div>
        </section>

        <section className="rc-secs" aria-labelledby="rc-join-h">
          <div className="rc-band-in rc-grid">
            <SecLabel en="CONTACT" />
            <div className="rc-body">
              <h2 className="rc-h2" id="rc-join-h">문의 — 스터디 단톡방</h2>
              <div className="rc-actions">
                <a className="btn-2nd" href={REPO_URL}>GitHub 저장소</a>
                <a className="proof-link" href="/#faq">자주 묻는 질문 <Arrow /></a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
