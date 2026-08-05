// 메인(/) v5 — 구조 개혁(2026-07-24 2차): .lattice/.cell 격자 폐지 → 풀블리드 스크린 섹션.
// WHY 섹션 폐지(2026-07-25 owner): 수치 노후·갱신 부담, 취업 논거는 북극성 §3 위반 소지, 논증형은 §0-1 서사 비표기와 긴장.
// 핵심 논거(챗 단독의 한계)는 FAQ 1문으로 이관 — 문답 UI = 구어·설득 허용 예외.
// prography/depromeet 문법: 100vh 히어로(뷰포트 타이포·좌정렬·소개 2줄)·계보 트리 ROADMAP·풀폭 커버 PROJECTS·대형 FAQ.
// 모션: 문자 스태거 리빌 · 키워드 마퀴 · 커버 호버 리프트 · 섹션=페이지 감쇠(home-motion.jsx). transform·opacity만·reduced-motion 존중.
// 색·폰트=현행 토큰(디자인규칙 §1·§2).
import { Arrow, SiteNav, SiteFooter } from './shared.jsx'
import { MARQUEE_KEYWORDS, marqueeTrack, localYmd, recruitPhase } from './home-logic.js'
import { RECRUIT, COHORT_LABEL, formatWindowShort } from './data/recruit.js'
import { FAQ } from './data/faq.js'
import { useSectionSpy, useParallax, StaggerChars } from './home-motion.jsx'

// PROJECTS — 풀폭 커버 카드(커버 캡처 + 대형 제목 오버레이). 클릭 = /projects/ 상세 딥링크.
// ?p= 슬러그는 content/프로젝트/<슬러그>.md와 1:1이어야 한다(어긋나면 빈 상세 = 조용한 깨짐).
// export = 슬러그 존재 여부를 테스트가 콘텐츠 글롭과 대조하기 위함.
export const PROJECTS = [
  ['ADsP 스터디 1기', '/img/projects/adsp-board.png', '/projects/?p=2026-07-24-bapzzi-adsp-board', '진행 중'],
  ['KWU ERP Club Site', '/img/projects/erpclub-site.png', '/projects/?p=2026-07-24-bapzzi-erpclub-site', '운영 중'],
]

// ROADMAP — 계보 트리(2026-07-25 개편): 본류(ERP연구회 → SAP)에서 MIS·AI 스터디 분기, 그 아래 프로젝트.
// TRUNK = 본류 노드, BRANCH = 분기 노드(+children = 하위 프로젝트·빈 슬롯). DEEP DIVE(미개설)는 제외.
const TRUNK = [
  { era: 'ORIGIN', title: 'ERP연구회', desc: '경영학부 MIS 스터디 — ERP·정보시스템의 뿌리.' },
  { era: 'SAP ERA', title: 'SAP 특강', desc: '실무 컨설턴트가 이끈 MM·ABAP 교육 — 이어져 온 본류.' },
]
const BRANCH = {
  era: '2026 · NEW BRANCH',
  title: 'MIS·AI 스터디',
  desc: '본류에서 분기한 갈래 — AI 활용 집중.',
  status: ['prep', '모집 준비'],
  children: [
    { era: 'PROJECT', title: 'ADsP 스터디 1기', desc: '데이터분석 준전문가 대비 — 진도 보드 운영 중.', status: ['live', '진행중'] },
    { era: 'NEXT', title: '앞으로 채워갈 공간', desc: '새 트랙·기수가 이어질 자리.', slot: true },
  ],
}

