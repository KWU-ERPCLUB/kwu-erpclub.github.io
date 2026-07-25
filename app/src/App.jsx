// 메인(/) v5 — 구조 개혁(2026-07-24 2차): .lattice/.cell 격자 폐지 → 풀블리드 스크린 섹션.
// prography/depromeet 문법: 100vh 히어로(뷰포트 타이포·좌정렬)·대형 숫자 풀폭 WHY·가로 타임라인·풀폭 커버 PROJECTS·대형 FAQ.
// 모션: 문자 스태거 리빌 · 키워드 마퀴 · 수치 카운트업 · 커버 호버 리프트 · 섹션=페이지 감쇠(home-motion.jsx). transform·opacity만·reduced-motion 존중.
// 문안 원천: erp-club/docs/문안-메인.md. 수치=검증분만+출처. 색·폰트=현행 토큰(디자인규칙 §1·§2).
import { Arrow, SiteNav, SiteFooter } from './shared.jsx'
import { MARQUEE_KEYWORDS, marqueeTrack } from './home-logic.js'
import { useSectionSpy, useParallax, StaggerChars, CountUp } from './home-motion.jsx'

// WHY 데이터 스트립 — 검증분 수치만(원문 확인) + 출처.
const DATA = [
  ['69.2%', '채용 시 AI 역량 고려 — 인사담당자 조사 1위', '대한상공회의소 2025'],
  ['36.3%', 'AI 채용공고 최대 직무군은 개발자가 아니라 기획·설계', '한국직업능력연구원 2026'],
  ['40%', 'AI 활용 시 업무 시간 단축, 품질 평가는 +18%', 'MIT · Science 2023'],
]

// PROJECTS — 풀폭 커버 카드(커버 캡처 + 대형 제목 오버레이). 클릭 = /projects/ 상세 딥링크.
const PROJECTS = [
  ['ADsP Study Board', '/img/projects/adsp-board.png', '/projects/?p=2026-07-24-bapzzi-adsp-board', '운영 중'],
  ['KWU ERP Club Site', '/img/projects/erpclub-site.png', '/projects/?p=2026-07-24-bapzzi-erpclub-site', '운영 중'],
]

// ROADMAP — 가로 진행 타임라인. status = [클래스, 라벨]. slot = "앞으로 채워갈 공간"(점선), now = 신설 강조.
const ROADMAP = [
  { era: 'ORIGIN', title: 'ERP연구회', desc: '경영학부 MIS 스터디 — ERP·정보시스템의 뿌리.' },
  { era: 'SAP ERA', title: 'SAP 특강', desc: '실무 컨설턴트가 이끈 MM·ABAP 교육의 시대.' },
  { era: '2026', title: 'ADsP 스터디 1기', desc: '데이터분석 준전문가 대비 — 진도 보드 운영 중.', status: ['live', '진행중'] },
  { era: 'NEW BRANCH', title: 'MIS·AI 스터디', desc: '경영·MIS에 AI를 접목하는 새 갈래 — 이 사이트가 시작.', status: ['prep', '모집 준비'], now: true },
  { era: 'DEEP DIVE', title: 'SAP Track · 공모전', desc: 'AI 친숙도를 갖춘 뒤의 심화 갈래.', status: ['planned', '예정'], slot: true },
  { era: 'NEXT', title: '앞으로 채워갈 공간', desc: '새 트랙·기수가 이 갈래에 이어질 자리.', slot: true },
]

