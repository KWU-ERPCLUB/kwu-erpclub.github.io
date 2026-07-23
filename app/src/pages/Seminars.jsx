import { useMemo, useState } from 'react'
import { SiteNav, SiteFooter } from '../shared.jsx'
import { loadContent } from '../content/loader.js'
import { LAB_HEADINGS } from '../content/schema.js'
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

export default function Seminars() {
  const all = useMemo(
    () => loadContent('세미나').sort((a, b) => Number(a.회차) - Number(b.회차)),
    [],
  )
  const initial = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('p')
  const [sel, setSel] = useState(initial)
  const cur = all.find((s) => s.slug === sel)

  if (cur) {
    return (
      <>
        <SiteNav />
        <main className="hub-page">
          <article className="hub-detail">
            <button type="button" className="hub-back" onClick={() => setSel(null)}>← 목록</button>
            <h1>{cur.title}</h1>
            <p className="hub-meta">{cur.회차}회 · {cur.유형} · {cur.date} · {cur.author}</p>
            {cur.발원기사 && (
              <p className="sem-origin">발원 기사 <a href={cur.발원기사}>원문</a></p>
            )}
            {cur.유형 === '실습' ? <LabDetail body={cur.body} /> : <Markdown body={cur.body} />}
          </article>
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
          <p>기사로 스캔한 이슈 중 직접 해볼 것을 골라 세미나로 다룬다. 실습 회차는 준비·진행·재현 가이드 3블록으로 정리한다.</p>
        </header>
        {all.length === 0 ? (
          <div className="hub-empty">
            <p className="hub-empty-title">아직 세미나 기록이 없습니다.</p>
            <p>세미나가 열리면 회차별로 이곳에 쌓입니다 — 인지(알기) 회차는 자유 구성, 실습 회차는 준비·진행·재현 가이드 3블록.</p>
            <p className="hub-empty-how">기고 방법: <code>content/세미나/</code>에 규칙(회차·유형)에 맞는 마크다운을 추가하면 자동 게재됩니다.</p>
          </div>
        ) : (
          <ul className="hub-list">
            {all.map((s) => (
              <li key={s.slug} className="hub-card">
                <button type="button" onClick={() => setSel(s.slug)}>
                  <span className="hub-card-title">{s.title}</span>
                  <span className="hub-chips">
                    <span className="hub-chip">{s.회차}회</span>
                    <span className="hub-chip">{s.유형}</span>
                  </span>
                  <span className="hub-meta">{s.date} · {s.author}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
