// /recruit (IA 3차 2026-07-27) — AIM 기수 안내: 요강·하는 일·활동 구성·참여 방법.
// v3.2 조정(2026-08-05 오너 피드백 — v3.1 좌 라벨 2단 골격 유지):
//   ① 운영 증빙 블랙 밴드 제거(신생 스터디 = 증빙 무의미) → 같은 자리에 WHAT WE DO(이 스터디가 하는 일) 신설 — 활동 4카드.
//   ② 활동 구성 = 로드맵 단순화 — 회차 수 + 회차별 주제 한 줄(rc-rounds), 2차 팀 구간 = 버건디 포인트(rc-step-hl).
//      B3 스크롤 연동 워드 스택 폐지(세부 서사와 함께 제거).
//   ③ 타이포 한 단계 다운 — h1 상한 6.4rem → 3.8rem, h2·요강 값 축소(수치 = recruit.css). 본문 불변.
//   ④ 과녁/원 키비주얼(두 원+× 그래픽) 완전 삭제.
// 유지 = B2 좌 고정 라벨 컬럼(버건디 ■ + 영문 라벨) / 우 콘텐츠 2단 골격 · B4 라이트 헤더 · 대형 CTA(E6).
// v3.3(2026-08-05 오너 "화려하던 로직 복원") — 스크롤 인터랙션 지역 구현(콘텐츠·타이포·섹션 구성 무변경):
//   ① PROGRAM 로드맵 스파이(useStepSpy — App.jsx useWordSpy 문법 복제) ② 섹션 진입 스태거 리빌(useSectionReveal —
//   home.css .rv 문법 복제, IO 1회 발화) ③ WHAT WE DO 카드 리빌 스태거+호버 리프트(CSS).
//   전 인터랙션 = JS 클래스 게이트(rc-js·rc-spy-js) → no-JS·reduced-motion = 전부 선명·정지.
// v3.4(2026-08-05 2차) — SHOWCASE 섹션 신설: WHAT WE DO 직후, 스터디가 만든 실물 3건(보드·이 사이트·세미나 자료).
//   근거 = "챗GPT면 충분한데 왜 스터디" 반론에 텍스트 카드만 있고 증거가 0이던 문제. 카드 문법 = rc-fit 승계.
// 정적 카피(FACTS·DO·SHOWCASE·FIT·TIMELINE·STEPS) = data/recruit.js(300줄 규격) — 카피 규칙 주석도 그쪽.
import { useEffect } from 'react'
import { SiteNav, SiteFooter, PageHead, REPO_URL, Arrow } from './shared.jsx'
import {
  RECRUIT, ACADEMIC_RULE, formatWindow, CONTACT, KAKAO_PENDING, hasKakaoChat,
  RECRUIT_FACTS, RECRUIT_DO, RECRUIT_FIT, RECRUIT_TIMELINE, RECRUIT_STEPS,
  RECRUIT_SHOWCASE, SHOWCASE_LEAD,
} from './data/recruit.js'
import { RECRUIT_FAQ } from './data/faq.js'
import RecruitForm from './RecruitForm.jsx'

// B2 좌 라벨 — 버건디 ■(CSS ::before) + 영문 라벨(§5 라벨 영문 정책). aria-hidden = 우측 h2가 접근성 제목.
function SecLabel({ en }) {
  return <div className="rc-label" aria-hidden="true">{en}</div>
}

// ── v3.3 스크롤 인터랙션(지역 구현 — App.jsx·home-motion.jsx 수정 금지 규칙에 따라 문법만 복제) ──
const prefersReduced = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// PROGRAM 로드맵 스파이 — 뷰포트 중앙 최근접 회차/단계만 활성(.on)·나머지 감쇠(useWordSpy rAF 문법 복제).
// 활성이 회차(rc-rounds li)면 부모 단계도 함께 활성(중첩 opacity 이중 감쇠 방지).
// 게이트 = <html>.rc-spy-js — reduced-motion·no-JS면 클래스 자체가 없어 전부 선명.
function useStepSpy() {
  useEffect(() => {
    const list = document.querySelector('.rc-steps-spy')
    if (!list || prefersReduced()) return
    const items = Array.from(list.querySelectorAll(':scope > li, .rc-rounds > li'))
    if (items.length === 0) return
    document.documentElement.classList.add('rc-spy-js')
    let raf = 0
    const pick = () => {
      raf = 0
      const cy = window.innerHeight / 2
      let best = null
      let bd = Infinity
      for (const el of items) {
        const r = el.getBoundingClientRect()
        const d = Math.abs((r.top + r.bottom) / 2 - cy)
        if (d < bd) { bd = d; best = el }
      }
      const parent = best && best.closest('.rc-steps-spy > li')
      items.forEach((el) => el.classList.toggle('on', el === best || el === parent))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    pick()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
      document.documentElement.classList.remove('rc-spy-js')
    }
  }, [])
}

