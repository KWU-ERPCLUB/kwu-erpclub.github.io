import { useCallback, useEffect, useMemo, useState } from 'react'
import { SiteNav, SiteFooter, Arrow, CONTRIBUTING_URL } from '../shared.jsx'
import { loadContent } from '../content/loader.js'
import { LAB_HEADINGS } from '../content/schema.js'
import { splitByDate, todayString, excerpt } from './seminars-logic.js'
import Markdown from './Markdown.jsx'

// 본문을 `## <헤딩>`으로 분할 → { intro, sections: { 헤딩: 본문 } }. 순수 함수 — 테스트 대상.
export function splitSeminarBody(body) {
  const parts = (body || '').split(/^##\s+/m)
  const intro = (parts[0] || '').trim()
  const sections = {}
  for (let i = 1; i < parts.length; i++) {
    const nl = parts[i].indexOf('\n')
    const heading = (nl === -1 ? parts[i] : parts[i].slice(0, nl)).trim()
    sections[heading] = nl === -1 ? '' : parts[i].slice(nl + 1).trim()
  }
  return { intro, sections }
}

// 히어로 리드 = 본문 첫 단락 발췌(마크다운 제거·1~2문장 분량).
function heroLead(body) {
  const { intro } = splitSeminarBody(body)
  return excerpt(intro || body, 120)
}

// 일시·장소·발제자 한 줄(마이크로) — 장소는 있을 때만.
function metaLine(s) {
  return [s.date, s['장소'], `발제 ${s.author}`].filter(Boolean).join(' · ')
}

function Chips({ s }) {
  return (
    <span className="hub-chips">
      <span className="hub-chip">{s.회차}회</span>
      <span className="hub-chip">{s.유형}</span>
    </span>
  )
}

function LabDetail({ body }) {
  const { intro, sections } = splitSeminarBody(body)
  return (
    <>
      {intro && <Markdown body={intro} />}
      {LAB_HEADINGS.map((h) => (
        <section className="sem-block" key={h}>
          <h2 className="sem-block-title">{h}</h2>
          {sections[h] ? <Markdown body={sections[h]} /> : <p className="sem-block-empty">내용 준비 중.</p>}
        </section>
      ))}
    </>
  )
}

// NEXT 히어로 — 대형 타이포·여백, 핵심 1~2문장, 메타 마이크로. 강조 = 버건디 화이트리스트(눈썹)만.
export function NextHero({ s, onOpen }) {
  const { sections } = splitSeminarBody(s.body)
  const hasPrep = Boolean((sections['준비'] || '').trim())
  return (
    <section className="sem-hero" aria-labelledby="sem-hero-title">
      <span className="sem-hero-eyebrow">NEXT</span>
      <h2 className="sem-hero-title" id="sem-hero-title">{s.title}</h2>
      {heroLead(s.body) && <p className="sem-hero-lead">{heroLead(s.body)}</p>}
      <p className="sem-hero-meta">{metaLine(s)}</p>
      <Chips s={s} />
      <div className="sem-hero-links">
        {hasPrep && (
          <button type="button" className="proof-link" onClick={() => onOpen(s.slug)}>
            사전 준비 확인 <Arrow />
          </button>
        )}
        <button type="button" className="proof-link" onClick={() => onOpen(s.slug)}>
          자세히 <Arrow />
        </button>
      </div>
    </section>
  )
}

// 예정 0건 — 디자인된 빈 상태(§3-1: 무엇이 쌓이는지 + 기고 방법).
function NextEmpty() {
  return (
    <section className="sem-hero sem-hero-empty">
      <span className="sem-hero-eyebrow">NEXT</span>
      <p className="sem-hero-empty-title">다음 세미나 준비 중 — 주제 확정 시 게재.</p>
      <p className="sem-hero-empty-sub">
        인사이트로 포착한 AI 이슈 중 직접 해볼 것을 선별해 회차 편성. 확정 전까지 예정 칸 비움.
      </p>
      <p className="sem-hero-empty-how">
        기고 = <a href={CONTRIBUTING_URL} target="_blank" rel="noreferrer">기고 가이드</a> 참고 →
        <code> content/세미나/_template.md</code> 복사 → 규칙 채움 → 자동 게재.
      </p>
    </section>
  )
}

// 과거 항목 하나 = 네이티브 아코디언(details/summary). 펼침 = 요점 불릿(없으면 발췌) + 슬라이드 + 자세히.
export function PastItem({ s, onOpen }) {
  const points = Array.isArray(s['요점']) ? s['요점'] : null
  return (
    <details className="sem-acc">
      <summary className="sem-acc-sum">
        <span className="sem-acc-title">{s.회차}회 · {s.title}</span>
        <span className="sem-acc-date">{s.date}</span>
      </summary>
      <div className="sem-acc-body">
        {points ? (
          <ul className="sem-points">
            {points.map((p) => <li key={p}>{p}</li>)}
          </ul>
        ) : (
          <p className="sem-acc-excerpt">{excerpt(splitSeminarBody(s.body).intro || s.body, 110)}</p>
        )}
        <div className="sem-acc-links">
          {s['슬라이드'] && (
            <a className="btn-2nd" href={s['슬라이드']} target="_blank" rel="noreferrer">슬라이드</a>
          )}
          <button type="button" className="proof-link" onClick={() => onOpen(s.slug)}>자세히 <Arrow /></button>
        </div>
      </div>
    </details>
  )
}

// 상세 뷰 — 3블록(실습)/자유(인지) + 상단 슬라이드 버튼(Secondary) + 장소·일시 메타.
function SeminarDetail({ s, onBack }) {
  return (
    <article className="hub-detail">
      <button type="button" className="hub-back" onClick={onBack}>← 목록</button>
      <h1>{s.title}</h1>
      <p className="hub-meta">{s.회차}회 · {s.유형} · {metaLine(s)}</p>
      {s['슬라이드'] && (
        <p className="sem-detail-slide">
          <a className="btn-2nd" href={s['슬라이드']} target="_blank" rel="noreferrer">슬라이드 <Arrow /></a>
        </p>
      )}
      {s.발원기사 && (
        <p className="sem-origin">발원 기사 <a href={s.발원기사}>원문</a></p>
      )}
      {s.유형 === '실습' ? <LabDetail body={s.body} /> : <Markdown body={s.body} />}
    </article>
  )
}

export default function Seminars() {
  const all = useMemo(() => loadContent('세미나'), [])
  const today = useMemo(() => todayString(), [])
  const { upcoming, past } = useMemo(() => splitByDate(all, today), [all, today])
  const hero = upcoming[0] || null

  const paramP = () => (typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('p'))
  const [sel, setSel] = useState(paramP)

  // 뒤로가기·앞으로가기(popstate) → URL에서 상세 슬러그 복원(뒤로가기 = 목록 복귀).
  useEffect(() => {
    const onPop = () => setSel(paramP())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const openSeminar = useCallback((slug) => {
    if (typeof window !== 'undefined') window.history.pushState({ slug }, '', slug ? `?p=${slug}` : window.location.pathname)
    setSel(slug)
  }, [])
  const back = useCallback(() => openSeminar(null), [openSeminar])

  const cur = all.find((s) => s.slug === sel)

  if (cur) {
    return (
      <>
        <SiteNav />
        <main className="hub-page">
          <SeminarDetail s={cur} onBack={back} />
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
          <span className="hub-idx">SEMINARS</span>
          <h1>선별 <em>실습</em></h1>
          <p>인사이트로 포착한 AI 이슈 중 직접 해볼 것을 선별해 진행 — 실습 회차는 준비·진행·재현 가이드 3블록.</p>
        </header>

        {hero ? <NextHero s={hero} onOpen={openSeminar} /> : <NextEmpty />}

        {past.length > 0 && (
          <section className="sem-past">
            <h2 className="sem-past-head">지난 세미나</h2>
            <div className="sem-acc-list">
              {past.map((s) => <PastItem key={s.slug} s={s} onOpen={openSeminar} />)}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
