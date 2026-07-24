// 외부 공개 페이지: 프로젝트(/projects/) — DPM 문법(2026-07-24 오너): 대형 커버 그리드 +
// 호버 오버레이(GitHub·Web) + 상세(?p= 딥링크) = 소개 + 프롬프트 로그. 데이터 = content/프로젝트/ 로더.
// 용도: 유입 마케팅이 아니라 "스터디원이 본인 기여를 한눈에 제시"하는 증빙 아카이브. 확인된 사실만.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Arrow, SiteNav, SiteFooter, CONTRIBUTING_URL } from './shared.jsx'
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

// 커버 배너 — 이미지 있으면 16:10 커버, 없으면 이니셜 타일 fallback.
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

// 그리드 카드 — 대형 커버 + 호버 오버레이(링크) + 하단 제목·설명·상태. export = 단위 테스트용.
export function ProjectCard({ p, onOpen }) {
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
        <span className="pj-card-title">{p.title}</span>
        <span className="pj-card-desc">{p['설명']}</span>
        <span className={`status ${STATUS_CLASS[p['상태']] || 'planned'}`}>{p['상태']}</span>
      </button>
    </article>
  )
}

// 목록 — 대형 커버 그리드(데스크톱 2열·모바일 1열). export = 단위 테스트용.
export function ProjectGrid({ list, onOpen }) {
  if (list.length === 0) {
    return (
      <div className="hub-empty hub-empty-how">
        <p className="hub-empty-title">등재된 프로젝트 아직 없음.</p>
        <p>스터디가 만들어 배포한 결과물이 여기 쌓임 — 커버 캡처 + 한 줄 설명 + 상태.</p>
        <p>
          기고 = <a href={CONTRIBUTING_URL} target="_blank" rel="noreferrer">기고 가이드</a> 참고 →
          <code> content/프로젝트/_template.md</code> 복사 → 규칙 채움 → 자동 게재.
        </p>
      </div>
    )
  }
  return (
    <div className="pj-grid">
      {list.map((p) => <ProjectCard key={p.slug} p={p} onOpen={onOpen} />)}
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
        <main className="hub-page">
          <ProjectDetail p={cur} onBack={back} />
        </main>
        <SiteFooter />
      </>
    )
  }

  return (
    <>
      <SiteNav />
      <main className="hub-page">
        <header className="hub-head">
          <span className="hub-idx">PROJECTS</span>
          <h1>만든 <em>실물</em>의 기록</h1>
          <p>연구회가 만들고 배포한 결과물 — 커버·한 줄 설명·상태. 스터디원의 기여 제시.</p>
        </header>
        <ProjectGrid list={all} onOpen={open} />
      </main>
      <SiteFooter />
    </>
  )
}
