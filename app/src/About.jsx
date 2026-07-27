// /about 2차 구조 개혁(2026-07-25): 중앙 셀(.lattice/.cell) 폐지 → 풀블리드 스크린 섹션(App/home 문법 재사용).
// ① 누구인가 = 대형 타이포 도입 + 가로 진행 타임라인(.rmap) ② 왜 지금인가 = 4단 서사 대형 블록 + BarFig(크기 상향)
// ③ 운영 증빙 = 대형 숫자 풀폭 행 + 카운트업(.stat-rows). 콘텐츠·수치·출처 전부 유지(구조만 개혁). 사람 표기 없음.
// 모션 = home-motion 재사용(스크롤 리빌 .rv + 카운트업) · transform·opacity만 · reduced-motion 존중.
import { useMemo } from 'react'
import { SiteNav, SiteFooter, REPO_URL } from './shared.jsx'
import { loadContent } from './content/loader.js'
import { useSectionSpy, CountUp } from './home-motion.jsx'

// 계보 타임라인 — 학회 → 산하 스터디 신설 → 1기 모집(가로 진행). 사실 유지.
const TIMELINE = [
  { era: '학회', title: 'ERP연구회', desc: '경영학부에서 SAP·ERP·정보시스템을 공부해온 학회.' },
  { era: '2026 · 확장', title: '산하 스터디 신설', desc: 'MIS·AI 갈래 분기.' },
  { era: '지금', title: '1기 모집 준비', desc: '스터디명·인원 확정 대기.', status: ['prep', '모집 준비'] },
]

// 4단 서사 — 수치·출처 원본 유지(선행조사-2026-07-10 §C·§D). 강조 바 1개(버건디)+회색 대조.
const FACTS = [
  {
    idx: '01',
    claim: '생성형 AI 경험률',
    sub: '20대 = 전 연령 최고.',
    src: '과학기술정보통신부 · 2025 인터넷이용실태조사',
    chart: {
      caption: '생성형 AI 경험률',
      max: 100,
      rows: [
        { label: '20대', value: 75.3, display: '75.3%', accent: true },
        { label: '국민 전체', value: 44.5, display: '44.5%' },
      ],
    },
  },
  {
    idx: '02',
    claim: '직장인 활용 용도',
    sub: '1위 = 정보 검색·요약.',
    src: '나우앤서베이 · 직장인 1,000명 조사, 2025',
    chart: {
      caption: '직장인의 AI 활용 용도',
      max: 100,
      rows: [
        { label: '정보 검색·요약', value: 75.3, display: '75.3%', accent: true },
        { label: '문서 작성', value: 44.9, display: '44.9%' },
      ],
    },
  },
  {
    idx: '03',
    claim: 'AI 도입 후 생산성',
    sub: '처리량 증가 — 신입이 평균의 두 배 이상.',
    src: 'Brynjolfsson 외 · NBER w31161, 2023 (상담원 5,179명)',
    chart: {
      caption: '시간당 업무 처리량 증가',
      max: 40,
      rows: [
        { label: '신입·저숙련', value: 34, display: '+34%', accent: true },
        { label: '전체 평균', value: 14.5, display: '+14~15%' },
      ],
    },
  },
]

// 비교 바 차트 — 강조 패턴(버건디 1색 + 회색), 전 바 직접 라벨. dataviz 검증 2026-07-10.
export function BarFig({ caption, max, rows }) {
  return (
    <figure className="barfig">
      <figcaption className="fig-cap">{caption}</figcaption>
      {rows.map((r) => (
        <div className="bar-row" key={r.label}>
          <span className="bar-label">{r.label}</span>
          <div className="bar-track">
            <div
              className={r.accent ? 'bar-fill accent' : 'bar-fill'}
              style={{ width: `${(r.value / max) * 100}%` }}
            />
            <span className="bar-val">{r.display}</span>
          </div>
        </div>
      ))}
    </figure>
  )
}

