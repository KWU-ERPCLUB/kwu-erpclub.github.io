// 인사이트(INSIGHTS) — 구조 개혁(2026-07-24 2차): 좌측 탭·허브 4섹션·월별 그룹 폐지 → AI in Use 구조.
// [page-head] → 상단 컨트롤 바(성격 칩+주제 칩+지금써먹기 토글+검색) → N건 카운트 → 2열 대형 색면 카드 그리드(고정 핀 최상단).
// URL: ?tab=<key>=성격 칩 선택 · ?p=<slug>=상세(문서 셸 변경 없음). 0건=디자인된 빈 상태.
import { useEffect, useMemo, useState, useCallback } from 'react'
import { SiteNav, SiteFooter, CONTRIBUTING_URL } from '../shared.jsx'
import { loadContent } from '../content/loader.js'
import { TOPICS } from '../content/schema.js'
import {
  HUB_TAB, TABS, stateFromSearch, searchFromState, filterArticles, pinnedFirst,
} from './insights-logic.js'
import { ArticleRow } from './insights-parts.jsx'
import ArticleDetail from './ArticleDetail.jsx'

// 칩 열 — 선택 = 차콜 필(4상태·global .art-filter 문법). 성격=주열(전체+4), 주제=보조열(전체+5).
function ChipRow({ label, options, value, onSelect, sub = false }) {
  return (
    <div className={`art-filter${sub ? ' art-filter-sub' : ''}`} role="group" aria-label={`${label} 필터`}>
      <span className="art-filter-label">{label}</span>
      {options.map((opt) => {
        const on = value === opt.val
        return (
          <button key={opt.key} type="button" className={on ? 'on' : ''} aria-pressed={on} onClick={() => onSelect(opt.val)}>
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// 목록 뷰 — 상단 컨트롤 바 + 카운트 라인 + 2열 색면 카드 그리드(고정 핀 최상단).
function ListView({ all, tab, onTab, topic, setTopic, nowUse, setNowUse, q, setQ, onOpen }) {
  const nature = tab === HUB_TAB ? null : tab
  const filtered = filterArticles(all, { nature, topic, nowUse, q })
  const { pinned, rest } = pinnedFirst(filtered)
  const natureOpts = TABS.map((t) => ({ key: t, val: t, label: t }))
  const topicOpts = [{ key: '전체', val: null, label: '전체' }, ...TOPICS.map((v) => ({ key: v, val: v, label: v }))]
  return (
    <>
      {/* 상단 컨트롤 바 — 검색 + 성격 칩 + 주제 칩 + 지금써먹기 토글 */}
      <div className="ins-controls">
        <div className="art-search">
          <input
            type="search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="제목·요약 검색" aria-label="인사이트 검색"
          />
        </div>
        <ChipRow label="성격" options={natureOpts} value={tab} onSelect={onTab} />
        <ChipRow label="주제" options={topicOpts} value={topic} onSelect={setTopic} sub />
        <div className="art-filter art-filter-toggle" role="group" aria-label="지금 써먹기 필터">
          <button type="button" className={nowUse ? 'on' : ''} aria-pressed={nowUse} onClick={() => setNowUse(!nowUse)}>지금 써먹기</button>
        </div>
      </div>

      {/* 카운트 라인 — N건 표시 중 / 전체 M건 */}
      <p className="ins-count"><strong>{filtered.length}</strong>건 표시 중 <span>· 전체 {all.length}건</span></p>

      {filtered.length === 0 ? (
        <div className="art-empty">
          <p className="art-empty-title">조건에 맞는 기고 없음.</p>
          <p>필터·검색 해제 = 전체. 첫 기고 = <a href={CONTRIBUTING_URL} target="_blank" rel="noreferrer">기고 가이드</a> 참고 → 템플릿 <code>content/기사/_template.md</code> 복사 → 규칙 채움 → 자동 게재.</p>
        </div>
      ) : (
        <ul className="art-grid">
          {pinned.map((a) => <ArticleRow key={a.slug} a={a} onOpen={onOpen} pinned />)}
          {rest.map((a) => <ArticleRow key={a.slug} a={a} onOpen={onOpen} />)}
        </ul>
      )}
    </>
  )
}

export default function Articles() {
  const all = useMemo(() => loadContent('기사'), [])
  const initial = typeof window === 'undefined' ? { tab: HUB_TAB, slug: null } : stateFromSearch(window.location.search)
  const [tab, setTab] = useState(initial.tab)
  const [sel, setSel] = useState(initial.slug)
  const [topic, setTopic] = useState(null)
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
          <p>경영·MIS 관점의 AI 이슈 분석·축적 — 스터디원이 각자의 AI 워크플로로 기고. 분류 = 글 성격 × AI 주제.</p>
        </header>
        <ListView
          all={all} tab={tab} onTab={(t) => nav({ tab: t, slug: null })}
          topic={topic} setTopic={setTopic} nowUse={nowUse} setNowUse={setNowUse}
          q={q} setQ={setQ} onOpen={openArticle}
        />
      </main>
      <SiteFooter />
    </>
  )
}
