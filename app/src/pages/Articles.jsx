import { useMemo, useState } from 'react'
import { SiteNav, SiteFooter, Arrow } from '../shared.jsx'
import { loadContent } from '../content/loader.js'
import { NATURES, AREAS } from '../content/schema.js'
import Markdown from './Markdown.jsx'

// 본문 마크다운 → 텍스트 발췌(검색 인덱스). 순수 함수 — 테스트 대상.
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

// 성격·영역·지금써먹기 3필터 + 검색(제목·본문 부분일치)을 전부 AND 결합. 순수 함수 — 테스트 대상.
export function filterArticles(all, { nature = null, area = null, nowUse = false, q = '' } = {}) {
  const query = q.trim().toLowerCase()
  return all.filter((a) => {
    if (nature && a['성격'] !== nature) return false
    if (area && a['영역'] !== area) return false
    if (nowUse && !a['지금써먹기']) return false
    if (query) {
      const hay = `${a.title || ''} ${excerpt(a.body, 100000)}`.toLowerCase()
      if (!hay.includes(query)) return false
    }
    return true
  })
}

// 역시간순 리스트를 월별 그룹으로 묶는다("YYYY. MM" 헤더). 정렬 순서 유지. 순수 함수 — 테스트 대상.
export function groupByMonth(list) {
  const groups = []
  let key = null
  for (const a of list) {
    const k = (a.date || '').slice(0, 7) // YYYY-MM
    if (k !== key) { key = k; groups.push({ month: k.replace('-', '. '), items: [] }) }
    groups[groups.length - 1].items.push(a)
  }
  return groups
}

// 상세 하단 내비용 이웃(역시간순 배열 기준: prev=더 과거, next=더 최근). 순수 함수 — 테스트 대상.
export function neighbors(all, slug) {
  const i = all.findIndex((a) => a.slug === slug)
  return {
    prev: i >= 0 && i < all.length - 1 ? all[i + 1] : null,
    next: i > 0 ? all[i - 1] : null,
  }
}

function TagChips({ a }) {
  return (
    <span className="art-row-tags">
      {a['성격'] && <span className="art-tag art-tag-nature">{a['성격']}</span>}
      {a['영역'] && <span className="art-tag">{a['영역']}</span>}
      {a['지금써먹기'] && <span className="art-tag art-tag-now">지금 써먹기</span>}
    </span>
  )
}

export default function Articles() {
  const all = useMemo(() => loadContent('기사'), [])
  const initial = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('p')
  const [sel, setSel] = useState(initial)
  const [nature, setNature] = useState(null)
  const [area, setArea] = useState(null)
  const [nowUse, setNowUse] = useState(false)
  const [q, setQ] = useState('')
  const cur = all.find((a) => a.slug === sel)
  const list = filterArticles(all, { nature, area, nowUse, q })

  if (cur) {
    const { prev, next } = neighbors(all, cur.slug)
    const hasTags = Boolean(cur['성격'] || cur['영역'] || cur['지금써먹기'])
    return (
      <>
        <SiteNav />
        <main className="art-page">
          <article className="art-detail">
            {/* ① 문서 헤더 블록 — 눈썹·제목·메타·태그 */}
            <header className="art-doc-head">
              <span className="art-idx">AI INSIGHTS</span>
              <h1>{cur.title}</h1>
              <p className="art-detail-meta">{cur.date} · {cur.author}</p>
              {hasTags && <div className="art-detail-tags"><TagChips a={cur} /></div>}
            </header>

            {/* ② 출처 카드 — source_name·source_url 시각 블록 승격 */}
            {cur.source_url && (
              <a className="art-source" href={cur.source_url} target="_blank" rel="noreferrer">
                <span className="art-source-label">출처</span>
                <span className="art-source-name">{cur.source_name || cur.source_url}</span>
                <span className="art-source-go"><Arrow /></span>
              </a>
            )}

            {/* ③ 본문 컨테이너 720px — 기고자 자유(텍스트·이미지·링크·임베드) */}
            <Markdown body={cur.body} />

            {/* ④ 하단 — 목록 복귀 + 이전/다음 인사이트 */}
            <nav className="art-foot" aria-label="인사이트 이동">
              <button type="button" className="art-back" onClick={() => setSel(null)}>← 목록</button>
              {(prev || next) && (
                <div className="art-foot-nav">
                  {prev && (
                    <button type="button" className="art-nav-link" onClick={() => setSel(prev.slug)}>
                      <span className="art-nav-dir">← 이전</span>
                      <span className="art-nav-title">{prev.title}</span>
                    </button>
                  )}
                  {next && (
                    <button type="button" className="art-nav-link art-nav-next" onClick={() => setSel(next.slug)}>
                      <span className="art-nav-dir">다음 →</span>
                      <span className="art-nav-title">{next.title}</span>
                    </button>
                  )}
                </div>
              )}
            </nav>
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
          <span className="art-idx">AI INSIGHTS</span>
          <h1>AI <em>인사이트</em></h1>
          <p>경영·MIS 관점의 AI 이슈 분석·축적 — 스터디원이 각자의 AI 워크플로로 기고. 분류 = 글 성격 × 업무 영역.</p>
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

        <div className="art-filter" role="group" aria-label="성격 필터">
          <span className="art-filter-label">성격</span>
          <button type="button" className={nature ? '' : 'on'} aria-pressed={!nature} onClick={() => setNature(null)}>
            전체
          </button>
          {NATURES.map((n) => (
            <button key={n} type="button" className={nature === n ? 'on' : ''} aria-pressed={nature === n} onClick={() => setNature(n)}>
              {n}
            </button>
          ))}
        </div>

        <div className="art-filter art-filter-sub" role="group" aria-label="영역 필터">
          <span className="art-filter-label">영역</span>
          <button type="button" className={area ? '' : 'on'} aria-pressed={!area} onClick={() => setArea(null)}>
            전체
          </button>
          {AREAS.map((v) => (
            <button key={v} type="button" className={area === v ? 'on' : ''} aria-pressed={area === v} onClick={() => setArea(v)}>
              {v}
            </button>
          ))}
        </div>

        <div className="art-filter art-filter-toggle" role="group" aria-label="지금 써먹기 필터">
          <button type="button" className={nowUse ? 'on' : ''} aria-pressed={nowUse} onClick={() => setNowUse(!nowUse)}>
            지금 써먹기
          </button>
        </div>

        {list.length === 0 ? (
          <div className="art-empty">
            <p className="art-empty-title">조건에 맞는 기고 없음.</p>
            <p>필터·검색 해제 = 전체 목록. 첫 기고 = 템플릿 <code>content/기사/_template.md</code> 복사 → 규칙(성격·영역·출처) 채움 → <code>content/기사/</code>에 저장 → 자동 게재.</p>
          </div>
        ) : (
          <div className="art-months">
            {groupByMonth(list).map((g) => (
              <section key={g.month} className="art-month">
                <h2 className="art-month-head">{g.month}</h2>
                <ul className="art-list">
                  {g.items.map((a) => (
                    <li key={a.slug} className="art-row">
                      <button type="button" onClick={() => setSel(a.slug)}>
                        <span className="art-row-title">{a.title}</span>
                        <span className="art-row-meta">
                          <span className="art-row-date">{(a.date || '').slice(5)}</span>
                          <span className="art-row-sep" aria-hidden="true">·</span>
                          <span className="art-row-author">{a.author}</span>
                          <TagChips a={a} />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
