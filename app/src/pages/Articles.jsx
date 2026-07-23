import { useEffect, useMemo, useState, useCallback } from 'react'
import { SiteNav, SiteFooter, CONTRIBUTING_URL } from '../shared.jsx'
import { loadContent } from '../content/loader.js'
import { AREAS } from '../content/schema.js'
import {
  HUB_TAB, TABS, stateFromSearch, searchFromState, filterArticles, groupByMonth,
} from './insights-logic.js'
import { ArticleRow } from './insights-parts.jsx'
import InsightsHub from './InsightsHub.jsx'
import ArticleDetail from './ArticleDetail.jsx'

// 좌측 성격 탭(내부형 §3) — 데스크톱 좌측 고정, ≤820px 상단 가로 스크롤 칩(CSS). 현재 탭 강조(4상태).
function Tabs({ tab, onTab }) {
  return (
    <nav className="art-tabs" aria-label="성격 탭">
      {TABS.map((t) => (
        <button key={t} type="button" className={t === tab ? 'on' : ''} aria-pressed={t === tab} onClick={() => onTab(t)}>
          {t}
        </button>
      ))}
    </nav>
  )
}

// 성격 탭 뷰 — 그 성격만 월별 그룹 목록(기존 서식) + 영역·지금써먹기·검색 필터 유지.
function NatureList({ nature, all, area, setArea, nowUse, setNowUse, q, setQ, onOpen }) {
  const list = filterArticles(all, { nature, area, nowUse, q })
  return (
    <>
      <div className="art-search">
        <input
          type="search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="제목·요약 검색" aria-label="기사 검색"
        />
      </div>

      <div className="art-filter art-filter-sub" role="group" aria-label="영역 필터">
        <span className="art-filter-label">영역</span>
        <button type="button" className={area ? '' : 'on'} aria-pressed={!area} onClick={() => setArea(null)}>전체</button>
        {AREAS.map((v) => (
          <button key={v} type="button" className={area === v ? 'on' : ''} aria-pressed={area === v} onClick={() => setArea(v)}>{v}</button>
        ))}
      </div>

      <div className="art-filter art-filter-toggle" role="group" aria-label="지금 써먹기 필터">
        <button type="button" className={nowUse ? 'on' : ''} aria-pressed={nowUse} onClick={() => setNowUse(!nowUse)}>지금 써먹기</button>
      </div>

      {list.length === 0 ? (
        <div className="art-empty">
          <p className="art-empty-title">조건에 맞는 기고 없음.</p>
          <p>필터·검색 해제 = 이 성격 전체. 첫 기고 = <a href={CONTRIBUTING_URL} target="_blank" rel="noreferrer">기고 가이드</a> 참고 → 템플릿 <code>content/기사/_template.md</code> 복사 → 규칙 채움 → 자동 게재.</p>
        </div>
      ) : (
        <div className="art-months">
          {groupByMonth(list).map((g) => (
            <section key={g.month} className="art-month">
              <h2 className="art-month-head">{g.month}</h2>
              <ul className="art-list">
                {g.items.map((a) => <ArticleRow key={a.slug} a={a} onOpen={onOpen} />)}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  )
}

export default function Articles() {
  const all = useMemo(() => loadContent('기사'), [])
  const initial = typeof window === 'undefined' ? { tab: HUB_TAB, slug: null } : stateFromSearch(window.location.search)
  const [tab, setTab] = useState(initial.tab)
  const [sel, setSel] = useState(initial.slug)
  const [area, setArea] = useState(null)
  const [nowUse, setNowUse] = useState(false)
  const [q, setQ] = useState('')

  // 뒤로가기·앞으로가기(popstate) → URL에서 탭·상세 복원.
  useEffect(() => {
    const onPop = () => { const s = stateFromSearch(window.location.search); setTab(s.tab); setSel(s.slug) }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // 상태 전환 = history.pushState로 ?tab·?p 반영(뒤로가기 복원 가능).
  const nav = useCallback((next) => {
    const state = { tab: next.tab !== undefined ? next.tab : tab, slug: next.slug !== undefined ? next.slug : sel }
    if (typeof window !== 'undefined') {
      window.history.pushState(state, '', searchFromState(state) || window.location.pathname)
    }
    if (next.tab !== undefined) setTab(next.tab)
    if (next.slug !== undefined) setSel(next.slug)
  }, [tab, sel])

  const openArticle = useCallback((slug) => nav({ slug }), [nav])
  const cur = all.find((a) => a.slug === sel)

  if (cur) {
    return (
      <>
        <SiteNav />
        <main className="art-page art-page--doc">
          <ArticleDetail cur={cur} all={all} onOpen={openArticle} onBack={() => nav({ slug: null })} />
        </main>
        <SiteFooter />
      </>
    )
  }

  return (
    <>
      <SiteNav />
      <main className="art-page art-page--list">
        <header className="art-head">
          <span className="art-idx">AI INSIGHTS</span>
          <h1>AI <em>인사이트</em></h1>
          <p>경영·MIS 관점의 AI 이슈 분석·축적 — 스터디원이 각자의 AI 워크플로로 기고. 분류 = 글 성격 × 업무 영역.</p>
        </header>

        <div className="art-layout">
          <Tabs tab={tab} onTab={(t) => nav({ tab: t, slug: null })} />
          <div className="art-main">
            {tab === HUB_TAB ? (
              <InsightsHub all={all} onOpen={openArticle} onTab={(t) => nav({ tab: t, slug: null })} />
            ) : (
              <NatureList
                nature={tab} all={all} area={area} setArea={setArea}
                nowUse={nowUse} setNowUse={setNowUse} q={q} setQ={setQ} onOpen={openArticle}
              />
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
