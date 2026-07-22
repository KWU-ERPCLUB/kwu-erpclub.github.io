import { useMemo, useState } from 'react'
import { SiteNav, SiteFooter } from '../shared.jsx'
import { loadContent } from '../content/loader.js'
import Markdown from './Markdown.jsx'

export default function Labs() {
  const all = useMemo(() => loadContent('실습'), [])
  const initial = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('p')
  const [sel, setSel] = useState(initial)
  const cur = all.find((l) => l.slug === sel)

  return (
    <>
      <SiteNav />
      <main className="hub-page">
        {cur ? (
          <article className="hub-detail">
            <button type="button" className="hub-back" onClick={() => setSel(null)}>← 목록</button>
            <h1>{cur.title}</h1>
            <p className="hub-meta">{cur.연계회차}회 연계 · {(cur.tools || []).join(', ')} · {cur.date}</p>
            <Markdown body={cur.body} />
          </article>
        ) : (
          <>
            <header className="hub-head">
              <h1>LABS</h1>
              <p>세미나 실습을 혼자서도 따라할 수 있게 — 단계·도구·프롬프트 기록.</p>
            </header>
            {all.length === 0 && <p className="hub-empty">아직 실습 가이드가 없다. 세미나 실습 회차의 재현 절차가 여기 쌓인다.</p>}
            <ul className="hub-list">
              {all.map((l) => (
                <li key={l.slug} className="hub-card">
                  <button type="button" onClick={() => setSel(l.slug)}>
                    <span className="hub-card-title">{l.title}</span>
                    <span className="hub-meta">{l.연계회차}회 연계 · {(l.tools || []).join(', ')} · {l.date}</span>
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
