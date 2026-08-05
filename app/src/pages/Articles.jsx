// 인사이트(INSIGHTS) — 목록 리디자인(2026-08-05 오너 픽, 레퍼런스 = 당근 careers 블로그 계열).
// [page-head] → 피처 행(고정+최신 2건·큰 썸네일, 기본 뷰만) → 필터 바(성격 탭 5 + 검색 + 주제 칩 + 기간)
//   → 썸네일 카드 그리드(배경 통일·성격=컬러 라벨) → 더보기(무한스크롤 금지).
// 3계층 반응형 = articles.css(폰 <760 1열 리스트 / 태블릿 760~1199 2열 / 데스크톱 ≥1200 피처+3열+필터 상시 레일).
// URL: ?tab=<key>=성격 선택 · ?p=<slug>=상세(문서 셸 변경 없음). 0건=디자인된 빈 상태.
import { useEffect, useState, useCallback } from 'react'
import { SiteNav, SiteFooter, CONTRIBUTING_URL } from '../shared.jsx'
import { useArticles, useInteractions } from './insights-source.js'
import { TOPICS } from '../content/schema.js'
import {
  HUB_TAB, TABS, NATURE_KEY, PAGE_SIZE, stateFromSearch, searchFromState,
  filterArticles, pinnedFirst, extractMonths, splitFeature, pageSlice,
} from './insights-logic.js'
import { ArticleRow, FeatureCard } from './insights-parts.jsx'
import ArticleDetail from './ArticleDetail.jsx'

// 성격 탭 — 5개 상한(전체+4). 선택 = 언더라인 탭(칩 색면 아님 — 성격색은 카드 라벨이 담당).
function NatureTabs({ value, onSelect }) {
  return (
    <div className="ins-tabs" role="tablist" aria-label="성격 탭">
      {TABS.map((t) => (
        <button
          key={t} type="button" role="tab" aria-selected={value === t}
          className={`ins-tab${value === t ? ' on' : ''}${NATURE_KEY[t] ? ` chip-${NATURE_KEY[t]}` : ''}`}
          onClick={() => onSelect(t)}
        >{t}</button>
      ))}
    </div>
  )
}

// 주제 칩 열 — 보조 필터(전체 + TOPICS).
function TopicChips({ value, onSelect }) {
  const opts = [{ val: null, label: '전체' }, ...TOPICS.map((v) => ({ val: v, label: v }))]
  return (
    <div className="art-filter art-filter-sub" role="group" aria-label="주제 필터">
      <span className="art-filter-label">주제</span>
      {opts.map((o) => (
        <button
          key={o.label} type="button" aria-pressed={value === o.val}
          className={value === o.val ? 'on' : ''} onClick={() => onSelect(o.val)}
        >{o.label}</button>
      ))}
    </div>
  )
}

// 로딩 골격 — DB 페치 대기(카드 그리드와 같은 자리·같은 크기).
function LoadingGrid() {
  return (
    <ul className="art-grid art-grid--loading" role="status" aria-label="인사이트 불러오는 중">
      {[0, 1, 2, 3, 4, 5].map((i) => <li key={i} className="art-card art-card--skeleton" aria-hidden="true" />)}
    </ul>
  )
}

// 오류 — 짧은 안내 + 재시도(빈 상태 블록과 같은 문법: surface 면 + accent 좌변).
function LoadError({ onRetry }) {
  return (
    <div className="art-empty" role="alert">
      <p className="art-empty-title">인사이트를 불러오지 못함.</p>
      <p>네트워크 또는 백엔드 일시 오류. 잠시 후 재시도.</p>
      <button type="button" className="art-retry" onClick={onRetry}>다시 시도</button>
    </div>
  )
}