// 섹션 진입 스태거 리빌 — IO 1회 발화(.rc-in 부여 후 unobserve — 무한 반복 없음). 스태거 = CSS nth-child 지연.
// 게이트 = <html>.rc-js — reduced-motion·no-JS면 정적 상태 그대로(전부 선명).
function useSectionReveal() {
  useEffect(() => {
    if (prefersReduced()) return
    const secs = Array.from(document.querySelectorAll('.rc-head, .rc-secs'))
    if (secs.length === 0) return
    document.documentElement.classList.add('rc-js')
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('rc-in'); io.unobserve(e.target) }
      })
    }, { rootMargin: '0px 0px -8% 0px' })
    secs.forEach((s) => io.observe(s))
    return () => { io.disconnect(); document.documentElement.classList.remove('rc-js') }
  }, [])
}

export default function Recruit() {
  useStepSpy()
  useSectionReveal()
  return (
    <>
      <SiteNav />
      <main className="rc-main">
        {/* B4 — 라이트 헤더(키비주얼 없음 — v3.2 삭제). 골격 = 공용 PageHead(3차 통일), 대형 CTA(E6) = children */}
        <div className="rc-head">
          <div className="rc-head-in">
            <PageHead
              label="RECRUIT"
              title={<>{RECRUIT.study} <em>{RECRUIT.cohort}</em> 모집</>}
              sub={`${RECRUIT.study} = ERP연구회 산하 스터디 · 경영학부를 대상으로 AI와 MIS를 함께 공부하기 위해 개설 · 전공 무관 모집 — 2026 ${RECRUIT.term} 첫 기수.`}
              meta="게재 2026-07-27 · 개정 2026-08-05 · 담당 운영진"
            >
              <div className="rc-head-cta">
                <a className="rc-cta-xl" href="#apply">신청하기 <Arrow /></a>
                <span className="rc-cta-note">접수 {formatWindow()}</span>
              </div>
            </PageHead>
          </div>
        </div>

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

        {/* SHOWCASE(2026-08-05 2차) — WHAT WE DO 직후 실물 증거 3건. 카드 문법 = rc-fit 승계(+썸네일 rc-show).
            카피·링크·이미지 = data/recruit.js RECRUIT_SHOWCASE(사실 서술만). 외부 링크 1건 = 새 창 없이 동일 탭. */}
        <section className="rc-secs" aria-labelledby="rc-show-h">
          <div className="rc-band-in rc-grid">
            <SecLabel en="SHOWCASE" />
            <div className="rc-body">
              <h2 className="rc-h2" id="rc-show-h">실물</h2>
              <p className="rc-sched-rule">{SHOWCASE_LEAD}</p>
              <ul className="rc-fit rc-show">
                {RECRUIT_SHOWCASE.map(({ name, fact, href, img }) => (
                  <li key={name}>
                    <a className="rc-show-link" href={href}>
                      <span className="rc-show-thumb">
                        <img src={img} alt="" loading="lazy" />
                      </span>
                      <h3>{name} <Arrow /></h3>
                    </a>
                    <p>{fact}</p>
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
              <ol className="rc-steps rc-steps-spy">
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
              {/* 단톡방 = CONTACT 상수 파생. URL 미제공이면 링크 대신 안내 문구(깨진 링크 금지) */}
              <div className="rc-actions">
                {hasKakaoChat()
                  ? <a className="btn-2nd" href={CONTACT.kakaoOpenChatUrl}>스터디 단톡방</a>
                  : <span className="rc-cta-note">{KAKAO_PENDING}</span>}
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
