// 메인(/) = 소개 간판 (역할 3차 개정 2026-07-11: 외부 방문자용 — 정체성·방향·실물·운영 공개를 한눈에)
// SPEC=site/SPEC.md (메인 개편 v2). 콘텐츠=Hack Club 노선(투명 운영), 로직=넥스터즈 참조(캐러셀·FAQ·리빌)
// 문안 원천: erp-club/docs/문안-메인.md. 성과 과시 금지(owner) — 수치는 검증된 것만, 출처 필수
import { useEffect, useRef } from 'react'
import { Arrow, SiteNav, SiteFooter, REPO_URL } from './shared.jsx'

const ADSP_BOARD_URL = 'https://erpstudy.vercel.app'

const DIRECTION = [
  ['live', '진행중', 'ADsP 1기 — 진도 보드로 운영 중'],
  ['prep', '모집 준비', 'MIS·AI 스터디 1기 — 스터디명·인원 확정 대기'],
  ['planned', '예정', '1기 운영 — AI 활용 연구, 결과물 제작·배포'],
  ['planned', '예정', '심화 — SAP 트랙 · 공모전 출품'],
]

const WORKS = [
  {
    title: 'ADsP 진도 보드',
    desc: '스터디 진도·성취도를 관리하는 웹앱. ADsP 1기가 사용 중입니다.',
    links: [['열어보기', ADSP_BOARD_URL]],
  },
  {
    title: '이 사이트',
    desc: '연구회 허브 자체가 결과물입니다 — AI 협업 · git · 무료 배포로 제작.',
    links: [['GitHub 소스', REPO_URL]],
  },
  {
    title: '운영자 포트폴리오',
    desc: '스터디에서 만들게 될 것의 원형. 제작 중입니다.',
    links: [],
  },
]

const FAQ = [
  ['코딩을 못해도 참여할 수 있나요?',
    '네. 경영학부 대상이고, 주제는 코딩이 아니라 AI 활용입니다. 필요한 도구 사용법은 스터디에서 함께 다룹니다.'],
  ['비용이 드나요?',
    '참가비는 없습니다. 무료 도구 스택으로 시작하고, 일부 유료 AI 도구는 선택 사항입니다.'],
  ['무엇을 만들게 되나요?',
    '각자 경영·MIS 맥락의 실물 — 배포된 웹 결과물 — 을 만듭니다. 결과물은 본인 소유입니다.'],
  ['ERP연구회와는 어떤 관계인가요?',
    'ERP연구회 산하 스터디입니다. 연구회에는 SAP 실습·공모전 심화 트랙이 있습니다.'],
  ['언제 모집하나요?',
    '준비 중입니다. 일정이 확정되면 모집 안내 페이지에 공지됩니다.'],
]

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((el) => el.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
      }),
      { threshold: 0.15 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function Carousel() {
  const ref = useRef(null)
  const slide = (dir) => {
    const el = ref.current
    if (el) el.scrollBy({ left: dir * (el.firstChild.offsetWidth + 18), behavior: 'smooth' })
  }
  return (
    <>
      <div className="carousel" ref={ref} aria-label="결과물 목록">
        {WORKS.map((w) => (
          <div className="car-card" key={w.title}>
            <h3>{w.title}</h3>
            <p>{w.desc}</p>
            {w.links.length > 0 && (
              <div className="card-links">
                {w.links.map(([label, href]) => (
                  <a className="proof-link" key={label} href={href}>{label} <Arrow /></a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="car-nav">
        <button type="button" className="btn-2nd car-btn" aria-label="이전 결과물" onClick={() => slide(-1)}>←</button>
        <button type="button" className="btn-2nd car-btn" aria-label="다음 결과물" onClick={() => slide(1)}>→</button>
      </div>
    </>
  )
}

export default function App() {
  useReveal()
  return (
    <>
      <SiteNav />

      <main id="top" className="lattice">
        <section className="cell hero center hero-hub">
          <span className="eyebrow">광운대학교 경영학부</span>
          <h1><em>ERP</em>연구회</h1>
          <p className="hero-sub">경영·MIS에 AI를 접목하는 법을 연구하고, 결과를 실물로 남깁니다.</p>
        </section>

        <section className="cell center" id="direction">
          <span className="eyebrow">방향</span>
          <h2 className="headline">앞으로 <em>할 일</em></h2>
          <div className="row2">
            <div style={{ textAlign: 'left' }}>
              <h3>로드맵</h3>
              <div className="dir-list">
                {DIRECTION.map(([status, label, text]) => (
                  <div className="dir-row" key={text}>
                    <span className={`status ${status}`}>{label}</span>
                    <p>{text}</p>
                  </div>
                ))}
              </div>
              <a className="proof-link dir-more" href="/log/#roadmap">전체 로드맵 <Arrow /></a>
            </div>
            <div style={{ textAlign: 'left' }}>
              <h3>업계 리포트</h3>
              <p>AI 활용의 효과·격차·채용에 대한 검증된 조사와 연구를 모아둡니다. 전 항목 출처를 답니다.</p>
              <div className="card-links">
                <a className="proof-link" href="/reports/">리포트 보기 <Arrow /></a>
              </div>
            </div>
          </div>
        </section>

        <section className="cell center" id="tracks">
          <span className="eyebrow">활동</span>
          <h2 className="headline">무엇을 <em>하나</em></h2>
          <div className="row2">
            <div className="reveal" style={{ textAlign: 'left' }}>
              <span className="feat-idx">1층 — 전원</span>
              <h3>AI 활용 연구</h3>
              <p>경영·MIS 문제에 AI를 적용하는 법을 연구하고, 결과를 웹으로 배포합니다.</p>
            </div>
            <div className="reveal" style={{ textAlign: 'left', transitionDelay: '80ms' }}>
              <span className="feat-idx">2층 — 선택 심화</span>
              <h3>SAP 트랙 · 공모전</h3>
              <p>AI 친숙도를 갖춘 뒤 실서버 실습과 공모전 출품으로 확장합니다.</p>
            </div>
          </div>
        </section>

        <section className="cell center" id="works">
          <span className="eyebrow">결과물</span>
          <h2 className="headline">남긴 <em>실물</em></h2>
          <Carousel />
        </section>

        <section className="cell" id="open">
          <div className="cell-dark" style={{ padding: '2.5rem 2rem', textAlign: 'left' }}>
            <h3>운영을 공개합니다</h3>
            <p>어떻게 운영되는지 기록으로 남기고, 누구나 볼 수 있게 둡니다.</p>
            <div className="card-links">
              <a className="proof-link" href="/log/">운영 기록 <Arrow /></a>
              <a className="proof-link" href="/reports/">업계 리포트 <Arrow /></a>
              <a className="proof-link" href={`${REPO_URL}/commits/main`}>커밋 이력 <Arrow /></a>
            </div>
          </div>
        </section>

        <section className="cell center" id="faq">
          <span className="eyebrow">자주 묻는 질문</span>
          <h2 className="headline">묻고 <em>답하기</em></h2>
          <div className="faq">
            {FAQ.map(([q, a]) => (
              <details className="faq-item" key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
          <p className="join-note" style={{ marginTop: '1.75rem' }}>
            모집 상세는 <a className="proof-link" href="/join/">모집 안내 <Arrow /></a>
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
