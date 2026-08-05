// /recruit (IA 3차 2026-07-27) — AIM 기수 안내: 요강·활동 구성·참여 방법.
// + 운영 증빙(IA 4차 2026-08-05 — about 폐지로 이관): 실측 정량 + 출처(CountUp 문법 재사용).
// v3.1 개조(2026-08-05 저녁 — 디자인규칙 §6-2a, NEXTERS 실측 문법. 오너 "보수적으로 하지 말고 화려하게"):
//   B1 블랙 통계 밴드 — 운영 증빙을 검정 대면적 + 뷰포트급 흰 숫자 2×2(십자 헤어라인·CountUp)로 승격. 페이지당 1개.
//   B2 좌 고정 라벨 컬럼(버건디 ■ + 영문 라벨) / 우 콘텐츠 2단 골격 — 전 섹션. 폰 = 상하 적층.
//   B3 스크롤 연동 워드 스택 — 1차 프로젝트 5회 흐름, 활성만 진하게(opacity 전환만).
//   B4 헤더 = 버건디 대면적 철회(블랙 밴드와 경합) → 라이트 + 뷰포트급 타이포. 흑백 대비가 핵.
// 레퍼런스 픽 E1~E6 유지(E5 키비주얼 = 라이트 지면용 재채색 — 조준점 재사용 금지는 그대로).
// 정적 카피(FACTS·FIT·TIMELINE·STEPS) = data/recruit.js 이관(300줄 규격) — 카피 규칙 주석도 그쪽.
import { useEffect, useMemo } from 'react'
import { SiteNav, SiteFooter, REPO_URL, Arrow } from './shared.jsx'
import {
  RECRUIT, ACADEMIC_RULE, formatWindow,
  RECRUIT_FACTS, RECRUIT_FIT, RECRUIT_TIMELINE, RECRUIT_STEPS,
} from './data/recruit.js'
import { RECRUIT_FAQ } from './data/faq.js'
import { loadContent } from './content/loader.js'
import { CountUp, prefersReduced } from './home-motion.jsx'
import RecruitForm from './RecruitForm.jsx'

// 키비주얼(E5) — AI×MIS 교차(×)·겹침(두 원) 모티프. B4 라이트 헤더용 재채색(색 = CSS .rc-visual):
// 원 = 헤어라인 회색, × = 차콜(흑백 대비 핵 — 버건디는 마이크로로 후퇴). 조준점(원+십자 관통) 금지(오너 반려 2026-08-05).
function CrossVisual() {
  return (
    <svg className="rc-visual" viewBox="0 0 320 240" fill="none" aria-hidden="true" focusable="false">
      <circle cx="122" cy="120" r="92" strokeWidth="2.5" />
      <circle cx="198" cy="120" r="92" strokeWidth="2.5" />
      <path d="M142 102 L178 138 M178 102 L142 138" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// B2 좌 라벨 — 버건디 ■(CSS ::before) + 영문 라벨(§5 라벨 영문 정책). aria-hidden = 우측 h2가 접근성 제목.
function SecLabel({ en }) {
  return <div className="rc-label" aria-hidden="true">{en}</div>
}

// B3 스크롤 연동 하이라이트 — 뷰포트 중앙에 가장 가까운 워드만 활성(opacity 전환만).
// SSR·no-JS·reduced-motion = 전부 선명(live 클래스 없으면 감쇠 미적용) — 콘텐츠 항상 가독.
function useWordSpy() {
  useEffect(() => {
    const wrap = document.querySelector('.rc-words')
    if (!wrap || prefersReduced()) return
    const words = Array.from(wrap.querySelectorAll('.rc-word'))
    if (words.length === 0) return
    wrap.classList.add('live')
    let raf = 0
    const pick = () => {
      raf = 0
      const cy = window.innerHeight / 2
      let best = null
      let bd = Infinity
      for (const w of words) {
        const r = w.getBoundingClientRect()
        const d = Math.abs((r.top + r.bottom) / 2 - cy)
        if (d < bd) { bd = d; best = w }
      }
      words.forEach((w) => w.classList.toggle('on', w === best))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    pick()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])
}

// 운영 증빙 = B1 블랙 통계 밴드(페이지당 블랙 대면적 1개 — §1 다크 앵커 상한: 이 밴드 + 푸터만).
// 실측 정량만(콘텐츠 건수 = content/ 집계, 나머지 = 확인된 사실 — 참가비 0원 = 운영틀 확정값).
// 2×2 십자 헤어라인 + 뷰포트급 흰 숫자 + CountUp. 위치 = 요강 직후(E3 상향) 유지.
export function RecruitProof() {
  const articleCount = useMemo(() => loadContent('기사').length, [])
  const seminarCount = useMemo(() => loadContent('세미나').length, [])
  const proof = [
    { num: '1', label: '진행 중 스터디', src: 'ADsP 1기 — 진도 보드로 운영' },
    { num: '2', label: '라이브 실물', src: 'ADsP 진도 보드 · 이 사이트 (KWU-ERPCLUB 저장소)' },
    { num: String(articleCount + seminarCount), label: '게재된 기사·세미나', src: 'content/ 집계 (기사 ' + articleCount + ' · 세미나 ' + seminarCount + ')' },
    { num: '0', label: '참가비 (원)', src: '무료 도구 기준 — 유료 도구 = 개인 선택' },
  ]
  return (
    <section className="rc-secs rc-black" aria-labelledby="rc-proof-h">
      <div className="rc-band-in rc-grid">
        <SecLabel en="RECORD" />
        <div className="rc-body">
          <h2 className="rc-h2" id="rc-proof-h">운영 증빙</h2>
          <div className="stat-rows">
            {proof.map((p) => (
              <div className="stat-row" key={p.label}>
                <CountUp value={p.num} />
                <span className="stat-row-label">{p.label}</span>
                <span className="stat-row-src">{p.src}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Recruit() {
  useWordSpy()
  return (
    <>
      <SiteNav />
      <main className="rc-main">
        {/* B4 — 라이트 헤더(버건디 대면적 철회) + 뷰포트급 h1 + 대형 CTA(E6 상향) */}
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

        <RecruitProof />

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

        <section className="rc-secs" aria-labelledby="rc-steps-h">
          <div className="rc-band-in rc-grid">
            <SecLabel en="PROGRAM" />
            <div className="rc-body">
              <h2 className="rc-h2" id="rc-steps-h">1차 프로젝트 — 개인 · 2차 프로젝트 — 팀</h2>
              <p className="rc-sched-rule">{ACADEMIC_RULE}</p>
              <ol className="rc-steps">
                {RECRUIT_STEPS.map((s) => (
                  <li className="rc-step" key={s.title}>
                    <span className="rc-step-era">{s.era}</span>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                    {s.words && (
                      <ol className="rc-words">
                        {s.words.map((w) => <li className="rc-word" key={w}>{w}</li>)}
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
