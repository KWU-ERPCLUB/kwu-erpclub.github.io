import { useMemo, useState } from 'react'
import { SiteNav, SiteFooter } from '../shared.jsx'
import { loadContent } from '../content/loader.js'
import { TAGS } from '../content/schema.js'
import Markdown from './Markdown.jsx'

// 본문 마크다운 → 요약 발췌(리스트 행 4요소 중 '요약'). 순수 함수 — 테스트 대상.
export function excerpt(body, n = 96) {
  const text = (body || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~`|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > n ? `${text.slice(0, n).trim()}…` : text
}

// 태그 칩 필터 — null이면 전체, 아니면 tags 포함 항목만. 순수 함수 — 테스트 대상.
export function filterArticles(all, tag) {
  return tag ? all.filter((a) => (a.tags || []).includes(tag)) : all
}

export default function Articles() {
  const all = useMemo(() => loadContent('기사'), [])
  const initial = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('p')
  const [sel, setSel] = useState(initial)
  const [tag, setTag] = useState(null)
  const cur = all.find((a) => a.slug === sel)
  const list = filterArticles(all, tag)

  if (cur) {
    return (
      <>
        <SiteNav />
        <main className="art-page">
          <article className="art-detail">
            <button type="button" className="art-back" onClick={() => setSel(null)}>← 목록</button>
            {(cur.tags || []).length > 0 && (
              <p className="art-detail-tags">{(cur.tags || []).join(' · ')}</p>
            )}
            <h1>{cur.title}</h1>
            <p className="art-detail-meta">
              {cur.date} · {cur.author} · 원문 <a href={cur.source_url}>{cur.source_name}</a>
            </p>
            <Markdown body={cur.body} />
          </article>
        </main>
        <SiteFooter />
      </>
    )
  }

  return (
    <>
      <SiteNav />
      <main className="art-page">
        <header className="art-head">
          <span className="art-idx">ARTICLES</span>
          <h1><em>기고</em> 아카이브</h1>
          <p>스터디원이 각자의 AI 워크플로로 요약·기고한 업계 소식. 형식은 계약, 방식은 자유.</p>
        </header>

        <div className="art-filter" role="group" aria-label="태그 필터">
          <button type="button" className={tag ? '' : 'on'} aria-pressed={!tag} onClick={() => setTag(null)}>
            전체
          </button>
          {TAGS.map((t) => (
            <button
              key={t}
              type="button"
              className={tag === t ? 'on' : ''}
              aria-pressed={tag === t}
              onClick={() => setTag(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="art-empty">아직 기고가 없다. 첫 기고 방법은 온보딩 가이드 참고.</p>
        ) : (
          <ul className="art-list">
            {list.map((a) => (
              <li key={a.slug} className="art-row">
                <button type="button" onClick={() => setSel(a.slug)}>
                  <span className="art-row-meta">{a.date} · {a.author}</span>
                  <span className="art-row-title">{a.title}</span>
                  <span className="art-row-excerpt">{excerpt(a.body)}</span>
                  {(a.tags || []).length > 0 && (
                    <span className="art-row-tags">
                      {(a.tags || []).map((t) => (
                        <span key={t} className="art-tag">{t}</span>
                      ))}
                    </span>
                  )}
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
