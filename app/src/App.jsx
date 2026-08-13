// 메인(/) v7 — 외부 피드백 개편(2026-08-06): 히어로 정중앙 대형 타이포 + 추상 모션 그래픽 배경,
// 우측 격자 키비주얼·마퀴·스크롤 유도 폐지, 좌 라벨 컬럼(B2) 폐지 → 중앙 섹션 헤드,
// 순서 = 히어로 → 블랙 스탯 밴드(중앙) → 모집 밴드(강조) → 로드맵(지그재그 타임라인) → 프로젝트(2열) → FAQ → 인사이트(썸네일 줄).
// 모션: 문자 스태거 리빌 · 히어로 배경 블롭 플로트(CSS만) · 커버 호버 리프트 · 섹션 리빌(home-motion.jsx).
// 신규 무한루프 = 배경 블롭 CSS 1건(reduced-motion 정지) · transform·opacity만.
import { Arrow, SiteNav, SiteFooter } from './shared.jsx'
import { localYmd, recruitPhase, studyCell } from './home-logic.js'
import { RECRUIT, COHORT_LABEL, formatWindowShort } from './data/recruit.js'
import { FAQ } from './data/faq.js'
import { loadContent } from './content/loader.js'
import { useSectionSpy, useParallax, useItemReveal, StaggerChars, CountUp } from './home-motion.jsx'
import { SectionHead, HomeInsights } from './home-parts.jsx'

// PROJECTS — 2열 커버 카드(피드백: "양쪽으로·한눈에", 최대 3개). 클릭 = /projects/ 상세 딥링크.
// ?p= 슬러그는 content/프로젝트/<슬러그>.md와 1:1이어야 한다(어긋나면 빈 상세 = 조용한 깨짐).
// export = 슬러그 존재 여부를 테스트가 콘텐츠 글롭과 대조하기 위함.
export const PROJECTS = [
  ['ADsP 스터디 1기', '/img/projects/adsp-board.png', '/projects/?p=2026-07-24-bapzzi-adsp-board', '1기 완주'],
  ['KWU ERP Club Site', '/img/projects/erpclub-site.png', '/projects/?p=2026-07-24-bapzzi-erpclub-site', '운영 중'],
]

// ROADMAP — 브랜치 계보(오너 2026-08-07: "지그재그보다 브랜치 형태로").
// 서사 = ERP연구회 본류에 SAP 특강이 이어져 오다가, AI 화두로 AIM을 분기 신설, 그 기반으로 ADsP 스터디 운영.
// lane: trunk = 본류(차콜 선) / fork = 분기점(곡선으로 갈라짐) / branch = 분기 이후(버건디 선).
const LINEAGE = [
  { era: 'ORIGIN', title: 'ERP연구회', desc: '경영학부 MIS 스터디 — ERP·정보시스템의 뿌리.', lane: 'trunk' },
  { era: 'SAP ERA', title: 'SAP 특강', desc: '실무 컨설턴트가 이끈 MM·ABAP 교육 — 이어져 온 본류.', lane: 'trunk' },
  // 모집 칩 = 하드코딩 금지(검수 2026-08-13 — 8/25 이후 모집 밴드와 모순 예약) → recruitChip = 국면 파생.
  { era: '2026 · NEW BRANCH', title: 'MIS·AI 스터디', desc: 'AI가 화두로 떠오르며 본류에서 분기 — AIM 신설.', recruitChip: true, lane: 'fork' },
  { era: 'FIRST RUN', title: 'ADsP 스터디 1기', desc: 'AIM 기반으로 진행해 본 첫 운영 — 데이터분석 준전문가 대비, 진도 보드 운영.', status: ['planned', '1기 완주'], lane: 'branch' },
  { era: 'NEXT', title: '앞으로 채워갈 공간', desc: '새 트랙·기수가 이어질 자리.', slot: true, lane: 'branch' },
]

// FAQ 원천 = data/faq.js(E4 공용화 2026-08-05) — 메인은 전체 렌더, /recruit는 서브셋.

// 히어로 — 정중앙 대형 AIM + 문장형 정체 설명. 배경 = 추상 모션 그래픽(블롭 3개, CSS만 — 이미지 파일 0).
// 정체성 아이콘은 스터디 구상 확정 후로 미룸(피드백 합의) — 그때 이 블롭 레이어만 교체한다.
// AIM 뒤 움직이는 배경(피드백 2026-08-06 2차 — 포인터 추적 글로우는 "강조 하지마"로 제거):
// 자율 모션만 = 느린 궤도 점 2개(.ho — 40s·64s 역방향) + 중앙 소프트 펄스(.ho-pulse 12s).
// 전부 CSS 애니메이션·transform만·reduced-motion 정지 — "정신사납지 않게" = 저채도·저속.
function Hero() {
  return (
    <section className="hs hs-hero page" id="top">
      <div className="hero-bg" aria-hidden="true">
        <span className="hb hb-1" />
        <span className="hb hb-2" />
        <span className="hb hb-3" />
      </div>
      <div className="hero-orbit" aria-hidden="true">
        <span className="ho ho-1" />
        <span className="ho ho-2" />
        <span className="ho-pulse" />
      </div>

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
        <p className="hero-sub rv" style={{ transitionDelay: '640ms' }}>
          광운대학교 ERP연구회 산하 MIS·AI 스터디
        </p>
        <p className="hero-desc rv" style={{ transitionDelay: '800ms' }}>
          경영·MIS의 업무와 학업에 AI를 붙이는 법을 연구합니다.
        </p>
      </div>
    </section>
  )
}

