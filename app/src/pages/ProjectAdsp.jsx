// ADsP 스터디 1기 — 인터랙티브 상세(파일럿). spec = erp-club/docs/specs/2026-08-12-adsp-인터랙티브-개편.md
// 구조 = 스티키 로컬 나브 + 시간 순 챕터 6 + 좌 진행선. 텍스트 규칙 §4: 챕터당 문단 ≤2·핵심구만 볼드.
// 수치 = data/project-adsp-data.js 단일원천(전부 실측·개인 단위 없음).
import { useEffect } from 'react'
import { SiteNav, SiteFooter, Arrow } from '../shared.jsx'
import { CountUp, useItemReveal, prefersReduced } from '../home-motion.jsx'
import { WeeklyChart, MetricTabs, ToolCarousel } from './project-adsp-parts.jsx'
import { HERO_STATS, OPS_FEATURES, CLOSE_STATS, NEXT_ITEMS, CHAPTERS, BOARD_URL } from '../data/project-adsp-data.js'

// 챕터 스파이 — 뷰포트 중앙이 속한 챕터를 로컬 나브·진행선에 반영(recruit useRoadmapFlow 문법).
function useChapterSpy() {
  useEffect(() => {
    if (prefersReduced()) return undefined
    const secs = Array.from(document.querySelectorAll('.pa-ch'))
    const links = Array.from(document.querySelectorAll('.pa-nav-links a'))
    if (secs.length === 0) return undefined
    let raf = 0
    const pick = () => {
      raf = 0
      const cy = window.innerHeight / 2
      let cur = null
      for (const s of secs) {
        const r = s.getBoundingClientRect()
        if (r.top <= cy && r.bottom > cy) cur = s.id
      }
      links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === `#${cur}`))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick) }
    window.addEventListener('scroll', onScroll, { passive: true })
    pick()
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])
}

// 챕터 헤드(A6) — 날짜 눈썹 + 대형 결정문.
function ChapterHead({ date, title, kicker }) {
  return (
    <header className="pa-ch-head pa-rv">
      <span className="pa-ch-date">{date}{kicker ? ` · ${kicker}` : ''}</span>
      <h2 className="pa-ch-title">{title}</h2>
    </header>
  )
}