// 목록 뷰. export = 픽스처 주입 테스트용. status/onRetry = DB 페치 상태(기본 'ready').
export function ListView({ all, tab, onTab, topic, setTopic, month, setMonth, q, setQ, onOpen, status = 'ready', onRetry }) {
  const [shown, setShown] = useState(PAGE_SIZE)
  const nature = tab === HUB_TAB ? null : tab
  const months = extractMonths(all)
  const filtered = filterArticles(all, { nature, topic, month, q })
  const { pinned, rest } = pinnedFirst(filtered)
  const ordered = [...pinned, ...rest]
  const pinnedSlugs = new Set(pinned.map((a) => a.slug))
  // 피처 행 = 필터·검색이 하나도 없는 기본 뷰에서만(필터 뷰 = 위계 없이 전량 그리드).
  const isDefault = !nature && !topic && !month && !q.trim()
  const { feature, list } = isDefault ? splitFeature(ordered) : { feature: [], list: ordered }
  const { visible, remaining } = pageSlice(list, shown)

  // 필터 변경 = 노출 개수 초기화(더보기 상태가 조건을 넘어 남지 않게).
  useEffect(() => { setShown(PAGE_SIZE) }, [tab, topic, month, q])

  return (
    <>
      {/* 피처 행 — 고정 기사 + 최신, 큰 썸네일(2건) */}
      {status === 'ready' && feature.length > 0 && (
        <ul className="art-features">
          {feature.map((a) => <FeatureCard key={a.slug} a={a} onOpen={onOpen} pinned={pinnedSlugs.has(a.slug)} />)}
        </ul>
      )}

      {/* 필터 바 — 데스크톱(≥1200) 상시 노출 레일, 그 이하는 세로 스택 */}
      <div className="ins-controls">
        <NatureTabs value={tab} onSelect={onTab} />
        <div className="ins-controls-sub">
          <div className="art-search">
            <input
              type="search" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="제목·요약 검색" aria-label="인사이트 검색"
            />
          </div>
          <TopicChips value={topic} onSelect={setTopic} />
          {months.length > 0 && (
            <div className="art-filter art-filter-sub">
              <span className="art-filter-label">기간</span>
              <select
                className="art-month" value={month || ''} aria-label="월 필터"
                onChange={(e) => setMonth(e.target.value || null)}
              >
                <option value="">전체</option>
                {months.map((m) => <option key={m} value={m}>{m.replace('-', '.')}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 카운트 라인 — N건 표시 중 / 전체 M건 (로딩 중에는 숫자 대신 골격) */}
      {status === 'ready' && (
        <p className="ins-count"><strong>{filtered.length}</strong>건 표시 중 <span>· 전체 {all.length}건</span></p>
      )}

      {status === 'loading' ? <LoadingGrid /> : status === 'error' ? <LoadError onRetry={onRetry} /> : filtered.length === 0 ? (
        <div className="art-empty">
          <p className="art-empty-title">조건에 맞는 기고 없음.</p>
          <p>필터·검색 해제 = 전체. 첫 기고 = <a href={CONTRIBUTING_URL} target="_blank" rel="noreferrer">기고 가이드</a> 참고 → 템플릿 <code>content/기사/_template.md</code> 복사 → 규칙 채움 → 자동 게재.</p>
        </div>
      ) : (
        <>
          <ul className="art-grid">
            {visible.map((a) => <ArticleRow key={a.slug} a={a} onOpen={onOpen} pinned={pinnedSlugs.has(a.slug)} />)}
          </ul>
          {remaining > 0 && (
            <div className="art-more-wrap">
              <button type="button" className="art-more" onClick={() => setShown((n) => n + PAGE_SIZE)}>
                더 보기 <span>({remaining}건 남음)</span>
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}

// repos·configured = 테스트 주입구(P4). 미지정 = env 판정(설정됨 → DB, 미설정 → md 글롭).
export default function Articles({ repos, configured }) {
  const { items: all, status, retry } = useArticles({ repos, configured })
  const interactions = useInteractions({ repos, configured })
  const initial = typeof window === 'undefined' ? { tab: HUB_TAB, slug: null } : stateFromSearch(window.location.search)
  const [tab, setTab] = useState(initial.tab)
  const [sel, setSel] = useState(initial.slug)
  const [topic, setTopic] = useState(null)
  const [month, setMonth] = useState(null)
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
          <ArticleDetail
            cur={cur} all={all} onOpen={openArticle}
            onBack={() => nav({ slug: null })} interactions={interactions}
          />
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
          <p>AI 이슈의 분석·축적 — 스터디원 기고.</p>
        </header>
        <ListView
          all={all} tab={tab} onTab={(t) => nav({ tab: t, slug: null })}
          topic={topic} setTopic={setTopic} month={month} setMonth={setMonth}
          q={q} setQ={setQ} onOpen={openArticle}
          status={status} onRetry={retry}
        />
      </main>
      <SiteFooter />
    </>
  )
}
