// 외부 공개 페이지: 프로젝트(/projects/) — v3.1 NEXTERS 실측 문법(2026-08-05, 디자인규칙 §6-2a):
// B2 좌 고정 라벨 컬럼(버건디 ■+PROJECTS, 폰=상하 적층) + B1 블랙 통계 밴드(실측 수치만·출처 각주)
// + N4 쇼케이스 카드(1열 대형 커버 — 카드 2장 현실에서 캐러셀은 억지라 기각, 대형 커버 우선).
// 유지 = ?p= 딥링크·상세 진입·호버 오버레이(GitHub·Web)·프롬프트 로그. 데이터 = content/프로젝트/ 로더.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Arrow, SiteNav, SiteFooter, PageHead, CONTRIBUTING_URL } from './shared.jsx'
import { loadContent } from './content/loader.js'
import Markdown from './pages/Markdown.jsx'

// 상태 칩 클래스 매핑(global.css .status 재사용 — 버건디 면 금지 준수).
const STATUS_CLASS = { '운영 중': 'live', '진행 중': 'prep', '보관': 'planned' }

// 본문을 소개(intro)와 `## <헤딩>` 로그 섹션들로 분할. 순수 함수 — 테스트 대상.
export function splitProjectBody(body) {
  const t = (body || '').trim()
  const idx = t.search(/^##\s+/m)
  if (idx === -1) return { intro: t, logs: [] }
  const intro = t.slice(0, idx).trim()
  const logs = t.slice(idx).split(/^##\s+/m).filter((p) => p.trim()).map((p) => {
    const nl = p.indexOf('\n')
    return { heading: (nl === -1 ? p : p.slice(0, nl)).trim(), body: nl === -1 ? '' : p.slice(nl + 1).trim() }
  })
  return { intro, logs }
}

function initial(s) {
  return (s || '?').trim().charAt(0).toUpperCase()
}

// 커버 배너 — 이미지 있으면 커버, 없으면 이니셜 타일 fallback.
function Cover({ p, className }) {
  if (p['커버']) return <img className={className} src={p['커버']} alt="" loading="lazy" />
  return <span className={`${className} pj-cover-fallback`} aria-hidden="true">{initial(p.title)}</span>
}

// 프로젝트 링크 버튼들(frontmatter에 있는 것만). variant = overlay(흰 필)/detail(Secondary).
function ProjectLinks({ p, variant }) {
  const cls = variant === 'overlay' ? 'pj-ov-link' : 'btn-2nd'
  return (
    <>
      {p.github && (
        <a className={cls} href={p.github} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
          GitHub <Arrow />
        </a>
      )}
      {p.web && (
        <a className={cls} href={p.web} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
          Web <Arrow />
        </a>
      )}
    </>
  )
}

// (구 ProjectStats 블랙 통계 밴드 = 4차 개편 2026-08-06 삭제 — 피드백 "홈 내용이라 없어도 될 것 같다".
//  홈 블랙 밴드(StatsBand)가 실측 수치를 담당한다. 재도입 = 오너 재승인.)

// 쇼케이스 카드 — 대형 커버 + 호버 오버레이(링크) + 번호·제목·설명·상태. export = 단위 테스트용.
export function ProjectCard({ p, idx, onOpen }) {
  const hasLinks = Boolean(p.github || p.web)
  return (
    <article className="pj-card">
      <div className="pj-card-coverwrap">
        <button type="button" className="pj-card-open" onClick={() => onOpen(p.slug)} aria-label={`${p.title} 상세`}>
          <Cover p={p} className="pj-card-cover" />
        </button>
        {hasLinks && (
          <div className="pj-card-overlay" aria-hidden="false">
            <ProjectLinks p={p} variant="overlay" />
          </div>
        )}
      </div>
      <button type="button" className="pj-card-info" onClick={() => onOpen(p.slug)}>
        {typeof idx === 'number' && <span className="pj-card-idx">{String(idx + 1).padStart(2, '0')}</span>}
        <span className="pj-card-title">{p.title}</span>
        <span className="pj-card-desc">{p['설명']}</span>
        <span className={`status ${STATUS_CLASS[p['상태']] || 'planned'}`}>{p['상태']}</span>
      </button>
    </article>
  )
}

