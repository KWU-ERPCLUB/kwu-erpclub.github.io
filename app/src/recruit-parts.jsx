// /recruit 본문 섹션 조각 — Recruit.jsx 300줄 규격 초과로 분리(2026-08-20).
// Recruit.jsx = 페이지 골격 + 스크롤 인터랙션 훅 / 이 파일 = 정적 데이터를 렌더하는 섹션 6종.
// 마크업·클래스는 그대로 옮겼다(화면 변화 0). 카피·수치 = data/recruit.js·data/faq.js가 원천.
import { Arrow } from './shared.jsx'
import {
  ACADEMIC_RULE, CONTACT, CONTACT_MAILTO, COHORT_LABEL,
  RECRUIT_FACTS, RECRUIT_DO, RECRUIT_FIT, AIM_ROADMAP,
  RECRUIT_SHOWCASE, SHOWCASE_LEAD,
} from './data/recruit.js'
import { RECRUIT_FAQ } from './data/faq.js'

// 섹션 셸 — 배경 면 교대(.rc-secs:nth-of-type(even))가 구분을 담당하므로 순서가 곧 배경이다.
function Section({ id, labelledBy, children }) {
  return (
    <section className="rc-secs" id={id} aria-labelledby={labelledBy}>
      <div className="rc-band-in">
        <div className="rc-body">{children}</div>
      </div>
    </section>
  )
}

// 모집 요강 — 값 = "핵심 — 부연" 구조 분리 렌더(핵심 = 버건디 강조 / 부연 = 다음 줄 회색).
export function FactsSection() {
  return (
    <Section labelledBy="rc-facts">
      <h2 className="rc-h2" id="rc-facts">모집 요강</h2>
      <dl className="rc-facts">
        {RECRUIT_FACTS.map(([label, value]) => {
          const [core, ...rest] = value.split(' — ')
          return (
            <div className="rc-fact" key={label}>
              <dt>{label}</dt>
              <dd>
                <strong>{core}</strong>
                {rest.length > 0 && <span className="rc-fact-sub">{rest.join(' ')}</span>}
              </dd>
            </div>
          )
        })}
      </dl>
    </Section>
  )
}

// WHAT WE DO(v3.2) — 구 운영 증빙 블랙 밴드 자리. 활동 사실 서술 4카드(rc-fit 카드 문법 승계).
export function DoSection() {
  return (
    <Section labelledBy="rc-do-h">
      <h2 className="rc-h2" id="rc-do-h">이 스터디가 하는 일</h2>
      <ul className="rc-fit rc-do">
        {RECRUIT_DO.map(([title, desc]) => (
          <li key={title}>
            <h3>{title}</h3>
            <p>{desc}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}

// SHOWCASE(2026-08-05 2차) — 실물 3건. 라벨 "만든 것"(검수 2026-08-14 — 세미나 자료 포함 목록).
export function ShowcaseSection() {
  return (
    <Section labelledBy="rc-show-h">
      <h2 className="rc-h2" id="rc-show-h">만든 것</h2>
      <p className="rc-sched-rule">{SHOWCASE_LEAD}</p>
      <ul className="rc-fit rc-show">
        {RECRUIT_SHOWCASE.map(({ name, core, sub, href, img }) => (
          <li key={name}>
            <a className="rc-show-link" href={href}>
              <span className="rc-show-thumb">
                <img src={img} alt="" loading="lazy" />
              </span>
              <h3>{name} <Arrow /></h3>
            </a>
            <p className="rc-show-core">{core}</p>
            <p className="rc-show-sub">{sub}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}

// 참여 조건(2026-08-19 오너 톤 완화) — 구 "이런 분을 찾습니다" = 선발 문법이라 문턱이 높게 읽혔다.
export function FitSection() {
  return (
    <Section labelledBy="rc-fit-h">
      <h2 className="rc-h2" id="rc-fit-h">이 정도면 충분합니다</h2>
      <ul className="rc-who">
        {RECRUIT_FIT.map(([title, desc]) => (
          <li key={title}>
            <span className="rc-who-check" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6.5L4.8 9.3L10 3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="rc-who-t">{title}</span>
            <span className="rc-who-d">{desc}</span>
          </li>
        ))}
      </ul>
    </Section>
  )
}

// AIM 1기 로드맵 — 학사일정 기반 회차 + 페이즈 헤더. 인터랙션(스파이·진행선) = Recruit.jsx useRoadmapFlow.
// 원천 = AIM_ROADMAP(data/aim-roadmap.js 파생 — 로드맵 개정은 그 파일 1곳).
export function RoadmapSection() {
  return (
    <Section labelledBy="rc-steps-h">
      <h2 className="rc-h2" id="rc-steps-h">{COHORT_LABEL} 로드맵</h2>
      <p className="rc-sched-rule">주 1회, 회차가 곧 진행 단위. {ACADEMIC_RULE}.</p>
      <ol className="rc-rm">
        <span className="rc-rm-fill" aria-hidden="true" />
        {AIM_ROADMAP.map((n) => n.type === 'phase' ? (
          <li className={n.hl ? 'rc-rm-phase rc-rm-hl' : 'rc-rm-phase'} key={n.라벨}>
            <span className="rc-rm-when">{n.기간}</span>
            <h3 className="rc-phase-t">{n.라벨}</h3>
            <p className="rc-rm-desc">{n.설명}</p>
          </li>
        ) : (
          <li className="rc-rm-s" key={n.no}>
            <div className="rc-rm-card">
              <div className="rc-rm-top">
                <span className="rc-rm-no">{n.no}</span>
                <div className="rc-rm-head">
                  <span className="rc-rm-meta">{n.주}{n.태그 && <em className="rc-rm-tag">{n.태그}</em>}</span>
                  <span className="rc-rm-topic">{n.주제}</span>
                </div>
              </div>
              <p className="rc-rm-learn">{n.배움}</p>
              <ul className="rc-rm-notes">
                {n.세부.map((d) => <li key={d}>{d}</li>)}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}

// FAQ 서브셋 — 카드 면 아코디언(홈 FAQ 동형) + 전체 FAQ 링크.
export function FaqSection() {
  return (
    <Section labelledBy="rc-faq-h">
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
    </Section>
  )
}

// 문의 — 채널 = CONTACT 상수 파생(가운데 정렬, 오너 2026-08-07).
export function ContactSection({ repoUrl }) {
  return (
    <Section labelledBy="rc-join-h">
      <h2 className="rc-h2" id="rc-join-h">문의</h2>
      <div className="rc-actions rc-actions-center">
        <a className="btn-2nd" href={CONTACT_MAILTO}>{CONTACT.email}</a>
        <a className="btn-2nd" href={repoUrl}>GitHub 저장소</a>
      </div>
    </Section>
  )
}

export { Section }