// FAQ 원천 = data/faq.js(E4 공용화 2026-08-05) — 메인은 전체 렌더, /recruit는 서브셋.

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// 히어로 100vh — 브랜드 키커 → 뷰포트 타이포(AIM) → 확장 라인(AI × MIS, AIM 폭 정렬) → 서브 → 풀폭 마퀴 + 스크롤 유도.
// 확장 라인 정렬(오너 2026-08-05): AI = 메가 A·I 아래 좌측, MIS = 메가 M 아래 우측 — .hero-brand 인라인블록이 메가 폭을 감싸고 flex 양끝 정렬.
function Hero() {
  return (
    <section className="hs hs-hero page" id="top">
      <div className="hs-in hs-hero-in">
        <span className="hero-kicker rv">KWANGWOON UNIV. · SCHOOL OF BUSINESS</span>
        <div className="hero-brand">
          <h1 className="hero-mega">
            <span className="hero-l rv"><StaggerChars text="AI" accent start={0} /><StaggerChars text="M" start={2} /></span>
          </h1>
          <p className="hero-expand rv" aria-label="AI × MIS">
            <span aria-hidden="true"><StaggerChars text="AI" start={4} /></span>
            <span aria-hidden="true"><StaggerChars text="×" start={6} /></span>
            <span aria-hidden="true"><StaggerChars text="MIS" start={7} /></span>
          </p>
        </div>
        <p className="hero-sub rv" style={{ transitionDelay: '320ms' }}>
          광운대학교 ERP연구회 산하 MIS·AI 스터디
        </p>
        <p className="hero-desc rv" style={{ transitionDelay: '400ms' }}>
          AI 활용에 집중하는 스터디의 허브 — AI 인사이트·세미나·프로젝트 기록.
        </p>
      </div>
      <div className="hero-foot">
        <div className="marquee" data-parallax="-0.03" aria-hidden="true">
          <div className="marquee-track">
            {marqueeTrack(MARQUEE_KEYWORDS).map((kw, i) => (
              <span className="marquee-item" key={`${kw}-${i}`}>{kw}</span>
            ))}
          </div>
        </div>
        <span className="scroll-cue rv" style={{ transitionDelay: '420ms' }}>SCROLL <ChevronDown /></span>
      </div>
    </section>
  )
}

// 모집 섹션(확대 개편 2026-08-05 오너) — 히어로 직하 한 축. 기간 종료(after) = 메인 미표시(모집 페이지·나브는 유지).
// .page 미부여 = 섹션 스파이(감쇠) 제외. 카피 = 사실 서술만. export = 국면별(전·중·후) 렌더 테스트용.
const RECRUIT_COPY = {
  before: ['prep', '모집 예정', `${RECRUIT.window.start} 모집 시작`],
  open: ['live', '모집 중', `${RECRUIT.window.end} 마감`],
}

export function RecruitBand({ today = localYmd() }) {
  const phase = recruitPhase(today)
  if (phase === 'after') return null
  const [badge, badgeLabel, note] = RECRUIT_COPY[phase]
  return (
    <section className="recruit-band" id="recruit" aria-label="AIM 모집 안내">
      <div className="rb-in">
        <div className="rb-head">
          <span className={`status ${badge}`}>{badgeLabel}</span>
          <span className="rb-note">{note}</span>
        </div>
        <h2 className="rb-title">{COHORT_LABEL} 모집</h2>
        <p className="rb-text">모집 {formatWindowShort()} · 활동 {RECRUIT.활동기간}</p>
        <a className="proof-link rb-cta" href="/recruit/">모집 안내 <Arrow /></a>
      </div>
    </section>
  )
}

// ROADMAP — 계보 트리(세로 본류선 → 분기 들여쓰기 + 가지선). 점선 슬롯 = 채워갈 공간.
function TreeNode({ n }) {
  return (
    <>
      <span className="rm-dot" aria-hidden="true" />
      <span className="rm-era">{n.era}</span>
      <h3>{n.title}</h3>
      <p>{n.desc}</p>
      {n.status && <span className={`status ${n.status[0]}`}>{n.status[1]}</span>}
    </>
  )
}

function Roadmap() {
  return (
    <section className="hs hs-roadmap page" id="roadmap">
      <div className="hs-in">
        <span className="page-idx rv">01 — ROADMAP</span>
        <h2 className="hs-title rv" style={{ transitionDelay: '90ms' }}>스터디 <em>로드맵</em></h2>
        <ol className="rmap rv" style={{ transitionDelay: '180ms' }}>
          {TRUNK.map((n) => (
            <li className="rm-node" key={n.title}>
              <TreeNode n={n} />
            </li>
          ))}
          <li className="rm-node now" key={BRANCH.title}>
            <TreeNode n={BRANCH} />
            <ol className="rm-sub">
              {BRANCH.children.map((c) => (
                <li className={`rm-node${c.slot ? ' rm-slot' : ''}`} key={c.title}>
                  <TreeNode n={c} />
                </li>
              ))}
            </ol>
          </li>
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
        <span className="page-idx rv">02 — PROJECTS</span>
        <h2 className="hs-title rv" style={{ transitionDelay: '90ms' }}><em>프로젝트</em></h2>
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
        <span className="page-idx rv">03 — FAQ</span>
        <h2 className="hs-title rv" style={{ transitionDelay: '90ms' }}>묻고 <em>답하기</em></h2>
        <div className="faq-xl rv" style={{ transitionDelay: '180ms' }}>
          {FAQ.map(({ q, a }) => (
            <details className="fx-item" key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
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
        <RecruitBand />
        <Roadmap />
        <Projects />
        <Faq />
      </main>
      <SiteFooter />
    </>
  )
}
