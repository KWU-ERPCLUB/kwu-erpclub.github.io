// 메인(/) v4 — prography식 "꽉 찬" 풀 모션(색·폰트=현행 토큰 유지). 4섹션(WHY·ROADMAP·PROJECTS·FAQ).
// 모션: 문자 스태거 리빌 · 키워드 마퀴 · 수치 카운트업 · 카드 호버 리프트 · 가벼운 패럴랙스(transform·opacity만).
// 섹션=페이지 감쇠 로직 유지(리빌 타이밍·이동량 강화). reduced-motion = 전부 정지·즉시 표시.
// 문안 원천: erp-club/docs/문안-메인.md. 수치=검증분만+출처(선행조사·/reports 단일원천).
import { useRef } from 'react'
import { Arrow, SiteNav, SiteFooter, REPO_URL } from './shared.jsx'
import { MARQUEE_KEYWORDS, marqueeTrack } from './home-logic.js'
import { useSectionSpy, useParallax, StaggerChars, CountUp } from './home-motion.jsx'

const ADSP_BOARD_URL = 'https://erpstudy.vercel.app'

const DATA = [
  ['69.2%', '채용 시 AI 역량 고려 — 인사담당자 조사 1위', '대한상공회의소 2025'],
  ['36.3%', 'AI 채용공고 최대 직무군은 개발자가 아니라 기획·설계', '한국직업능력연구원 2026'],
  ['40%', 'AI 활용 시 업무 시간 단축, 품질 평가는 +18%', 'MIT · Science 2023'],
]

const PROJECTS = [
  {
    title: 'ADsP Study Board',
    desc: 'ADsP 1기 스터디의 진도·성취도 웹앱 — 운영 중.',
    links: [['열어보기', ADSP_BOARD_URL]],
  },
  {
    title: 'This Site',
    desc: '이 사이트 자체가 결과물 — AI 협업 · git · 무료 배포.',
    links: [['GitHub 소스', REPO_URL]],
  },
]

// 로드맵/NEXT — planned·prep = "앞으로 채워갈 공간"(점선 슬롯). live = 확정 활동.
const NEXT = [
  ['prep', '모집 준비', 'MIS·AI 스터디 1기 — 스터디명·인원 확정 대기'],
  ['planned', '준비', '공모전 프레임워크 — 공모전 워크프로세스를 효율화하는 재사용 틀'],
  ['planned', '예정', 'SQLD 스터디 · SAP Track · 공모전 출품'],
]

// 답변 = 개조식(§0-1 전면 원칙). 질문 = 문답 UI라 구어 유지(예외 승인 범위)
const FAQ = [
  ['코딩을 못해도 참여할 수 있나요?',
    '가능. 경영학부 대상, 주제는 코딩이 아니라 AI 활용. 필요한 도구 사용법은 스터디에서 함께 다룸.'],
  ['비용이 드나요?',
    '참가비 없음. 무료 도구 스택 기본, 일부 유료 AI 도구는 선택.'],
  ['무엇을 만들게 되나요?',
    '각자 경영·MIS 맥락의 실물(배포된 웹 결과물) 제작. 결과물은 본인 소유.'],
  ['ERP연구회와는 어떤 관계인가요?',
    'ERP연구회 산하 스터디. 연구회 안에 SAP 실습·공모전 심화 트랙.'],
  ['언제 모집하나요?',
    '모집은 비정기. 문의 = ABOUT 페이지 또는 GitHub 저장소.'],
]

// base 클래스와 병합해 rv를 부여한다(스프레드가 className을 덮어쓰는 사고 방지 — 리뷰 지적)
const rv = (i, base = '') => ({
  className: base ? `${base} rv` : 'rv',
  style: { transitionDelay: `${i * 90}ms` },
})

