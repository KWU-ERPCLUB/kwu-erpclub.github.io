import { useMemo, useState } from 'react'
import { SiteNav, SiteFooter } from '../shared.jsx'
import { loadContent } from '../content/loader.js'
import Markdown from './Markdown.jsx'

export default function Seminars() {
  const all = useMemo(
    () => loadContent('세미나').sort((a, b) => Number(a.회차) - Number(b.회차)),
    [],
  )
  const initial = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('p')
  const [sel, setSel] = useState(initial)
  const cur = all.find((s) => s.slug === sel)

  return (
    <>
      <SiteNav />
      <main className="hub-page">
        {cur ? (
          <article className="hub-detail">
            <button type="button" className="hub-back" onClick={() => setSel(null)}>← 목록</button>
            <h1>{cur.title}</h1>
            <p className="hub-meta">{cur.회차}회 · {cur.유형} · {cur.date} · {cur.author}</p>
            <Markdown body={cur.body} />
          </article>
        ) : (
          <>
            <header className="hub-head">
              <h1>SEMINARS</h1>
              <p>회차별 세미나 정리 — 인지(알기)와 실습(해보기)을 교차로 쌓는다.</p>
            </header>
            {all.length === 0 && <p className="hub-empty">아직 기록된 회차가 없다. 세미나 개시 후 회차별 정리가 쌓인다.</p>}
            <ul className="hub-list">
              {all.map((s) => (
                <li key={s.slug} className="hub-card">
                  <button type="button" onClick={() => setSel(s.slug)}>
                    <span className="hub-card-title">{s.title}</span>
                    <span className="hub-meta">{s.회차}회 · {s.유형} · {s.date} · {s.author}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
