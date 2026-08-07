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
  RECRUIT, ACADEMIC_RULE, formatWindow, CONTACT, CONTACT_MAILTO, COHORT_LABEL,
  RECRUIT_FACTS, RECRUIT_DO, RECRUIT_FIT, RECRUIT_STEPS,
  RECRUIT_SHOWCASE, SHOWCASE_LEAD,
} from './data/recruit.js'
import { RECRUIT_FAQ } from './data/faq.js'
import RecruitForm from './RecruitForm.jsx'

// (구 SecLabel 좌 라벨 레일 = 4차 개편 2026-08-06 폐지 — 피드백 "왼쪽 네모들 다 삭제". 섹션 구분 = 배경 면 교대.)

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

// 플로팅 신청 CTA(오너 2026-08-07) — 우하단 고정, 폼(#apply)이 화면에 들어오면 숨김(도착했으니 역할 종료).
// IO 미지원·no-JS = 항상 표시(정적 폴백).
function useFloatCta() {
  useEffect(() => {
    const btn = document.querySelector('.rc-float')
    const form = document.getElementById('apply')
    if (!btn || !form || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => {
      btn.classList.toggle('rc-float-hide', e.isIntersecting)
    })
    io.observe(form)
    return () => io.disconnect()
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
  useFloatCta()
  return (
    <>
      <SiteNav />
      <main id="main" className="rc-main">
        {/* B4 — 라이트 헤더(키비주얼 없음 — v3.2 삭제). 골격 = 공용 PageHead(3차 통일), 대형 CTA(E6) = children */}
        <div className="rc-head">
          <div className="rc-head-in">
            <PageHead
              label="RECRUIT"
              title={<>{RECRUIT.study} <em>{RECRUIT.cohort}</em> 모집</>}
              sub={`${RECRUIT.study}은 ERP연구회 산하 MIS·AI 스터디입니다 — 경영학부 중심·전공 무관, 2026 ${RECRUIT.term} 첫 기수를 모집합니다.`}
            >
              {/* 오너 2026-08-07: 세로 배치 — 대형 CTA 정중앙, 접수기간은 버튼 아래 줄 */}
              <div className="rc-head-cta">
                <a className="rc-cta-xl" href="#apply">신청하기 <Arrow /></a>
                <span className="rc-cta-note">접수 {formatWindow()}</span>
              </div>
            </PageHead>
          </div>
        </div>

        <section className="rc-secs" aria-labelledby="rc-facts">
          <div className="rc-band-in">
            <div className="rc-body">
              <h2 className="rc-h2" id="rc-facts">모집 요강</h2>
              {/* 오너 2026-08-07: 값 = "핵심 — 부연" 구조 분리 렌더 — 핵심(버건디 강조) + 부연(회색). 콜아웃(산출물 소유) 삭제 */}
              <dl className="rc-facts">
                {RECRUIT_FACTS.map(([label, value]) => {
                  const [core, ...rest] = value.split(' — ')
                  return (
                    <div className="rc-fact" key={label}>
                      <dt>{label}</dt>
                      <dd>
                        <strong>{core}</strong>
                        {rest.length > 0 && <span className="rc-fact-sub"> — {rest.join(' — ')}</span>}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </div>
          </div>
        </section>

        {/* WHAT WE DO(v3.2) — 구 운영 증빙 블랙 밴드 자리. 활동 사실 서술 4카드(rc-fit 카드 문법 승계) */}
        <section className="rc-secs" aria-labelledby="rc-do-h">
          <div className="rc-band-in">
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
          <div className="rc-band-in">
            <div className="rc-body">
              <h2 className="rc-h2" id="rc-show-h">실물</h2>
              <p className="rc-sched-rule">{SHOWCASE_LEAD}</p>
              {/* 오너 2026-08-07: 제목 가운데 정렬 + 문안 2단(핵심 강조 한 문장 / 회색 보조 한 줄) */}
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
            </div>
          </div>
        </section>

        {/* WHO SHOULD APPLY(오너 2026-08-07 — 구 '이런 사람': 현업 모집요강 문법 영문 키워드 + 가운데 정렬) */}
        <section className="rc-secs" aria-labelledby="rc-fit-h">
          <div className="rc-band-in">
            <div className="rc-body">
              <h2 className="rc-h2" id="rc-fit-h">WHO SHOULD APPLY</h2>
              <ul className="rc-fit rc-who">
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

        {/* (「접수부터 활동 시작까지」 타임라인 = 오너 삭제 2026-08-07) */}

        {/* AIM 1기 로드맵(오너 2026-08-07 개편) — 차시 단위 노드: 주제 강조 + 세부 한 줄, 페이즈 헤더 대형 */}
        <section className="rc-secs" aria-labelledby="rc-steps-h">
          <div className="rc-band-in">
            <div className="rc-body">
              <h2 className="rc-h2" id="rc-steps-h">{COHORT_LABEL} 로드맵</h2>
              <p className="rc-sched-rule">{ACADEMIC_RULE}</p>
              <ol className="rc-steps rc-steps-spy">
                {RECRUIT_STEPS.map((s) => (
                  <li className={s.hl ? 'rc-step rc-step-hl' : 'rc-step'} key={s.title}>
                    <span className="rc-step-era">{s.era}</span>
                    <h3 className="rc-phase-t">{s.title}</h3>
                    {s.desc && <p>{s.desc}</p>}
                    {s.rounds && (
                      <ol className="rc-rounds">
                        {s.rounds.map((r) => (
                          <li key={r.t}>
                            <span className="rc-round-t">{r.t}</span>
                            <span className="rc-round-d">{r.d}</span>
                          </li>
                        ))}
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
          <div className="rc-band-in">
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
          <div className="rc-band-in">
            <div className="rc-body">
              <h2 className="rc-h2" id="rc-apply-h">신청 폼 — 이 페이지에서 제출</h2>
              <RecruitForm />
            </div>
          </div>
        </section>

        <section className="rc-secs" aria-labelledby="rc-join-h">
          <div className="rc-band-in">
            <div className="rc-body">
              <h2 className="rc-h2" id="rc-join-h">문의</h2>
              {/* 문의 채널 = CONTACT 상수 파생. 오너 2026-08-07: FAQ 링크 제거·가운데 정렬 */}
              <div className="rc-actions rc-actions-center">
                <a className="btn-2nd" href={CONTACT_MAILTO}>{CONTACT.email}</a>
                <a className="btn-2nd" href={REPO_URL}>GitHub 저장소</a>
              </div>
            </div>
          </div>
        </section>
        {/* 플로팅 신청 CTA(오너 2026-08-07) — 우하단 고정·둥둥 부유, 누르면 언제든 폼으로. 폼 도착 시 숨김(useFloatCta) */}
        <a className="rc-float" href="#apply" aria-label="신청 폼으로 이동">신청하기 <Arrow /></a>
      </main>
      <SiteFooter />
    </>
  )
}
