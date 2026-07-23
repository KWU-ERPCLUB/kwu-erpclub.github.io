// 메인(/) v3 — 섹션=페이지 강조 로직(owner 2026-07-11): 스크롤에 따라 현재 섹션만 활성(밝게)·
// 나머지 감쇠 → 세로로 이어져 있어도 "구분된 페이지"로 인식. 탭·라벨=영문 정책.
// 구성(owner 지정): WHY(하단=업계 데이터) → ROADMAP(연구회→AI 스터디 분기 시각화) → PROJECTS → FAQ
// 문안 원천: erp-club/docs/문안-메인.md. 수치=검증분만+출처(선행조사·/reports와 단일원천)
import { useEffect, useMemo, useRef } from 'react'
import { Arrow, SiteNav, SiteFooter, REPO_URL } from './shared.jsx'
import { loadContent } from './content/loader.js'

const ADSP_BOARD_URL = 'https://erpstudy.vercel.app'

const DATA = [
  ['69.2%', '채용 시 AI 역량 고려 — 인사담당자 조사 1위', '대한상공회의소 2025'],
  ['36.3%', 'AI 채용공고 최대 직무군은 개발자가 아니라 기획·설계', '한국직업능력연구원 2026'],
  ['40%', 'AI 활용 시 업무 시간 단축, 품질 평가는 +18%', 'MIT · Science 2023'],
]

const PROJECTS = [
  {
    title: 'ADsP Study Board',
    desc: 'ADsP 1기 스터디의 진도·성취도 웹앱. 지금 운영 중입니다.',
    links: [['열어보기', ADSP_BOARD_URL]],
  },
  {
    title: 'This Site',
    desc: '이 사이트 자체가 결과물입니다 — AI 협업 · git · 무료 배포.',
    links: [['GitHub 소스', REPO_URL]],
  },
]

const NEXT = [
  ['prep', '모집 준비', 'MIS·AI 스터디 1기 — 스터디명·인원 확정 대기'],
  ['planned', '준비', '공모전 프레임워크 — 공모전 워크프로세스를 효율화하는 재사용 틀'],
  ['planned', '예정', 'SQLD 스터디 · SAP Track · 공모전 출품'],
]

const FAQ = [
  ['코딩을 못해도 참여할 수 있나요?',
    '네. 경영학부 대상이고, 주제는 코딩이 아니라 AI 활용입니다. 필요한 도구 사용법은 스터디에서 함께 다룹니다.'],
  ['비용이 드나요?',
    '참가비는 없습니다. 무료 도구 스택으로 시작하고, 일부 유료 AI 도구는 선택 사항입니다.'],
  ['무엇을 만들게 되나요?',
    '각자 경영·MIS 맥락의 실물 — 배포된 웹 결과물 — 을 만듭니다. 결과물은 본인 소유입니다.'],
  ['ERP연구회와는 어떤 관계인가요?',
    'ERP연구회 산하 스터디입니다. 연구회에는 SAP 실습·공모전 심화 트랙이 있습니다.'],
  ['언제 모집하나요?',
    '모집은 비정기입니다. 문의는 소개(ABOUT) 또는 GitHub 저장소로 받습니다.'],
]

// 섹션=페이지 스파이: 뷰포트 중앙 밴드에 걸린 섹션만 활성화(시각 강조 전용 — 탭 연동은 폐지, owner 2026-07-11)
function useSectionSpy() {
  useEffect(() => {
    const pages = document.querySelectorAll('.page')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      pages.forEach((p) => p.classList.add('active'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('seen') // 한 번 활성화된 섹션은 내용 유지(비활성=감쇠만)
          pages.forEach((p) => p.classList.toggle('active', p === e.target))
        }
      }),
      { rootMargin: '-42% 0px -42% 0px', threshold: 0 },
    )
    pages.forEach((p) => io.observe(p))
    return () => io.disconnect()
  }, [])
}

