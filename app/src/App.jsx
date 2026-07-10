// 문안 원천: erp-club/docs/문안-메인.md (6차 §hub — 사이트 목적 개정: 모집 간판→통합 허브)
// 메인(/) = 스터디·프로젝트·결과물 링크 허브(v1 정적). 모집=/join, 소개=/about
// 시각 문법: Tars SaaS 격자 레이아웃(디자인규칙 3차), 색=버건디 최소+흰색+차콜
import { Arrow, SiteNav, SiteFooter, PORTFOLIO_URL, REPO_URL } from './shared.jsx'

const ADSP_BOARD_URL = 'https://erpstudy.vercel.app'

const STATUS_LABEL = { live: '진행중', prep: '모집 준비', planned: '예정' }

const STUDIES = [
  {
    title: 'ADsP 1기',
    desc: '데이터분석 준전문가(제50회) 대비 스터디. 진도·성취도를 보드로 관리합니다.',
    status: 'live',
    dark: true,
    links: [['진도 보드', ADSP_BOARD_URL]],
  },
  {
    title: 'MIS·AI 스터디 1기',
    desc: '비개발자가 AI를 어떻게 더 잘 활용할지 연구하고, 결과를 실물로 남깁니다.',
    status: 'prep',
    links: [['소개', '/about/'], ['모집 안내', '/join/']],
  },
  {
    title: 'SQLD',
    desc: 'SQL 개발자 자격 대비 스터디.',
    status: 'planned',
    links: [],
  },
]

const PROJECTS = [
  { title: 'SAP 트랙', desc: '실서버 실습 중심의 심화 과정.', status: 'planned', links: [] },
  { title: '공모전', desc: '공공데이터×AI 공모전 출품 프로젝트.', status: 'planned', links: [] },
]

const WORKS = [
  {
    title: '이 사이트',
    desc: '허브·모집 페이지 자체가 결과물입니다 — AI 협업 · git · 무료 배포.',
    status: 'live',
    links: [['GitHub', REPO_URL]],
  },
  {
    title: '운영자 포트폴리오',
    desc: '스터디에서 만들게 될 것의 원형. 제작 중입니다.',
    status: 'prep',
    links: [['보기', PORTFOLIO_URL]],
  },
  {
    title: '스터디원 결과물',
    desc: 'MIS·AI 스터디 1기 시작 후 이 자리에 모입니다.',
    status: 'planned',
    links: [],
  },
]

function HubCard({ item }) {
  return (
    <div className={item.dark ? 'cell-dark' : undefined} style={{ textAlign: 'left' }}>
      <span className={`status ${item.status}`}>{STATUS_LABEL[item.status]}</span>
      <h3>{item.title}</h3>
      <p>{item.desc}</p>
      {item.links.length > 0 && (
        <div className="card-links">
          {item.links.map(([label, href]) => (
            <a className="proof-link" key={label} href={href}>{label} <Arrow /></a>
          ))}
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <>
      <SiteNav />

      <main id="top" className="lattice">
        <section className="cell hero center hero-hub">
          <span className="eyebrow">광운대학교 경영학부</span>
          <h1><em>ERP</em>연구회</h1>
          <p className="hero-sub">스터디 · 프로젝트 · 결과물을 한곳에서 봅니다.</p>
        </section>

        <section className="cell center" id="studies">
          <span className="eyebrow">스터디</span>
          <h2 className="headline">지금 <em>돌아가는</em> 것</h2>
          <div className="row3">
            {STUDIES.map((s) => <HubCard key={s.title} item={s} />)}
          </div>
        </section>

        <section className="cell center" id="projects">
          <span className="eyebrow">프로젝트</span>
          <h2 className="headline">다음 <em>단계</em></h2>
          <div className="row2">
            {PROJECTS.map((p) => <HubCard key={p.title} item={p} />)}
          </div>
        </section>

        <section className="cell center" id="works">
          <span className="eyebrow">결과물</span>
          <h2 className="headline">남긴 <em>실물</em></h2>
          <div className="row3">
            {WORKS.map((w) => <HubCard key={w.title} item={w} />)}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