function Carousel() {
  const ref = useRef(null)
  const slide = (dir) => {
    const el = ref.current
    if (el) el.scrollBy({ left: dir * (el.firstChild.offsetWidth + 18), behavior: 'smooth' })
  }
  return (
    <>
      <div className="carousel" ref={ref} aria-label="프로젝트 목록">
        {PROJECTS.map((w) => (
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
        <button type="button" className="btn-2nd car-btn" aria-label="이전 프로젝트" onClick={() => slide(-1)}>←</button>
        <button type="button" className="btn-2nd car-btn" aria-label="다음 프로젝트" onClick={() => slide(1)}>→</button>
      </div>
    </>
  )
}

export default function App() {
  useSectionSpy()
  useParallax()
  return (
    <>
      <SiteNav />

      <main className="lattice">
        <section className="cell hero hero-xl center page" id="top">
          <span className="eyebrow rv">KWANGWOON UNIV. · SCHOOL OF BUSINESS</span>
          <h1 className="hero-title rv" style={{ transitionDelay: '80ms' }}>
            <StaggerChars text="ERP" accent start={0} />
            <StaggerChars text="연구회" start={3} />
          </h1>
          <p className="hero-sub rv" style={{ transitionDelay: '360ms' }}>
            경영·MIS에 AI를 접목하는 법 연구 — 결과는 실물로.
          </p>
          {/* 키워드 마퀴 띠 — 다루는 주제 흐르는 텍스트(CSS 애니메이션·reduced-motion 시 정지) */}
          <div className="marquee" data-parallax="-0.04" aria-hidden="true">
            <div className="marquee-track">
              {marqueeTrack(MARQUEE_KEYWORDS).map((kw, i) => (
                <span className="marquee-item" key={`${kw}-${i}`}>{kw}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="cell center page" id="why">
          <span className="page-idx rv">01 — WHY</span>
          <h2 {...rv(1, 'headline')}>왜 <em>만들었나</em></h2>
          <p className="why-line rv" style={{ transitionDelay: '180ms' }}>
            쓰는 사람은 많지만, 잘 쓰는 법을 배우는 자리는 없다.
          </p>
          <p className="mis-note rv" style={{ transitionDelay: '270ms', marginTop: 0 }}>
            20대 4명 중 3명이 이미 생성형 AI 사용. 활용은 검색·요약 수준에 정체 —
            경영·MIS 맥락의 활용 훈련 자리는 공백. 그 자리를 만드는 스터디.
          </p>
          <div className="row3 data-strip rv" style={{ transitionDelay: '360ms' }}>
            {DATA.map(([num, label, src]) => (
              <div key={src} style={{ textAlign: 'left' }}>
                <CountUp value={num} />
                <span className="stat-label">{label}</span>
                <span className="stat-src">{src}</span>
              </div>
            ))}
          </div>
          <p className="data-note rv" style={{ transitionDelay: '450ms' }}>
            원문 확인 자료만 게재.
          </p>
        </section>

        <section className="cell center page" id="roadmap">
          <span className="page-idx rv">02 — ROADMAP</span>
          <h2 {...rv(1, 'headline')}>연구회에서 <em>분기</em>하다</h2>
          <div className="branch rv" style={{ transitionDelay: '180ms' }}>
            <div className="b-node">
              <span className="b-era">ORIGIN</span>
              <h3>ERP연구회</h3>
              <p>경영학부의 MIS 스터디 — ERP와 정보시스템을 다뤄 온 뿌리.</p>
            </div>
            <div className="b-node">
              <span className="b-era">SAP ERA</span>
              <h3>SAP 특강</h3>
              <p>실무 컨설턴트가 이끈 MM·ABAP 교육의 시대.</p>
            </div>
            <div className="b-node">
              <span className="b-era">2026</span>
              <h3>ADsP 스터디 1기</h3>
              <p>데이터분석 준전문가 대비 — 진도 보드로 운영 중.</p>
              <span className="status live">진행중</span>
            </div>
            <div className="b-fork">
              <div className="b-node now">
                <span className="b-era">NEW BRANCH</span>
                <h3>MIS·AI 스터디 <em>신설</em></h3>
                <p>경영·MIS에 AI를 접목하는 법을 연구하는 새 갈래 — 이 사이트가 그 시작.</p>
                <span className="status prep">모집 준비</span>
              </div>
              {/* planned = "앞으로 채워갈 공간" — 점선 슬롯으로 확장 예정 시각화 */}
              <div className="b-node b-slot">
                <span className="b-era">DEEP DIVE</span>
                <h3>SAP Track · 공모전</h3>
                <p>AI 친숙도를 갖춘 뒤의 심화 갈래.</p>
                <span className="status planned">예정</span>
              </div>
              <div className="b-node b-slot b-slot-empty" aria-hidden="true">
                <span className="b-era">NEXT</span>
                <h3>앞으로 채워갈 공간</h3>
                <p>새 트랙·기수가 이 갈래에 이어질 자리.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="cell center page" id="projects">
          <span className="page-idx rv">03 — PROJECTS</span>
          <h2 {...rv(1, 'headline')}>남긴 <em>실물</em>, 그리고 다음</h2>
          <div {...rv(2)}>
            <Carousel />
          </div>
          <div className="next-list rv" style={{ transitionDelay: '270ms' }}>
            <span className="next-label">NEXT</span>
            {NEXT.map(([status, label, text]) => (
              <div className={`dir-row${status === 'live' ? '' : ' dir-slot'}`} key={text}>
                <span className={`status ${status}`}>{label}</span>
                <p>{text}</p>
              </div>
            ))}
            <p style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', margin: 0 }}>
              <a className="proof-link dir-more" href="/projects/">전체 아카이브 <Arrow /></a>
              <a className="proof-link dir-more" href="/log/#roadmap">전체 로드맵 <Arrow /></a>
            </p>
          </div>
        </section>

        <section className="cell center page" id="faq">
          <span className="page-idx rv">04 — FAQ</span>
          <h2 {...rv(1, 'headline')}>묻고 <em>답하기</em></h2>
          <div className="faq rv" style={{ transitionDelay: '180ms' }}>
            {FAQ.map(([q, a]) => (
              <details className="faq-item" key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
          <p className="join-note rv" style={{ marginTop: '1.75rem', transitionDelay: '270ms' }}>
            연구회 소개는 <a className="proof-link" href="/about/">ABOUT <Arrow /></a>
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
