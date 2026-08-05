// 메인(/) v6 — §6-2a v3.1 개조(2026-08-05, NEXTERS 실측 문법): 불변 3종(화이트 배경·폰트·버건디)만 유지, 지면 골격 개조.
// B1 블랙 통계 밴드(모집 직하·페이지 블랙 대면적 1개·CountUp 재사용·실측 수치만) ·
// B2 좌 라벨 컬럼 골격(ROADMAP·PROJECTS·FAQ = 좌 고정 라벨(버건디 ■)+우 콘텐츠 2단) ·
// B3 ROADMAP = 계보 트리 폐지 → 대형 워드 스택 + 스크롤 연동(중앙 최근접 항목만 진하게·opacity만) ·
// B4 버건디 모집 면 철회(블랙 밴드와 경합 → recruit.css 기본 라이트 밴드로 복귀) — 근거 = home.css 주석.
// 모션: 문자 스태거 리빌 · 키워드 마퀴 · 커버 호버 리프트 · 섹션=페이지 감쇠(home-motion.jsx). 신규 무한루프 0 · transform·opacity만 · reduced-motion 존중.
import { useEffect } from 'react'
import { Arrow, SiteNav, SiteFooter } from './shared.jsx'
import { MARQUEE_KEYWORDS, marqueeTrack, localYmd, recruitPhase, heldSeminars, studyCell } from './home-logic.js'
import { RECRUIT, COHORT_LABEL, formatWindowShort } from './data/recruit.js'
import { FAQ } from './data/faq.js'
import { loadContent } from './content/loader.js'
import { useSectionSpy, useParallax, StaggerChars, CountUp, prefersReduced } from './home-motion.jsx'
import { Cols, HomeInsights } from './home-parts.jsx'

// PROJECTS — 풀폭 커버 카드(커버 캡처 + 대형 제목 오버레이). 클릭 = /projects/ 상세 딥링크.
// ?p= 슬러그는 content/프로젝트/<슬러그>.md와 1:1이어야 한다(어긋나면 빈 상세 = 조용한 깨짐).
// export = 슬러그 존재 여부를 테스트가 콘텐츠 글롭과 대조하기 위함.
export const PROJECTS = [
  ['ADsP 스터디 1기', '/img/projects/adsp-board.png', '/projects/?p=2026-07-24-bapzzi-adsp-board', '진행 중'],
  ['KWU ERP Club Site', '/img/projects/erpclub-site.png', '/projects/?p=2026-07-24-bapzzi-erpclub-site', '운영 중'],
]

// ROADMAP — B3 워드 스택(2026-08-05 v3.1): 계보를 대형 워드 5노드로 평탄화(ORIGIN→SAP→분기→프로젝트→슬롯).
// 내용·상태는 구 계보 트리(2026-07-25)와 동일 — 렌더 형태만 개조. DEEP DIVE(미개설)는 제외.
const LINEAGE = [
  { era: 'ORIGIN', title: 'ERP연구회', desc: '경영학부 MIS 스터디 — ERP·정보시스템의 뿌리.' },
  { era: 'SAP ERA', title: 'SAP 특강', desc: '실무 컨설턴트가 이끈 MM·ABAP 교육 — 이어져 온 본류.' },
  { era: '2026 · NEW BRANCH', title: 'MIS·AI 스터디', desc: '본류에서 분기한 갈래 — AI 활용 집중.', status: ['prep', '모집 준비'] },
  { era: 'PROJECT', title: 'ADsP 스터디 1기', desc: '데이터분석 준전문가 대비 — 진도 보드 운영 중.', status: ['live', '진행중'] },
  { era: 'NEXT', title: '앞으로 채워갈 공간', desc: '새 트랙·기수가 이어질 자리.', slot: true },
]

// FAQ 원천 = data/faq.js(E4 공용화 2026-08-05) — 메인은 전체 렌더, /recruit는 서브셋.

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// B3 스크롤 연동 — 뷰포트 중앙에 가장 가까운 워드만 활성(opacity만·rAF 스로틀, useSectionSpy 문법 승계).
// 게이트 = html.home-spy-js(2026-08-05 스톨 수정) — no-JS·reduced-motion이면 클래스가 없어 감쇠 규칙 자체가 꺼짐.
// 허용 파일 제약으로 home-motion.jsx가 아니라 여기 지역 정의.
function useWordSpy() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll('.wl-item'))
    if (items.length === 0) return
    if (prefersReduced()) return
    const root = document.documentElement
    root.classList.add('home-spy-js')
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
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    pick()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
      root.classList.remove('home-spy-js')
    }
  }, [])
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

