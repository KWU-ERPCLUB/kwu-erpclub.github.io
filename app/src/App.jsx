// 문안 원천: erp-club/docs/문안-메인.md (2차) — 자리표시: {스터디명}·{지원폼URL}·{포폴URL}
// 시각 문법: NFT Ambassador 레퍼런스 이식(디자인규칙 §1), 색=3+1 팔레트
const FORM_URL = '#' // {지원폼URL} 확정 시 교체
const PORTFOLIO_URL = '#' // {포폴URL} 확정 시 교체
const REPO_URL = 'https://github.com/KWU-ERPCLUB/kwu-erpclub.github.io'

const STATS = [
  { num: '62.8%', label: '500대 기업 중 하반기 대졸 채용 계획 없음·미정', src: '한국경제인협회 2025' },
  { num: '81.6%', label: '신입 채용 1순위 평가요소 = 직무 경험', src: '한국경영자총협회 2025' },
  { num: '69.2%', label: '채용 시 AI 역량 고려 · 원하는 인재 1위는 기획·운영', src: '대한상공회의소 2025' },
]

const TRACKS = [
  { idx: '01', title: '포트폴리오 제작·배포', desc: 'AI와 함께 각자 포트폴리오 사이트를 만들어 무료 스택으로 배포합니다.' },
  { idx: '02', title: 'git 협업', desc: '버전 관리와 코드 리뷰를 현업 방식 그대로 사용합니다.' },
  { idx: '03', title: '경영 문제 프로젝트', desc: '기본기를 갖춘 뒤 실제 경영 문제 하나를 시스템으로 풉니다. 공모전·SAP 트랙으로 연결됩니다.', accent: true },
]

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 12L12 2M12 2H4.5M12 2V9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function App() {
  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <a className="brand" href="#top">KWU <em>ERP</em>연구회</a>
          <nav className="nav-links" aria-label="본문 섹션">
            <a href="#why">왜 지금인가</a>
            <a href="#tracks">과정</a>
            <a href="#proof">결과물</a>
            <a href="#join">모집</a>
          </nav>
          <a className="nav-cta" href={FORM_URL}>지원하기</a>
        </div>
      </header>

      <main id="top">
        <section className="section hero">
          <div>
            <span className="pill-label">광운대학교 ERP연구회 · 1기 모집</span>
            <h1><em>포트폴리오</em>를 만들어<br />배포하는 스터디</h1>
            <p className="hero-sub">AI와 함께 내 포트폴리오 사이트를 직접 만들어 배포합니다.</p>
            <div className="chips">
              <span className="chip">경영학부 대상</span>
              <span className="chip">코딩 경험 불필요</span>
              <span className="chip">비용 0원</span>
            </div>
            <a className="cta" href={FORM_URL}>
              지원하기 <span className="arrow"><Arrow /></span>
            </a>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="frame frame--navy" />
            <div className="frame frame--outline" />
            <div className="frame frame--dot" />
            <div className="mock">
              <div className="mock-bar">
                <span className="dot" /><span className="dot" /><span className="dot" />
                <span className="mock-url">kwu-erpclub.github.io</span>
              </div>
              <div className="mock-body">
                <div className="mock-h" />
                <div className="mock-l w80" />
                <div className="mock-l" />
                <div className="mock-l w55" />
                <div className="mock-cta" />
              </div>
            </div>
            <span className="float-chip float-chip--1">AI 협업</span>
            <span className="float-chip float-chip--2">git 버전 관리</span>
            <span className="float-chip float-chip--3">무료 배포</span>
          </div>
        </section>

        <section className="section stats" id="why" aria-label="채용 시장 조사 수치">
          {STATS.map((s) => (
            <div className="stat-pill" key={s.num}>
              <span className="stat-icon" aria-hidden="true">%</span>
              <span>
                <span className="stat-num">{s.num}</span>
                <span className="stat-label">{s.label}</span>
                <span className="stat-src">{s.src}</span>
              </span>
            </div>
          ))}
        </section>

        <section className="section" id="tracks">
          <span className="pill-label">한 학기 과정</span>
          <h2 className="headline">세 가지를 <em>합니다</em></h2>
          <div className="grid3">
            {TRACKS.map((t) => (
              <div className={t.accent ? 'track-card track-card--accent' : 'track-card'} key={t.idx}>
                <span className="idx">{t.idx}</span>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="proof">
          <span className="pill-label">결과물</span>
          <h2 className="headline">같은 방식으로 만든 <em>두 개</em></h2>
          <div className="grid2">
            <div className="proof-card">
              <h3>운영자 포트폴리오</h3>
              <p>이 스터디에서 만들게 될 것의 원형입니다.</p>
              <a className="proof-link" href={PORTFOLIO_URL}>보기 <Arrow /></a>
            </div>
            <div className="proof-card">
              <h3>이 사이트</h3>
              <p>이 페이지도 같은 방식(AI 협업 · git · 무료 배포)으로 제작했습니다.</p>
              <a className="proof-link" href={REPO_URL}>GitHub 저장소 <Arrow /></a>
            </div>
          </div>
          <div className="repo-bar">
            <span className="repo-url">github.com/KWU-ERPCLUB</span>
            <a className="cta" href={REPO_URL}>
              제작 과정 보기 <span className="arrow"><Arrow /></span>
            </a>
          </div>
          <p className="owner-note">
            운영 — 신해원 · 광운대 경영학부 · LG CNS AM Inspire Camp 6기 선발(고용노동부 K-디지털 트레이닝)
          </p>
        </section>

        <section className="section join" id="join">
          {/* {스터디명} 확정 시 헤드라인에 반영 */}
          <span className="pill-label">모집</span>
          <h2 className="headline">1기 <em>모집</em></h2>
          <div className="chips">
            <span className="chip">모집 인원 미정</span>
            <span className="chip">노트북 지참</span>
          </div>
          <a className="cta" href={FORM_URL}>
            지원하기 <span className="arrow"><Arrow /></span>
          </a>
        </section>
      </main>

      <footer className="footer">광운대학교 ERP연구회</footer>
    </>
  )
}