// 답변 = 개조식(§0-1). 질문 = 문답 UI라 구어 유지(예외 승인 범위).
const FAQ = [
  ['코딩을 못해도 참여할 수 있나요?', '가능. 경영학부 대상, 주제는 코딩이 아니라 AI 활용. 필요한 도구 사용법은 스터디에서 함께 다룸.'],
  ['비용이 드나요?', '참가비 없음. 무료 도구 스택 기본, 일부 유료 AI 도구는 선택.'],
  ['무엇을 만들게 되나요?', '각자 경영·MIS 맥락의 실물(배포된 웹 결과물) 제작. 결과물은 본인 소유.'],
  ['ERP연구회와는 어떤 관계인가요?', 'ERP연구회 산하 스터디. 연구회 안에 SAP 실습·공모전 심화 트랙.'],
  ['언제 모집하나요?', '모집은 비정기. 문의 = ABOUT 페이지 또는 GitHub 저장소.'],
]

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// 히어로 100vh — 브랜드 키커 → 뷰포트 타이포 3줄 스택(좌정렬) → 서브 → 풀폭 마퀴 + 스크롤 유도.
function Hero() {
  return (
    <section className="hs hs-hero page" id="top">
      <div className="hs-in hs-hero-in">
        <span className="hero-kicker rv">KWANGWOON UNIV. · SCHOOL OF BUSINESS · ERP연구회</span>
        <h1 className="hero-mega">
          <span className="hero-l rv"><StaggerChars text="경영·MIS에" start={0} /></span>
          <span className="hero-l rv" style={{ transitionDelay: '90ms' }}>
            <StaggerChars text="AI" accent start={5} /><StaggerChars text="를 접목하는 법" start={7} />
          </span>
          <span className="hero-l rv" style={{ transitionDelay: '180ms' }}><StaggerChars text="연구 — 결과는 실물로" start={14} /></span>
        </h1>
        <p className="hero-sub rv" style={{ transitionDelay: '320ms' }}>
          쓰는 사람은 많지만, 잘 쓰는 법을 배우는 자리는 없다 — 그 자리를 만드는 스터디.
        </p>
      </div>
      <div className="hero-foot">
        <span className="scroll-cue rv" style={{ transitionDelay: '420ms' }}>SCROLL <ChevronDown /></span>
        <div className="marquee" data-parallax="-0.03" aria-hidden="true">
          <div className="marquee-track">
            {marqueeTrack(MARQUEE_KEYWORDS).map((kw, i) => (
              <span className="marquee-item" key={`${kw}-${i}`}>{kw}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// WHY 풀스크린 — 존재 의의 대형 타이포 도입 + 대형 숫자 풀폭 행(숫자 좌 / 라벨·출처 우, 헤어라인 구분).
function Why() {
  return (
    <section className="hs hs-why page" id="why">
      <div className="hs-in">
        <span className="page-idx rv">01 — WHY</span>
        <p className="why-lead rv" style={{ transitionDelay: '90ms' }}>20대 4명 중 3명이 이미 생성형 AI를 쓴다.</p>
        <p className="why-note rv" style={{ transitionDelay: '160ms' }}>
          하지만 활용은 검색·요약 수준에 정체 — 경영·MIS 맥락의 훈련 자리는 공백. 그 공백을 겨냥한다.
        </p>
        <div className="stat-rows rv" style={{ transitionDelay: '240ms' }}>
          {DATA.map(([num, label, src]) => (
            <div className="stat-row" key={src}>
              <CountUp value={num} />
              <div>
                <span className="stat-row-label">{label}</span>
                <span className="stat-row-src">{src}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="data-note rv" style={{ transitionDelay: '320ms' }}>원문 확인 자료만 게재.</p>
      </div>
    </section>
  )
}

// ROADMAP — 가로 진행 타임라인(데스크톱 노드 가로 흐름 / 모바일 세로 폴백). 점선 슬롯 = 채워갈 공간.
function Roadmap() {
  return (
    <section className="hs hs-roadmap page" id="roadmap">
      <div className="hs-in">
        <span className="page-idx rv">02 — ROADMAP</span>
        <h2 className="hs-title rv" style={{ transitionDelay: '90ms' }}>연구회에서 <em>분기</em>하다</h2>
        <ol className="rmap rv" style={{ transitionDelay: '180ms' }}>
          {ROADMAP.map((n) => (
            <li className={`rm-node${n.now ? ' now' : ''}${n.slot ? ' rm-slot' : ''}`} key={n.title}>
              <span className="rm-dot" aria-hidden="true" />
              <span className="rm-era">{n.era}</span>
              <h3>{n.title}</h3>
              <p>{n.desc}</p>
              {n.status && <span className={`status ${n.status[0]}`}>{n.status[1]}</span>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

// PROJECTS — 풀폭 대형 커버 카드(커버 위 대형 제목 오버레이). 클릭 = /projects/ 상세.
function Projects() {
  return (
    <section className="hs hs-projects page" id="projects">
      <div className="hs-in">
        <span className="page-idx rv">03 — PROJECTS</span>
        <h2 className="hs-title rv" style={{ transitionDelay: '90ms' }}>남긴 <em>실물</em></h2>
        <div className="hp-list rv" style={{ transitionDelay: '180ms' }}>
          {PROJECTS.map(([title, cover, href, tag]) => (
            <a className="hp-card" href={href} key={title}>
              <span className="hp-coverwrap">
                <img className="hp-cover" src={cover} alt="" loading="lazy" />
                <span className="hp-overlay">
                  <span className="hp-tag">{tag}</span>
                  <span className="hp-title">{title}</span>
                  <span className="hp-more">자세히 <Arrow /></span>
                </span>
              </span>
            </a>
          ))}
        </div>
        <p className="hp-more-links rv" style={{ transitionDelay: '260ms' }}>
          <a className="proof-link" href="/projects/">전체 아카이브 <Arrow /></a>
          <a className="proof-link" href="/log/#roadmap">전체 로드맵 <Arrow /></a>
        </p>
      </div>
    </section>
  )
}

// FAQ — 대형 아코디언(질문 타이포 1.4rem급·풀폭 헤어라인) + ABOUT 링크.
function Faq() {
  return (
    <section className="hs hs-faq page" id="faq">
      <div className="hs-in">
        <span className="page-idx rv">04 — FAQ</span>
        <h2 className="hs-title rv" style={{ transitionDelay: '90ms' }}>묻고 <em>답하기</em></h2>
        <div className="faq-xl rv" style={{ transitionDelay: '180ms' }}>
          {FAQ.map(([q, a]) => (
            <details className="fx-item" key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
        <p className="hs-about rv" style={{ transitionDelay: '260ms' }}>
          연구회 소개는 <a className="proof-link" href="/about/">ABOUT <Arrow /></a>
        </p>
      </div>
    </section>
  )
}

export default function App() {
  useSectionSpy()
  useParallax()
  return (
    <>
      <SiteNav />
      <main className="home">
        <Hero />
        <Why />
        <Roadmap />
        <Projects />
        <Faq />
      </main>
      <SiteFooter />
    </>
  )
}