// 모집 섹션 — 블랙 스탯 밴드 직하(피드백: "집계 밑에 1기 모집을 강조"). 3국면 전부 렌더(SPEC §4).
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
        {/* Primary CTA(§4 위계) — 메인의 유일한 Primary(차콜 필 + 버건디 원형 화살표). */}
        <a className="rc-cta-xl rb-cta" href="/recruit/">{ctaLabel} <Arrow /></a>
      </div>
    </section>
  )
}

// B1 블랙 통계 밴드 — 잉크 대면적 + 흰 숫자 1×3. 4차: 중앙 정렬 + 버건디 언더바 폐지(피드백 "작대기 삭제").
// 수치 = 실측만(content/ 집계 + 확인된 사실). 출처 = 셀별 소형 표기(§6 수치 출처 의무).
// 0건 지표(세미나 등)는 싣지 않는다 — 있는 기록만, 과장·허수 0.
export function StatsBand({ today = localYmd() }) {
  const 기사수 = loadContent('기사').length
  const cells = [
    [String(기사수), '게재 기사', 'content/ 집계'],
    ['2', '만든 실물', '진도 보드(1기 아카이브) · 이 사이트'], // '라이브' 표기 = 보드 아카이브 전환으로 폐지(검수 2026-08-13)
    studyCell(today),
  ]
  return (
    <section className="stats-band" aria-label="운영 실측 수치">
      <div className="sb-in">
        <span className="sb-kicker">RECORD</span>
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


// ROADMAP — 브랜치 계보(오너 2026-08-07: 지그재그 → git 그래프형 분기).
// 행 = [레인 셀 | 카드]. 레인 셀이 선을 그린다: 본류 세로선(차콜, 분기 후엔 옅게 지속 — 연구회 본류는 계속 존재)
// + 분기 곡선(fork 행, 버건디) + 브랜치 세로선(버건디). 노드 점 = .rm-dot(화이트리스트 ⑦).
// 모션 = 항목별 스크롤 리빌(useItemReveal) 유지. 상태 칩 = 별도 행(.rm-status).
export function Roadmap({ today = localYmd() }) {
  useItemReveal('.rm-item')
  const phase = recruitPhase(today)
  return (
    <section className="hs hs-roadmap page" id="roadmap">
      <div className="hs-in">
        <SectionHead label="ROADMAP" title={<>스터디 <em>로드맵</em></>} />
        <ol className="rm">
          {LINEAGE.map((n) => {
            // recruitChip = 모집 밴드와 같은 국면 원천(RECRUIT_COPY) 재사용 — 한 화면 내 표기 모순 0.
            const status = n.recruitChip ? RECRUIT_COPY[phase] : n.status
            return (
              <li className={`rm-item rm-${n.lane}${n.slot ? ' rm-slot' : ''}`} key={n.title}>
                <span className="rm-lane" aria-hidden="true"><i className="rm-dot" /></span>
                <div className="rm-card">
                  <span className="rm-era">{n.era}</span>
                  <span className="rm-word">{n.title}</span>
                  <span className="rm-desc">{n.desc}</span>
                  {status && (
                    <span className="rm-status">
                      <span className={`status ${status[0]}`}>{status[1]}</span>
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

// PROJECTS — 2열 커버 카드(피드백: 세로 나열 폐지 — "양쪽으로·한눈에").
function Projects() {
  return (
    <section className="hs hs-projects page" id="projects">
      <div className="hs-in">
        <SectionHead label="PROJECTS" title={<><em>프로젝트</em></>} />
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
        <p className="hs-more rv" style={{ transitionDelay: '260ms' }}>
          <a className="btn-2nd" href="/projects/">전체 아카이브 <Arrow /></a>
        </p>
      </div>
    </section>
  )
}

// FAQ — 아코디언(4차: 질문 타이포 축소 — 피드백 "글씨가 너무 크다").
function Faq() {
  return (
    <section className="hs hs-faq page" id="faq">
      <div className="hs-in">
        <SectionHead label="FAQ" title={<>묻고 <em>답하기</em></>} />
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
      <SiteNav cta />
      <main id="main" className="home">
        <Hero />
        <StatsBand />
        <RecruitBand />
        <Roadmap />
        <Projects />
        <Faq />
        <HomeInsights />
      </main>
      <SiteFooter />
    </>
  )
}
