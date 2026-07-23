import { useMemo, useState } from 'react'
import { SiteNav, SiteFooter } from '../shared.jsx'
import { loadContent } from '../content/loader.js'
import { USES, TECHS } from '../content/schema.js'
import Markdown from './Markdown.jsx'

// 본문 마크다운 → 텍스트 발췌(리스트 요약행 + 검색 인덱스). 순수 함수 — 테스트 대상.
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

// 2축 태그(용도·기술) + 검색(제목·요약 부분일치)을 AND 결합. 순수 함수 — 테스트 대상.
export function filterArticles(all, { use = null, tech = null, q = '' } = {}) {
  const query = q.trim().toLowerCase()
  return all.filter((a) => {
    if (use && !(a['용도'] || []).includes(use)) return false
    if (tech && !(a['기술'] || []).includes(tech)) return false
    if (query) {
      const hay = `${a.title || ''} ${excerpt(a.body, 100000)}`.toLowerCase()
      if (!hay.includes(query)) return false
    }
    return true
  })
}

export default function Articles() {
  const all = useMemo(() => loadContent('기사'), [])
  const initial = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('p')
  const [sel, setSel] = useState(initial)
  const [use, setUse] = useState(null)
  const [tech, setTech] = useState(null)
  const [q, setQ] = useState('')
  const cur = all.find((a) => a.slug === sel)
  const list = filterArticles(all, { use, tech, q })

  if (cur) {
    const meta = [...(cur['용도'] || []), ...(cur['기술'] || [])]
    return (
      <>
        <SiteNav />
        <main className="art-page">
          <article className="art-detail">
            <button type="button" className="art-back" onClick={() => setSel(null)}>← 목록</button>
            {meta.length > 0 && <p className="art-detail-tags">{meta.join(' · ')}</p>}
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
          <h1>이슈 <em>스캔</em> 아카이브</h1>
          <p>지금 무엇이 이슈고 무엇을 알아두면 좋은지 — 스터디원이 각자의 AI 워크플로로 요약·기고. 분류 기준 = 용도(무엇에 쓰나).</p>
        </header>

        <div className="art-search">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="제목·요약 검색"
            aria-label="기사 검색"
          />
        </div>

        <div className="art-filter" role="group" aria-label="용도 필터">
          <span className="art-filter-label">용도</span>
          <button type="button" className={use ? '' : 'on'} aria-pressed={!use} onClick={() => setUse(null)}>
            전체
          </button>
          {USES.map((u) => (
            <button key={u} type="button" className={use === u ? 'on' : ''} aria-pressed={use === u} onClick={() => setUse(u)}>
              {u}
            </button>
          ))}
        </div>

        <div className="art-filter art-filter-sub" role="group" aria-label="기술 필터">
          <span className="art-filter-label">기술</span>
          <button type="button" className={tech ? '' : 'on'} aria-pressed={!tech} onClick={() => setTech(null)}>
            전체
          </button>
          {TECHS.map((t) => (
            <button key={t} type="button" className={tech === t ? 'on' : ''} aria-pressed={tech === t} onClick={() => setTech(t)}>
              {t}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="art-empty">
            <p className="art-empty-title">조건에 맞는 기고 없음.</p>
            <p>필터·검색 해제 = 전체 목록. 첫 기고 = <code>content/기사/</code>에 규칙(용도·출처)에 맞는 마크다운 추가 → 자동 게재.</p>
          </div>
        ) : (
          <ul className="art-list">
            {list.map((a) => (
              <li key={a.slug} className="art-row">
                <button type="button" onClick={() => setSel(a.slug)}>
                  <span className="art-row-meta">{a.date} · {a.author}</span>
                  <span className="art-row-title">{a.title}</span>
                  <span className="art-row-excerpt">{excerpt(a.body)}</span>
                  <span className="art-row-tags">
                    {(a['용도'] || []).map((t) => (
                      <span key={t} className="art-tag art-tag-use">{t}</span>
                    ))}
                    {(a['기술'] || []).map((t) => (
                      <span key={t} className="art-tag">{t}</span>
                    ))}
                  </span>
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
