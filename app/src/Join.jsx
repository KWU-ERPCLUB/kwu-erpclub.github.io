// 문안 원천: erp-club/docs/문안-메인.md (6차 — 구 메인 5섹션이 /join으로 이동. §2=존재 의의 밴드+/about 링크)
// 시각 문법: Tars SaaS 격자 레이아웃(디자인규칙 3차), 색=버건디 최소+흰색+차콜
import { Arrow, SiteNav, SiteFooter, REPO_URL } from './shared.jsx'

const ADSP_BOARD_URL = 'https://erpstudy.vercel.app'

const TRACKS = [
  { idx: '01', title: 'AI 활용 연구', desc: '비개발자 관점에서 AI 도구와 워크플로를 공부하고 기록합니다.' },
  { idx: '02', title: '하위 프로젝트 실전', desc: 'ADsP·공모전 프레임워크 같은 하위 프로젝트를 AI로 함께 진행합니다. git으로 협업하고 무료 스택으로 배포합니다.' },
  { idx: '03', title: '경영 문제로 확장', desc: 'MIS·ERP 관점에서 실제 경영 문제를 시스템으로 풉니다. 공모전·SAP 트랙으로 연결됩니다.', dark: true },
]

export default function Join() {
  return (
    <>
      <SiteNav />

      <main id="top" className="lattice">
        <section className="cell hero center">
          <span className="eyebrow">광운대학교 ERP연구회 산하 스터디 · 1기</span>
          <h1>MIS와 <em>AI</em>를 함께<br />공부하는 경영학부 스터디</h1>
          <p className="hero-sub">비개발자가 AI를 어떻게 더 잘 활용할지 연구하고, 결과를 실물로 남깁니다.</p>
          <div className="hero-cols">
            <div className="hero-col">
              <h3>ERP연구회</h3>
              <p>SAP·ERP를 다뤄온 경영학부 학회의 다음 챕터입니다.</p>
            </div>
            <div className="hero-col">
              <h3>함께 하는 일</h3>
              <p>AI 활용을 연구하고, ADsP·공모전 같은 하위 프로젝트를 함께 진행합니다.</p>
            </div>
          </div>
        </section>

        <section className="cell center why-band" id="why">
          <p className="why-line">쓰는 사람은 많지만,<br />잘 쓰는 법을 배우는 자리는 없습니다.</p>
          <a className="proof-link" href="/about/">왜 지금인가 <Arrow /></a>
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
              <h3>ADsP 진도 보드</h3>
              <p>스터디 진도·성취도를 관리하는 웹앱. 같은 방식으로 만들어 ADsP 1기가 쓰고 있습니다.</p>
              <a className="proof-link" href={ADSP_BOARD_URL}>열어보기 <Arrow /></a>
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
          {/* 지원하기 CTA 보류(owner 2026-07-10) — 지원 도구 확정 시 재도입 */}
          <p className="join-note">모집 안내는 확정되는 대로 이 페이지에 공지합니다.</p>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