// ① 누구인가 — 대형 타이포 도입 + 가로 진행 타임라인. export = 콘텐츠 무관 구조 테스트용.
export function AboutIntro() {
  return (
    <section className="hs page" id="about-top">
      <div className="hs-in">
        <span className="page-idx rv">ABOUT</span>
        <h1 className="ab-mega rv" style={{ transitionDelay: '90ms' }}>
          ERP연구회 산하 <em>MIS·AI</em> 스터디
        </h1>
        <ol className="rmap rv" style={{ transitionDelay: '280ms' }}>
          {TIMELINE.map((n) => (
            <li className="rm-node" key={n.title}>
              <span className="rm-dot" aria-hidden="true" />
              <span className="rm-era">{n.era}</span>
              <h3>{n.title}</h3>
              <p>{n.desc}</p>
              {n.status && <span className={`status ${n.status[0]}`}>{n.status[1]}</span>}
            </li>
          ))}
        </ol>
        <p className="ab-note rv" style={{ transitionDelay: '360ms' }}>
          MIS(경영정보시스템) = 경영 문제를 정보 시스템으로 푸는 전공. 그 시스템을 다루는 도구가 지금 AI로 전환 중.
        </p>
      </div>
    </section>
  )
}

// ② 왜 지금인가 — 뷰포트급 대형 헤드라인 + 4단 서사 대형 블록(대형 클레임 + BarFig 상향). export = 구조 테스트용.
export function WhyNow() {
  return (
    <section className="hs page" id="why-now">
      <div className="hs-in">
        <span className="page-idx rv">DATA</span>
        <h2 className="ab-claim-mega rv" style={{ transitionDelay: '90ms' }}>
          숫자로 본 <em>배경</em>
        </h2>
        <div className="ab-why-list rv" style={{ transitionDelay: '180ms' }}>
          {FACTS.map((f) => (
            <div className="ab-why-block" key={f.idx}>
              <div>
                <span className="feat-idx ab-why-idx">{f.idx}</span>
                <h3 className="ab-why-claim">{f.claim}</h3>
                <p className="ab-why-sub">{f.sub}</p>
                <p className="stat-src">{f.src}</p>
              </div>
              <BarFig {...f.chart} />
            </div>
          ))}

        </div>
      </div>
    </section>
  )
}

// ③ 운영 증빙 — 대형 숫자 풀폭 행 + 카운트업(메인 WHY 문법). 실측 정량만 + 출처. export = 구조 테스트용.
export function Proof({ proof }) {
  return (
    <section className="hs hs-proof page" id="proof">
      <div className="hs-in">
        <span className="page-idx rv">PROOF</span>
        <h2 className="hs-title rv" style={{ transitionDelay: '90ms' }}>기록으로 <em>남긴 것</em></h2>
        <div className="stat-rows rv" style={{ transitionDelay: '180ms' }}>
          {proof.map((p) => (
            <div className="stat-row" key={p.label}>
              <CountUp value={p.num} />
              <div>
                <span className="stat-row-label">{p.label}</span>
                <span className="stat-row-src">{p.src}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="ab-note rv" style={{ transitionDelay: '260ms' }}>
          운영 = 광운대 경영학부 21학번. 모집은 비정기 — 문의는 스터디 단톡방 또는{' '}
          <a className="proof-link" style={{ display: 'inline' }} href={REPO_URL}>GitHub 저장소</a>로.
        </p>
      </div>
    </section>
  )
}

export default function About() {
  useSectionSpy()
  // 운영 증빙 — 실측 정량만(콘텐츠 건수는 content/에서 집계, 나머지는 확인된 사실)
  const articleCount = useMemo(() => loadContent('기사').length, [])
  const seminarCount = useMemo(() => loadContent('세미나').length, [])
  const PROOF = [
    { num: '1', label: '진행 중 스터디', src: 'ADsP 1기 — 진도 보드로 운영' },
    { num: '2', label: '라이브 실물', src: 'ADsP 진도 보드 · 이 사이트 (KWU-ERPCLUB 저장소)' },
    { num: String(articleCount + seminarCount), label: '게재된 기사·세미나', src: 'content/ 집계 (기사 ' + articleCount + ' · 세미나 ' + seminarCount + ')' },
  ]
  return (
    <>
      <SiteNav />
      <main className="home">
        <AboutIntro />
        <WhyNow />
        <Proof proof={PROOF} />
      </main>
      <SiteFooter />
    </>
  )
}