// base 클래스와 병합해 rv를 부여한다(스프레드가 className을 덮어쓰는 사고 방지 — 리뷰 지적)
const rv = (i, base = '') => ({
  className: base ? `${base} rv` : 'rv',
  style: { transitionDelay: `${i * 80}ms` },
})

function Carousel() {
  const ref = useRef(null)
  const slide = (dir) => {
    const el = ref.current
    if (el) el.scrollBy({ left: dir * (el.firstChild.offsetWidth + 18), behavior: 'smooth' })
  }
  return (
    <>
      <div className="carousel" ref={ref} aria-label="프로젝트 목록">
        {PROJECTS.map((w) => (
          <div className="car-card" key={w.title}>
            <h3>{w.title}</h3>
            <p>{w.desc}</p>
            {w.links.length > 0 && (
              <div className="card-links">
                {w.links.map(([label, href]) => (
                  <a className="proof-link" key={label} href={href}>{label} <Arrow /></a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="car-nav">
        <button type="button" className="btn-2nd car-btn" aria-label="이전 프로젝트" onClick={() => slide(-1)}>←</button>
        <button type="button" className="btn-2nd car-btn" aria-label="다음 프로젝트" onClick={() => slide(1)}>→</button>
      </div>
    </>
  )
}

// 하단 최근 활동 — 살아있는 도구면(SPEC §4). 콘텐츠 로더 사용, 없으면 디자인된 빈 상태.
function RecentActivity() {
  const articles = useMemo(() => loadContent('기사').slice(0, 3), [])
  const seminar = useMemo(() => loadContent('세미나')[0], [])
  return (
    <section className="cell center" id="recent">
      <span className="page-idx">05 — RECENT</span>
      <h2 className="headline">최근 <em>활동</em></h2>
      <div className="recent">
        <div className="recent-col">
          <span className="next-label">ARTICLES</span>
          {articles.length > 0 ? (
            <ul className="recent-list">
              {articles.map((a) => (
                <li key={a.slug}>
                  <a className="recent-item" href={`/articles/?p=${a.slug}`}>
                    <span className="recent-item-date">{a.date}</span>
                    <span className="recent-item-title">{a.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="recent-empty">첫 이슈 스캔이 게재되면 여기 최신순으로 표시됩니다.</p>
          )}
        </div>
        <div className="recent-col">
          <span className="next-label">SEMINARS</span>
          {seminar ? (
            <ul className="recent-list">
              <li>
                <a className="recent-item" href={`/seminars/?p=${seminar.slug}`}>
                  <span className="recent-item-date">{seminar.회차}회 · {seminar.유형}</span>
                  <span className="recent-item-title">{seminar.title}</span>
                </a>
              </li>
            </ul>
          ) : (
            <p className="recent-empty">세미나가 열리면 최근 회차가 여기 표시됩니다.</p>
          )}
        </div>
      </div>
      <p className="recent-more">
        <a className="proof-link" href="/articles/">기사 전체 <Arrow /></a>
        <a className="proof-link" href="/seminars/">세미나 전체 <Arrow /></a>
      </p>
    </section>
  )
}

export default function App() {
  useSectionSpy()
  return (
    <>
      <SiteNav />

      <main className="lattice">
        <section className="cell hero center page" id="top">
          <span className="eyebrow rv">KWANGWOON UNIV. · SCHOOL OF BUSINESS</span>
          <h1 {...rv(1)}><em>ERP</em>연구회</h1>
          <p className="hero-sub rv" style={{ transitionDelay: '160ms' }}>
            경영·MIS에 AI를 접목하는 법을 연구하고, 결과를 실물로 남깁니다.
          </p>
        </section>

        <section className="cell center page" id="why">
          <span className="page-idx rv">01 — WHY</span>
          <h2 {...rv(1, 'headline')}>왜 <em>만들었나</em></h2>
          <p className="why-line rv" style={{ transitionDelay: '160ms' }}>
            쓰는 사람은 많지만, 잘 쓰는 법을 배우는 자리는 없다.
          </p>
          <p className="mis-note rv" style={{ transitionDelay: '240ms', marginTop: 0 }}>
            20대 4명 중 3명이 이미 생성형 AI를 씁니다. 그러나 활용은 검색·요약 수준에 머물고,
            경영·MIS 맥락에서 활용을 훈련하는 자리는 비어 있습니다 — 그 자리를 만들었습니다.
          </p>
          <div className="row3 data-strip rv" style={{ transitionDelay: '320ms' }}>
            {DATA.map(([num, label, src]) => (
              <div key={src} style={{ textAlign: 'left' }}>
                <span className="stat-num">{num}</span>
                <span className="stat-label">{label}</span>
                <span className="stat-src">{src}</span>
              </div>
            ))}
          </div>
          <p className="data-note rv" style={{ transitionDelay: '400ms' }}>
            원문을 확인한 자료만 게재합니다.
          </p>
        </section>

        <section className="cell center page" id="roadmap">
          <span className="page-idx rv">02 — ROADMAP</span>
          <h2 {...rv(1, 'headline')}>연구회에서 <em>분기</em>하다</h2>
          <div className="branch rv" style={{ transitionDelay: '160ms' }}>
            <div className="b-node">
              <span className="b-era">ORIGIN</span>
              <h3>ERP연구회</h3>
              <p>경영학부의 MIS 스터디 — ERP와 정보시스템을 다뤄 온 뿌리.</p>
            </div>
            <div className="b-node">
              <span className="b-era">SAP ERA</span>
              <h3>SAP 특강</h3>
              <p>실무 컨설턴트가 이끈 MM·ABAP 교육의 시대.</p>
            </div>
            <div className="b-node">
              <span className="b-era">2026</span>
              <h3>ADsP 스터디 1기</h3>
              <p>데이터분석 준전문가 대비 — 진도 보드로 운영 중.</p>
              <span className="status live">진행중</span>
            </div>
            <div className="b-fork">
              <div className="b-node now">
                <span className="b-era">NEW BRANCH</span>
                <h3>MIS·AI 스터디 <em>신설</em></h3>
                <p>경영·MIS에 AI를 접목하는 법을 연구하는 새 갈래. 이 사이트가 그 시작입니다.</p>
                <span className="status prep">모집 준비</span>
              </div>
              <div className="b-node">
                <span className="b-era">DEEP DIVE</span>
                <h3>SAP Track · 공모전</h3>
                <p>AI 친숙도를 갖춘 뒤의 심화 갈래.</p>
                <span className="status planned">예정</span>
              </div>
            </div>
          </div>
        </section>

        <section className="cell center page" id="projects">
          <span className="page-idx rv">03 — PROJECTS</span>
          <h2 {...rv(1, 'headline')}>남긴 <em>실물</em>, 그리고 다음</h2>
          <div {...rv(2)}>
            <Carousel />
          </div>
          <div className="next-list rv" style={{ transitionDelay: '240ms' }}>
            <span className="next-label">NEXT</span>
            {NEXT.map(([status, label, text]) => (
              <div className="dir-row" key={text}>
                <span className={`status ${status}`}>{label}</span>
                <p>{text}</p>
              </div>
            ))}
            <p style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', margin: 0 }}>
              <a className="proof-link dir-more" href="/projects/">전체 아카이브 <Arrow /></a>
              <a className="proof-link dir-more" href="/log/#roadmap">전체 로드맵 <Arrow /></a>
            </p>
          </div>
        </section>

        <section className="cell center page" id="faq">
          <span className="page-idx rv">04 — FAQ</span>
          <h2 {...rv(1, 'headline')}>묻고 <em>답하기</em></h2>
          <div className="faq rv" style={{ transitionDelay: '160ms' }}>
            {FAQ.map(([q, a]) => (
              <details className="faq-item" key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
          <p className="join-note rv" style={{ marginTop: '1.75rem', transitionDelay: '240ms' }}>
            연구회 소개는 <a className="proof-link" href="/about/">ABOUT <Arrow /></a>
          </p>
        </section>

        <RecentActivity />
      </main>

      <SiteFooter />
    </>
  )
}