// 모집 섹션 — 히어로 직하 한 축. 3국면 전부 렌더(2026-08-05 수정 — 구현은 after에서 null이었으나
// SPEC §4 "모집 기간 아님 → 다음 기수 안내" 요구 → 밴드 자리를 비우지 않고 안내로 교체).
// v3.1 B4: 버건디 면 철회 — recruit.css 기본(라이트 surface 밴드)로 렌더. 마크업 불변.
// .page 미부여 = 섹션 스파이(감쇠) 제외. 카피 = 사실 서술만. export = 국면별(전·중·후) 렌더 테스트용.
// [배지, 배지문구, 노트, 제목, 본문] — 값은 전부 data/recruit.js 파생(표시 문자열 중복 0).
const RECRUIT_COPY = {
  before: ['prep', '모집 예정', `${RECRUIT.window.start} 모집 시작`, `${COHORT_LABEL} 모집`,
    `모집 ${formatWindowShort()} · 활동 ${RECRUIT.활동기간}`],
  open: ['live', '모집 중', `${RECRUIT.window.end} 마감`, `${COHORT_LABEL} 모집`,
    `모집 ${formatWindowShort()} · 활동 ${RECRUIT.활동기간}`],
  after: ['planned', '모집 마감', `${COHORT_LABEL} 접수 종료`, '다음 기수 안내',
    `${COHORT_LABEL} 활동 ${RECRUIT.활동기간} · 다음 기수 모집 = 확정 시 이 자리·모집 페이지 공지`],
}

export function RecruitBand({ today = localYmd() }) {
  const phase = recruitPhase(today)
  const [badge, badgeLabel, note, title, text] = RECRUIT_COPY[phase]
  const ctaLabel = phase === 'after' ? '모집 페이지' : '모집 안내'
  return (
    <section className="recruit-band" id="recruit" aria-label="AIM 모집 안내">
      <div className="rb-in">
        <div className="rb-head">
          <span className={`status ${badge}`}>{badgeLabel}</span>
          <span className="rb-note">{note}</span>
        </div>
        <h2 className="rb-title">{title}</h2>
        <p className="rb-text">{text}</p>
        <a className="proof-link rb-cta" href="/recruit/">{ctaLabel} <Arrow /></a>
      </div>
    </section>
  )
}

// B1 블랙 통계 밴드 — 잉크 대면적 + 뷰포트급 흰 숫자 2×2(십자 헤어라인·CountUp 재사용).
// 수치 = 실측만(content/ 집계 + 확인된 사실 2건 — 구 recruit 증빙은 v3.2에서 제거, 밴드는 메인만). 출처 = 셀별 소형 표기.
// 정직성 수정(2026-08-05): 세미나 = **개최 완료만**(예정·일정미정 제외) · 스터디 셀 = 시험일 경계 파생(home-logic).
// .page 미부여 = 감쇠 제외(블랙 면 감쇠는 지면 파손). export = 수치·출처 단언 테스트용(today 주입).
export function StatsBand({ today = localYmd() }) {
  const 기사수 = loadContent('기사').length
  const 개최세미나수 = heldSeminars(loadContent('세미나'), today).length
  const cells = [
    [String(기사수), '게재 기사', 'content/ 집계'],
    [String(개최세미나수), '세미나 기록', 'content/ 집계 — 개최 완료만'],
    ['2', '라이브 실물', 'ADsP 진도 보드 · 이 사이트'],
    studyCell(today),
  ]
  return (
    <section className="stats-band" aria-label="운영 실측 수치">
      <div className="sb-in">
        <span className="sb-kicker">RECORD — 실측 집계</span>
        <div className="sb-grid">
          {cells.map(([num, label, src]) => (
            <div className="sb-cell" key={label}>
              <CountUp value={num} />
              <span className="sb-label">{label}</span>
              <span className="sb-src">{src}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ROADMAP — B3 대형 워드 스택(스크롤 연동·활성만 진하게). 점선 슬롯 문법은 톤 다운으로 승계.
function Roadmap() {
  return (
    <section className="hs hs-roadmap page" id="roadmap">
      <Cols label="01 — ROADMAP">
        <h2 className="hs-title rv" style={{ transitionDelay: '90ms' }}>스터디 <em>로드맵</em></h2>
        <ol className="wl rv" style={{ transitionDelay: '180ms' }}>
          {LINEAGE.map((n) => (
            <li className={`wl-item${n.slot ? ' wl-slot' : ''}`} key={n.title}>
              <span className="wl-era">{n.era}</span>
              <span className="wl-word">{n.title}</span>
              <span className="wl-desc">
                {n.desc}
                {n.status && <span className={`status ${n.status[0]}`}>{n.status[1]}</span>}
              </span>
            </li>
          ))}
        </ol>
      </Cols>
    </section>
  )
}

// PROJECTS — 풀폭 대형 커버 카드(커버 위 대형 제목 오버레이). 클릭 = /projects/ 상세.
function Projects() {
  return (
    <section className="hs hs-projects page" id="projects">
      <Cols label="02 — PROJECTS">
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
      </Cols>
    </section>
  )
}

// FAQ — 대형 아코디언(질문 타이포 1.4rem급·풀폭 헤어라인).
function Faq() {
  return (
    <section className="hs hs-faq page" id="faq">
      <Cols label="03 — FAQ">
        <h2 className="hs-title rv" style={{ transitionDelay: '90ms' }}>묻고 <em>답하기</em></h2>
        <div className="faq-xl rv" style={{ transitionDelay: '180ms' }}>
          {FAQ.map(({ q, a }) => (
            <details className="fx-item" key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </Cols>
    </section>
  )
}

export default function App() {
  useSectionSpy()
  useParallax()
  useWordSpy()
  return (
    <>
      <SiteNav />
      <main className="home">
        <Hero />
        <RecruitBand />
        <StatsBand />
        <Roadmap />
        <Projects />
        <Faq />
        <HomeInsights />
      </main>
      <SiteFooter />
    </>
  )
}
