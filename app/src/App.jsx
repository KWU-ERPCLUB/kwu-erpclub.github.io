// 문안 원천: erp-club/docs/문안-메인.md (3차 — 정체성: MIS·AI 연구, 포폴=콘텐츠 1호)
// 시각 문법: Tars SaaS 격자 레이아웃(디자인규칙 3차), 색=버건디 최소+흰색+차콜
const FORM_URL = '#' // {지원폼URL} 확정 시 교체
const PORTFOLIO_URL = '#' // {포폴URL} 확정 시 교체
const REPO_URL = 'https://github.com/KWU-ERPCLUB/kwu-erpclub.github.io'

const STATS = [
  { num: '62.8%', label: '500대 기업 중 하반기 대졸 채용 계획 없음·미정', src: '한국경제인협회 2025' },
  { num: '81.6%', label: '신입 채용 1순위 평가요소 = 직무 경험', src: '한국경영자총협회 2025' },
  { num: '69.2%', label: '채용 시 AI 역량 고려 · 원하는 인재 1위는 기획·운영', src: '대한상공회의소 2025' },
]

const TRACKS = [
  { idx: '01', title: 'AI 활용 연구', desc: '비개발자 관점에서 AI 도구와 워크플로를 공부하고 기록합니다.' },
  { idx: '02', title: '실물 제작·배포', desc: '포트폴리오 사이트를 만들고 git으로 협업하며 무료 스택으로 배포합니다.' },
  { idx: '03', title: '경영 문제 프로젝트', desc: 'MIS·ERP 관점에서 실제 경영 문제를 시스템으로 풉니다. 공모전·SAP 트랙으로 연결됩니다.', dark: true },
]

function Arrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
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

      <main id="top" className="lattice">
        <section className="cell hero center">
          <span className="eyebrow">광운대학교 ERP연구회 산하 스터디 · 1기</span>
          <h1>MIS와 <em>AI</em>를 함께<br />공부하는 경영학부 스터디</h1>
          <p className="hero-sub">비개발자가 AI를 어떻게 더 잘 활용할지 연구하고, 결과를 실물로 남깁니다.</p>
          <a className="cta" href={FORM_URL}>
            지원하기 <span className="arrow"><Arrow /></span>
          </a>
          <div className="hero-cols">
            <div className="hero-col">
              <h3>ERP연구회</h3>
              <p>SAP·ERP를 다뤄온 경영학부 학회의 다음 챕터입니다.</p>
            </div>
            <div className="hero-col">
              <h3>첫 콘텐츠</h3>
              <p>각자 포트폴리오 사이트를 만들어 무료 스택으로 배포합니다.</p>
            </div>
          </div>
        </section>

        <section className="cell center" id="why">
          <span className="eyebrow">왜 지금인가</span>
          <h2 className="headline">2025년, 세 개의 <em>조사</em></h2>
          <div className="row3" aria-label="채용 시장 조사 수치">
            {STATS.map((s) => (
              <div key={s.num} style={{ textAlign: 'left' }}>
                <span className="stat-num">{s.num}</span>
                <span className="stat-label">{s.label}</span>
                <span className="stat-src">{s.src}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="cell center" id="tracks">
          <span className="eyebrow">한 학기 과정</span>
          <h2 className="headline">세 가지를 <em>합니다</em></h2>
          <div className="row3">
            {TRACKS.map((t) => (
              <div className={t.dark ? 'cell-dark' : undefined} key={t.idx} style={{ textAlign: 'left' }}>
                <span className="feat-idx">{t.idx}</span>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cell" id="proof">
          <div className="center">
            <span className="eyebrow">결과물</span>
            <h2 className="headline">같은 방식으로 만든 <em>두 개</em></h2>
          </div>
          <div className="grid2">
            <div className="proof-dark">
              <div>
                <h3>이 사이트</h3>
                <p>이 페이지도 같은 방식(AI 협업 · git · 무료 배포)으로 제작했습니다.</p>
              </div>
              <div className="mock" aria-hidden="true">
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
              <a className="proof-link" href={REPO_URL}>GitHub 저장소 <Arrow /></a>
            </div>
            <div className="proof-light">
              <h3>운영자 포트폴리오</h3>
              <p>이 스터디에서 만들게 될 것의 원형입니다.</p>
              <a className="proof-link" href={PORTFOLIO_URL}>보기 <Arrow /></a>
            </div>
          </div>
          <div className="repo-bar">
            <span className="repo-url">github.com/KWU-ERPCLUB</span>
            <a className="cta" href={REPO_URL}>
              제작 과정 보기 <span className="arrow"><Arrow /></span>
            </a>
          </div>
          <p className="owner-note">
            운영 — 신해원 · 광운대 경영학부 21학번
          </p>
        </section>

        <section className="cell join center" id="join">
          {/* {스터디명} 확정 시 헤드라인에 반영 */}
          <span className="eyebrow">모집</span>
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

      <footer className="footer">
        <div className="footer-inner">
          <span className="f-brand">광운대학교 ERP연구회</span>
          <a href={REPO_URL}>GitHub</a>
        </div>
      </footer>
    </>
  )
}
