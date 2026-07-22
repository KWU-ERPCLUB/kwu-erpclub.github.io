import { useMemo, useState } from 'react'
import { SiteNav, SiteFooter } from '../shared.jsx'
import { loadContent } from '../content/loader.js'
import { TAGS } from '../content/schema.js'
import Markdown from './Markdown.jsx'

export default function Articles() {
  const all = useMemo(() => loadContent('기사'), [])
  const initial = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('p')
  const [sel, setSel] = useState(initial)
  const [tag, setTag] = useState(null)
  const cur = all.find((a) => a.slug === sel)
  const list = tag ? all.filter((a) => (a.tags || []).includes(tag)) : all

  return (
    <>
      <SiteNav />
      <main className="hub-page">
        {cur ? (
          <article className="hub-detail">
            <button type="button" className="hub-back" onClick={() => setSel(null)}>← 목록</button>
            <h1>{cur.title}</h1>
            <p className="hub-meta">{cur.date} · {cur.author} · 원문: <a href={cur.source_url}>{cur.source_name}</a></p>
            <Markdown body={cur.body} />
          </article>
        ) : (
          <>
            <header className="hub-head">
              <h1>ARTICLES</h1>
              <p>스터디원이 각자의 AI 워크플로로 요약·기고한 업계 소식. 형식은 계약, 방식은 자유.</p>
            </header>
            <div className="hub-filter">
              <button type="button" className={tag ? '' : 'on'} onClick={() => setTag(null)}>전체</button>
              {TAGS.map((t) => (
                <button key={t} type="button" className={tag === t ? 'on' : ''} onClick={() => setTag(t)}>{t}</button>
              ))}
            </div>
            {list.length === 0 && <p className="hub-empty">아직 기고가 없다. 첫 기고 방법은 온보딩 가이드 참고.</p>}
            <ul className="hub-list">
              {list.map((a) => (
                <li key={a.slug} className="hub-card">
                  <button type="button" onClick={() => setSel(a.slug)}>
                    <span className="hub-card-title">{a.title}</span>
                    <span className="hub-meta">{a.date} · {a.author} · {(a.tags || []).join(' · ')}</span>
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
