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
// 2026-08-20: 본문 섹션 6종을 recruit-parts.jsx로 분리(300줄 규격) — 이 파일 = 골격 + 스크롤 인터랙션 훅.
import { useEffect } from 'react'
import { SiteNav, SiteFooter, PageHead, REPO_URL, Arrow } from './shared.jsx'
import { RECRUIT, formatWindow } from './data/recruit.js'
import {
  Section, FactsSection, GoalSection, FitSection, RoadmapSection, FaqSection, ContactSection,
} from './recruit-parts.jsx'
import RecruitForm from './RecruitForm.jsx'

// (구 SecLabel 좌 라벨 레일 = 4차 개편 2026-08-06 폐지 — 피드백 "왼쪽 네모들 다 삭제". 섹션 구분 = 배경 면 교대.)

// ── v3.3 스크롤 인터랙션(지역 구현 — App.jsx·home-motion.jsx 수정 금지 규칙에 따라 문법만 복제) ──
const prefersReduced = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// AIM 1기 로드맵 스파이 + 진행선(오너 2026-08-07 2차 — "인터랙티브·화려하게").
// ① 스파이: 뷰포트 중앙 최근접 노드만 활성(.on) — 활성 회차 카드는 확대·버건디 링(CSS).
// ② 진행선: 스크롤이 로드맵을 지나는 비율만큼 레일에 버건디 채움 선(.rc-rm-fill 높이)을 채운다 — "여기까지 왔다".
// 게이트 = <html>.rc-spy-js — reduced-motion·no-JS면 전부 선명·채움 0(기본 레일만).
function useRoadmapFlow() {
  useEffect(() => {
    const list = document.querySelector('.rc-rm')
    if (!list || prefersReduced()) return
    const items = Array.from(list.querySelectorAll(':scope > li'))
    const fill = list.querySelector('.rc-rm-fill')
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
      items.forEach((el) => el.classList.toggle('on', el === best))
      if (fill) {
        const lr = list.getBoundingClientRect()
        const p = Math.min(1, Math.max(0, (cy - lr.top) / lr.height))
        fill.style.height = `${(p * 100).toFixed(2)}%`
      }
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
  useRoadmapFlow()
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
              sub={`경영학부 중심, 비전공자도 환영합니다. 2026 ${RECRUIT.term} 첫 기수를 모집합니다.`}
            >
              {/* 오너 2026-08-07: 세로 배치 — 대형 CTA 정중앙, 접수기간은 버튼 아래 줄 */}
              <div className="rc-head-cta">
                <a className="rc-cta-xl" href="#apply">신청하기 <Arrow /></a>
                <span className="rc-cta-note">접수 {formatWindow()}</span>
              </div>
            </PageHead>
          </div>
        </div>

        <FactsSection />
        <GoalSection />
        <FitSection />

        <RoadmapSection />
        <FaqSection />

        <Section id="apply" labelledBy="rc-apply-h">
          <h2 className="rc-h2" id="rc-apply-h">신청 폼</h2>
          <RecruitForm />
        </Section>

        <ContactSection repoUrl={REPO_URL} />
        {/* 플로팅 신청 CTA(오너 2026-08-07) — 우하단 고정·둥둥 부유, 누르면 언제든 폼으로. 폼 도착 시 숨김(useFloatCta) */}
        <a className="rc-float" href="#apply" aria-label="신청 폼으로 이동">신청하기 <Arrow /></a>
      </main>
      <SiteFooter />
    </>
  )
}
