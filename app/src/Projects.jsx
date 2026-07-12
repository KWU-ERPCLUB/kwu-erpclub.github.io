// 외부 공개 페이지: 프로젝트 아카이브(/projects/) — 사이트 이원 구조(owner 2026-07-11)의 외부 축.
// 용도: 유입 마케팅이 아니라 "스터디원이 본인 기여를 한눈에 제시"하는 증빙 아카이브.
// 확인된 사실만 기재. 기여자 표기는 대외 이력 규칙 준수(개인 이력 상세 금지 — 운영진/기수 단위)
import { Arrow, SiteNav, SiteFooter, REPO_URL } from './shared.jsx'

const ADSP_BOARD_URL = 'https://erpstudy.vercel.app'

const NOW = [
  ['live', '진행중', 'ADsP 스터디 1기 — 제50회 대비, 진도 보드로 운영'],
  ['prep', '모집 준비', 'MIS·AI 스터디 1기 — 스터디명·인원 확정 대기'],
  ['prep', '준비', '공모전 프레임워크 — 공모전 워크프로세스를 효율화하는 재사용 틀'],
]

// [제목, 연도, 설명, 기여, 상태(label class), 링크들]
const ARCHIVE = [
  {
    title: 'ADsP Study Board',
    year: '2026',
    desc: '스터디 진도·성취도를 관리하는 웹앱. ADsP 1기가 사용 중입니다.',
    by: '운영진 제작 · ADsP 1기 사용',
    status: ['live', '운영 중'],
    links: [['열어보기', ADSP_BOARD_URL]],
  },
  {
    title: 'KWU ERP Club Site',
    year: '2026',
    desc: '이 사이트. 연구회의 간판이자 기록 그릇 — AI 협업 · git · 무료 배포로 제작.',
    by: '운영진 제작 · 소스 공개',
    status: ['live', '운영 중'],
    links: [['GitHub 소스', REPO_URL]],
  },
]

export default function Projects() {
  return (
    <>
      <SiteNav />

      <main className="lattice">
        <section className="cell center">
          <span className="eyebrow">PROJECTS · ARCHIVE</span>
          <h1 className="headline">만든 <em>실물</em>의 기록</h1>
          <p className="mis-note" style={{ marginTop: 0 }}>
            연구회가 만들고 배포한 것들을 모아둡니다. 스터디원은 이 페이지로
            본인이 기여한 부분을 한눈에 제시할 수 있습니다.
          </p>
        </section>

        <section className="cell center" id="now">
          <span className="eyebrow">NOW</span>
          <h2 className="headline">지금 <em>진행 중</em></h2>
          <div className="next-list" style={{ marginTop: 0 }}>
            {NOW.map(([status, label, text]) => (
              <div className="dir-row" key={text}>
                <span className={`status ${status}`}>{label}</span>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cell center" id="archive">
          <span className="eyebrow">ARCHIVE</span>
          <h2 className="headline">아카이브</h2>
          <div className="row3">
            {ARCHIVE.map((p) => (
              <div key={p.title} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className={`status ${p.status[0]}`}>{p.status[1]}</span>
                <h3>{p.title} <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-sub)' }}>{p.year}</span></h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-sub)' }}>{p.desc}</p>
                <p style={{ margin: '0.6rem 0 0', fontSize: '0.78rem', color: 'var(--text-sub)' }}>{p.by}</p>
                {p.links.length > 0 && (
                  <div className="card-links">
                    {p.links.map(([label, href]) => (
                      <a className="proof-link" key={label} href={href}>{label} <Arrow /></a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="data-note" style={{ marginTop: '1.5rem' }}>
            결과물은 각 제작자 소유입니다. 저장소·배포 링크가 증빙을 대신합니다.
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