// 목록 — 쇼케이스 1열(대형 커버). export = 단위 테스트용.
export function ProjectGrid({ list, onOpen }) {
  if (list.length === 0) {
    return (
      <div className="hub-empty hub-empty-how">
        <p className="hub-empty-title">등재된 프로젝트 아직 없음.</p>
        <p>스터디의 프로젝트·활동 기록이 여기 쌓임 — 배포물이 아니어도 됨. 커버 캡처 + 한 줄 설명 + 상태.</p>
        <p>
          기고 = <a href={CONTRIBUTING_URL} target="_blank" rel="noreferrer">기고 가이드</a> 참고 →
          <code> content/프로젝트/_template.md</code> 복사 → 규칙 채움 → 자동 게재.
        </p>
      </div>
    )
  }
  return (
    <div className="pj-grid">
      {list.map((p, i) => <ProjectCard key={p.slug} p={p} idx={i} onOpen={onOpen} />)}
    </div>
  )
}

// 상세 — 커버 배너 → 제목·설명·상태·링크 → 소개 본문 → 프롬프트 로그(## 섹션). export = 단위 테스트용.
export function ProjectDetail({ p, onBack }) {
  const { intro, logs } = splitProjectBody(p.body)
  return (
    <article className="pj-detail">
      <button type="button" className="hub-back" onClick={onBack}>← 목록</button>
      <div className="pj-detail-banner">
        <Cover p={p} className="pj-detail-cover" />
      </div>
      <h1 className="pj-detail-title">{p.title}</h1>
      <p className="pj-detail-desc">{p['설명']}</p>
      <div className="pj-detail-bar">
        <span className={`status ${STATUS_CLASS[p['상태']] || 'planned'}`}>{p['상태']}</span>
        <span className="pj-detail-links"><ProjectLinks p={p} variant="detail" /></span>
      </div>
      {intro && <Markdown body={intro} />}
      {logs.map((l) => (
        <section className="pj-log-block" key={l.heading}>
          <h2 className="pj-log-title">{l.heading}</h2>
          <div className="pj-log-body"><Markdown body={l.body} /></div>
        </section>
      ))}
    </article>
  )
}

export default function Projects() {
  const all = useMemo(() => loadContent('프로젝트'), [])

  const paramP = () => (typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('p'))
  const [sel, setSel] = useState(paramP)

  // 뒤로가기·앞으로가기(popstate) → URL에서 상세 슬러그 복원(세미나 패턴 동일).
  useEffect(() => {
    const onPop = () => setSel(paramP())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const open = useCallback((slug) => {
    if (typeof window !== 'undefined') window.history.pushState({ slug }, '', slug ? `?p=${slug}` : window.location.pathname)
    setSel(slug)
  }, [])
  const back = useCallback(() => open(null), [open])

  const cur = all.find((p) => p.slug === sel)

  if (cur) {
    return (
      <>
        <SiteNav />
        <main id="main" className="hub-page hub-page--wide">
          <ProjectDetail p={cur} onBack={back} />
        </main>
        <SiteFooter />
      </>
    )
  }

  // 골격(4차 2026-08-06) = 공용 PageHead(중앙) → 쇼케이스 2열 그리드(스탯 밴드 삭제).
  return (
    <>
      <SiteNav />
      <main id="main" className="hub-page pj-page">
        <PageHead
          label="PROJECTS"
          title={<em>프로젝트</em>}
          sub="필요한 도구를 AI로 만들어 활동에 쓴 기록입니다 — 배포물과 운영 기록을 모읍니다."
        />
        <ProjectGrid list={all} onOpen={open} />
      </main>
      <SiteFooter />
    </>
  )
}
