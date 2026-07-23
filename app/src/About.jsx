// 문안 원천: erp-club/docs/문안-메인.md (5차 §about — ①누구인가=계보+MIS 현재형 ②왜 지금인가=4단 서사+스탯 차트)
// 수치·출처 단일원천: erp-club/docs/선행조사-2026-07-10.md §C·§D
// 차트: 강조 패턴(버건디 1색+회색) — 팔레트 검증 2026-07-10(대비·CVD 통과, 전 바 직접 라벨)
// IA 2차(2026-07-23): join 흡수 — 운영 증빙(실측 정량, 전 항목 출처) + 모집 문의 사실 1줄
import { useMemo } from 'react'
import { Arrow, SiteNav, SiteFooter, REPO_URL } from './shared.jsx'
import { loadContent } from './content/loader.js'

const TIMELINE = [
  { era: '학회', title: 'ERP연구회', desc: '광운대학교 경영학부에서 SAP·ERP를 공부해온 학회.' },
  { era: '2026 · 확장', title: '산하 스터디 신설', desc: '주제 확장 — 경영·MIS에 AI를 어떻게 접목할 것인가.' },
  { era: '지금', title: '1기 모집', desc: '비개발자의 AI 활용 연구 — 결과는 실물로.' },
]

const FACTS = [
  {
    idx: '01',
    claim: '다들 쓴다',
    sub: '20대 4명 중 3명이 이미 생성형 AI 경험 — 전 연령 최고.',
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
    claim: '그런데 얕게 쓴다',
    sub: '직장인 활용 용도 1위 = 정보 검색·요약 — 활용이 여기에 편중.',
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
    claim: '잘 쓰면 실제로 다르다 — 특히 초보자가',
    sub: 'AI 도입 후 처리량 증가, 신입이 평균의 두 배 이상.',
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

function BarFig({ caption, max, rows }) {
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

export default function About() {
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

      <main className="lattice">
        <section className="cell center">
          <span className="eyebrow">소개</span>
          <h2 className="headline">누구인가</h2>
          <div className="tl">
            {TIMELINE.map((n) => (
              <div key={n.title}>
                <span className="tl-era">{n.era}</span>
                <h3>{n.title}</h3>
                <p>{n.desc}</p>
              </div>
            ))}
          </div>
          <p className="mis-note">
            MIS(경영정보시스템) = 경영 문제를 정보 시스템으로 푸는 전공.
            그 시스템을 다루는 도구가 지금 AI로 전환 중.
          </p>
        </section>

        <section className="cell" id="why-about">
          <div className="center">
            <span className="eyebrow">왜 지금인가</span>
            <h2 className="headline">쓰는 사람은 많지만,<br />잘 쓰는 법을 배우는 자리는 <em>없다</em></h2>
          </div>

          {FACTS.map((f) => (
            <div className="why-block" key={f.idx}>
              <div>
                <span className="feat-idx">{f.idx}</span>
                <h3>{f.claim}</h3>
                <p className="why-sub">{f.sub}</p>
                <p className="stat-src">{f.src}</p>
              </div>
              <BarFig {...f.chart} />
            </div>
          ))}

          <div className="why-block why-final">
            <div>
              <span className="feat-idx">04</span>
              <h3>그래서 이 스터디</h3>
              <p className="why-sub">
                경영·MIS 맥락에서 잘 쓰는 법 연구 — 결과는 실물로 증명.
              </p>
            </div>
            <div className="why-cta">
              <a className="proof-link" href={REPO_URL}>GitHub 저장소 <Arrow /></a>
            </div>
          </div>
        </section>

        <section className="cell center" id="proof">
          <span className="eyebrow">운영 증빙</span>
          <h2 className="headline">기록으로 <em>남긴 것</em></h2>
          <div className="row3">
            {PROOF.map((p) => (
              <div key={p.label} style={{ textAlign: 'left' }}>
                <span className="stat-num">{p.num}</span>
                <span className="stat-label">{p.label}</span>
                <span className="stat-src">{p.src}</span>
              </div>
            ))}
          </div>
          <p className="mis-note" style={{ marginTop: '1.75rem' }}>
            운영 = 광운대 경영학부 21학번. 모집은 비정기 — 문의는{' '}
            <a className="proof-link" style={{ display: 'inline' }} href={REPO_URL}>GitHub 저장소</a>로.
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