export default function ProjectAdsp() {
  useChapterSpy()
  useItemReveal('.pa-rv')
  // 리빌 JS 게이트 — 부여 시에만 초기 은닉 CSS 활성(no-JS·reduced-motion = 즉시 표시)
  useEffect(() => {
    if (prefersReduced()) return undefined
    document.documentElement.classList.add('pa-js')
    return () => document.documentElement.classList.remove('pa-js')
  }, [])
  return (
    <>
      <SiteNav />
      {/* 스티키 로컬 나브(A2) — 챕터 앵커 + 보드 CTA */}
      <nav className="pa-nav" aria-label="ADsP 1기 챕터">
        <div className="pa-nav-in">
          <span className="pa-nav-title">ADsP 스터디 1기</span>
          <div className="pa-nav-links">
            {CHAPTERS.map((c) => <a key={c.id} href={`#${c.id}`}>{c.label}</a>)}
          </div>
          <a className="pa-nav-cta" href={BOARD_URL} target="_blank" rel="noreferrer">보드 보기</a>
        </div>
      </nav>

      <main id="main" className="pa-main">
        {/* 1 히어로 — 한 문장 + 수치 카운트업 3 + 실물 비주얼 */}
        <section className="pa-hero">
          <span className="pa-hero-label">PROJECT · 2026-06-26 ~ 08-08</span>
          <h1 className="pa-hero-title">스터디를 <em>데이터</em>로 운영했다.</h1>
          <p className="pa-hero-sub">
            비전공 8명의 ADsP 자격증 스터디 — 진도 보드를 직접 만들어 6주를 운영하고,
            숫자가 남긴 것을 그대로 공개합니다.
          </p>
          <div className="pa-hero-stats">
            {HERO_STATS.map((s) => (
              <div className="pa-hstat" key={s.label}>
                <CountUp value={s.value} />
                <span className="pa-hstat-label">{s.label}</span>
                <span className="pa-hstat-src">{s.src}</span>
              </div>
            ))}
          </div>
          <img className="pa-hero-shot pa-rv" src="/img/projects/adsp/home-now.png"
            alt="ADsP 진도 보드 대시보드 실측 화면" />
        </section>

        {/* 2 시작 — 만들게 된 계기 */}
        <section className="pa-ch" id="start">
          <ChapterHead date="06-26" title="흩어진 공부를 한 화면에." />
          <p className="pa-lead pa-center pa-rv">
            온라인으로 진행하는 스터디 — 8명의 <strong>공부량과 스타일이 제각각</strong>이라
            한 번에 관리할 방법이 없었다.
          </p>
          <div className="pa-decision pa-decision-center pa-rv">
            <span className="pa-dec-label">목적</span>
            <p>
              각자의 진행을 <strong>한눈에 확인</strong>하고, 자료·퀴즈·기출까지
              <strong> 한 대시보드에서</strong> 해결하는 종합 학습 대시보드를 만든다.
            </p>
          </div>
        </section>

        {/* 3 도구 — MVP 캐러셀 */}
        <section className="pa-ch pa-ch-wash" id="tool">
          <ChapterHead date="06-28" title="작게 만들어 바로 배포했다." />
          <p className="pa-lead pa-center pa-rv">
            첫 판은 <strong>MVP</strong> — 진도 체크와 현황만 담아 이틀 만에 배포하고,
            이후 6주 내내 <strong>피드백으로 고도화</strong>했다. 가입 절차 없이 이름+PIN 입장 —
            8명에게 가입을 요구하면 그 자체가 이탈 지점이 된다.
          </p>
          <div className="pa-rv"><ToolCarousel /></div>
        </section>

        {/* 4 운영 — 피처 그리드 */}
        <section className="pa-ch" id="ops">
          <ChapterHead date="7월" title="운영을 감으로 하지 않았다." />
          <div className="pa-feat-grid">
            {OPS_FEATURES.map((f) => (
              <div className="pa-feat pa-rv" key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5 지표 — pill 탭 + 차트 */}
        <section className="pa-ch pa-ch-wash" id="data">
          <ChapterHead date="08-08" title="숫자는 이렇게 남았다." />
          <p className="pa-lead pa-center pa-rv">
            같은 &lsquo;정답률&rsquo;이라도 무엇을 재느냐에 따라 갈린다 —
            <strong> 지표 4종을 분리 정의하고 혼용을 금지</strong>했다. 탭을 눌러 확인해 보세요.
          </p>
          <div className="pa-rv"><MetricTabs /></div>
          <div className="pa-rv"><WeeklyChart /></div>
        </section>

        {/* 7 마감·다음 */}
        <section className="pa-ch" id="close">
          <ChapterHead date="08-10" title="성공담 대신, 고칠 목록을 남겼다." />
          <div className="pa-close-grid">
            {CLOSE_STATS.map((s) => (
              <div className="pa-cstat pa-rv" key={s.label}>
                <span className="pa-cstat-num">{s.value}</span>
                <span className="pa-cstat-label">{s.label}</span>
                <span className="pa-cstat-note">{s.note}</span>
              </div>
            ))}
          </div>
          <div className="pa-next pa-rv">
            <h3 className="pa-sub-h">2기가 고칠 것 — 전부 데이터·피드백 근거</h3>
            <ol>{NEXT_ITEMS.map((t) => <li key={t}>{t}</li>)}</ol>
            <p className="pa-next-note">실제 시험 성적과의 대조는 합격 발표(08-28) 후 이 페이지에 보강한다.</p>
          </div>
          {/* 목적 ① 착지 — "당신 차례" */}
          <div className="pa-cta-block pa-rv">
            <h3 className="pa-cta-title">이 과정을 <em>당신의 프로젝트</em>로.</h3>
            <p>기획은 사람이, 구현은 AI가 — 필요한 도구를 직접 만들어 운영하는 법을 AIM에서 같이 합니다.</p>
            <div className="pa-cta-row">
              <a className="btn-dark" href="/recruit/">AIM 1기 모집 보기 <Arrow /></a>
              <a className="btn-2nd" href={BOARD_URL} target="_blank" rel="noreferrer">보드 직접 보기 <Arrow /></a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
