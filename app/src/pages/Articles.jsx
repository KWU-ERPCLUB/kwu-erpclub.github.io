// 인사이트(INSIGHTS) — 목록 리디자인(2026-08-05 오너 픽, 레퍼런스 = 당근 careers 블로그 계열)
//   + v3.1 NEXTERS 실측 문법(§6-2a, 같은 날 2차): B2 좌 라벨 컬럼 골격(INSIGHTS/FEATURED/LATEST ■).
//   v3.2(오너 피드백 2026-08-05): 블랙 통계 밴드(B1) 완전 제거 — 인사이트 디자인은 이것으로 확정, 이외 변경 금지.
// [page-head(B2)] → FEATURED(피처 행 2건, 기본 뷰만) → LATEST(필터 바 + 그리드 + 더보기).
// 3계층 반응형 = articles.css(폰 <760 1열 리스트 / 태블릿 760~1199 2열 / 데스크톱 ≥1200 피처+3열+필터 상시 레일).
// 시리즈(2026-08-05 오너 재판정) = **필터 칩 1개**뿐. 밴드·전용 아카이브 폐지 — 시리즈 글도 일반 흐름(피처·그리드·카운트 포함).
// URL: ?tab=<key>=성격 선택 · ?series=<id>=시리즈 필터 · ?p=<slug>=상세(문서 셸 변경 없음). 0건=디자인된 빈 상태.
import { useEffect, useState, useCallback, useMemo } from 'react'
import { SiteNav, SiteFooter, PageHead, latestUpdated } from '../shared.jsx'
import { useArticles, useInteractions } from './insights-source.js'
import { loadSeen, markSeen, isNew } from './seen-store.js'
import { isPublicArticle } from '../content/schema.js'
import {
  HUB_TAB, TABS, AXIS_KEY, PAGE_SIZE, SORTS, stateFromSearch, searchFromState,
  filterArticles, pinnedFirst, extractMonths, splitFeature, pageSlice, seriesOptions, sortArticles,
} from './insights-logic.js'
import { ArticleRow, FeatureCard } from './insights-parts.jsx'
import ArticleDetail from './ArticleDetail.jsx'
// v3.1 골격 분할 CSS(상세 셸 이관분 — articles.css 315줄 부채 분할). 이 JSX가 상세도 그리므로 여기서 로드.
import '../styles/insights-detail.css'

// 축 칩(2026-09-11 개편) — 전체 + 3축. 필터는 이 한 줄뿐(구 성격 탭·주제 칩·시리즈 칩 3줄 폐지).
function AxisChips({ value, onSelect }) {
  return (
    <div className="art-filter art-filter-axis" role="group" aria-label="축 필터">
      {TABS.map((t) => (
        <button
          key={t} type="button" aria-pressed={value === t}
          className={`${value === t ? 'on' : ''}${AXIS_KEY[t] ? ` axis-${AXIS_KEY[t]}` : ''}`}
          onClick={() => onSelect(t)}
        >{t}</button>
      ))}
    </div>
  )
}

// 주간만 토글 — 시리즈 필터의 축소판(시리즈 = 주간 1개뿐). 소속 글 0건이면 그리지 않는다.
function WeeklyToggle({ options, value, onSelect }) {
  const w = options.find((o) => o.id === 'weekly')
  if (!w) return null
  const on = value === 'weekly'
  return (
    <button
      type="button" className={`art-weekly${on ? ' on' : ''}`} aria-pressed={on}
      onClick={() => onSelect(on ? null : 'weekly')}
    >주간만 <span className="art-filter-n">{w.count}</span></button>
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
export function ListView({ all, tab, onTab, series = null, setSeries = () => {}, month, setMonth, q, setQ, onOpen, status = 'ready', onRetry, countsOf = () => null, freshOf = () => false }) {
  const [shown, setShown] = useState(PAGE_SIZE)
  const [sort, setSort] = useState('new') // 4차: 정렬(최신·오래된순) — 피드백 "오래된 순도"
  const axis = tab === HUB_TAB ? null : tab
  const months = extractMonths(all)
  const serieses = seriesOptions(all)
  // 축·주간만·기간·검색 AND 결합. 주간 글은 그리드·피처·카운트에 일반 기사와 동일하게 포함된다.
  const filtered = sortArticles(filterArticles(all, { axis, series, month, q }), sort)
  const { pinned, rest } = pinnedFirst(filtered)
  const ordered = [...pinned, ...rest]
  const pinnedSlugs = new Set(pinned.map((a) => a.slug))
  // 피처 행 = 필터·검색이 하나도 없는 기본 뷰(최신순)에서만(필터 뷰 = 위계 없이 전량 그리드).
  const isDefault = !axis && !series && !month && !q.trim() && sort === 'new'
  const { feature, list } = isDefault ? splitFeature(ordered) : { feature: [], list: ordered }
  const { visible, remaining } = pageSlice(list, shown)

  // 필터 변경 = 노출 개수 초기화(더보기 상태가 조건을 넘어 남지 않게).
  useEffect(() => { setShown(PAGE_SIZE) }, [tab, series, month, q, sort])

  return (
    <>
      {/* 최신 기고 — 고정+최신 2건(4차: 좌 라벨 레일 폐지 → 중앙 구간 제목 + 콤팩트 카드, 피드백 "반만 하게·정체 명시") */}
      {status === 'ready' && feature.length > 0 && (
        <section className="ins-sec">
          <h2 className="ins-h">최신 기고</h2>
          <ul className="art-features">
            {feature.map((a) => <FeatureCard key={a.slug} a={a} onOpen={onOpen} pinned={pinnedSlugs.has(a.slug)} counts={countsOf(a.id)} fresh={freshOf(a)} />)}
          </ul>
        </section>
      )}

      {/* 전체 기고 — 필터·카운트·그리드·더보기(기능 계약 불변) */}
      <section className="ins-sec">
      <h2 className="ins-h">전체 기고</h2>
      {/* 필터 바(2026-09-11) = 1줄: 축 칩 + 주간만 / 우측 검색·기간·정렬 */}
      <div className="ins-controls">
        <div className="ins-controls-row ins-controls-axis">
          <AxisChips value={tab} onSelect={onTab} />
          <WeeklyToggle options={serieses} value={series} onSelect={setSeries} />
        </div>
        <div className="ins-controls-row">
          <div className="art-search">
            <input
              type="search" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="제목·요약 검색" aria-label="인사이트 검색"
            />
          </div>
          <div className="ins-controls-right">
            {months.length > 0 && (
              <select
                className="art-month" value={month || ''} aria-label="월 필터"
                onChange={(e) => setMonth(e.target.value || null)}
              >
                <option value="">기간 전체</option>
                {months.map((m) => <option key={m} value={m}>{m.replace('-', '.')}</option>)}
              </select>
            )}
            <select
              className="art-sort" value={sort} aria-label="정렬"
              onChange={(e) => setSort(e.target.value)}
            >
              {SORTS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 카운트 라인 — 4차 단순화(피드백 "전체 몇 건 이렇게만"): 기본 = 전체 N건 / 필터 중 = 일치 건수 병기 */}
      {status === 'ready' && (
        <p className="ins-count">
          전체 <strong>{all.length}</strong>건
          {filtered.length !== all.length && <span> · 조건 일치 {filtered.length}건</span>}
        </p>
      )}

      {status === 'loading' ? <LoadingGrid /> : status === 'error' ? <LoadError onRetry={onRetry} /> : filtered.length === 0 ? (
        <div className="art-empty">
          <p className="art-empty-title">조건에 맞는 기고 없음.</p>
          <p>필터·검색을 해제하면 전체가 보입니다.</p>
        </div>
      ) : ordered.length === 0 ? null : (
        <>
          <ul className="art-grid">
            {visible.map((a) => <ArticleRow key={a.slug} a={a} onOpen={onOpen} pinned={pinnedSlugs.has(a.slug)} counts={countsOf(a.id)} fresh={freshOf(a)} />)}
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
      </section>
    </>
  )
}

// repos·configured = 테스트 주입구(P4). 미지정 = env 판정(설정됨 → DB, 미설정 → md 글롭).
export default function Articles({ repos, configured }) {
  const { items: all, status, retry } = useArticles({ repos, configured })
  const interactions = useInteractions({ repos, configured })
  // 미열람 N 배지(2026-08-07) — 기기 로컬 열람 기록. 상세를 열면 seen 등록 → 배지 소멸(7일 경과분은 자동 제외).
  const [seen, setSeen] = useState(() => loadSeen())
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const initial = typeof window === 'undefined'
    ? { tab: HUB_TAB, slug: null, series: null }
    : stateFromSearch(window.location.search)
  const [tab, setTab] = useState(initial.tab)
  const [sel, setSel] = useState(initial.slug)
  const [series, setSeries] = useState(initial.series)
  const [month, setMonth] = useState(null)
  const [q, setQ] = useState('')

  // 뒤로가기·앞으로가기(popstate) → URL에서 탭·상세 복원.
  useEffect(() => {
    const onPop = () => {
      const s = stateFromSearch(window.location.search)
      setTab(s.tab); setSel(s.slug); setSeries(s.series)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // 상태 전환 = history.pushState로 ?tab·?series·?p 반영(뒤로가기 복원 가능).
  const nav = useCallback((next) => {
    const state = {
      tab: next.tab !== undefined ? next.tab : tab,
      slug: next.slug !== undefined ? next.slug : sel,
      series: next.series !== undefined ? next.series : series,
    }
    if (typeof window !== 'undefined') {
      window.history.pushState(state, '', searchFromState(state) || window.location.pathname)
    }
    if (next.tab !== undefined) setTab(next.tab)
    if (next.slug !== undefined) setSel(next.slug)
    if (next.series !== undefined) setSeries(next.series)
  }, [tab, sel, series])

  const openArticle = useCallback((slug) => {
    setSeen(new Set(markSeen(slug)))
    nav({ slug })
  }, [nav])
  // 보관 글(2026-09-11) = 목록·건수에서 제외, 상세 URL은 유지(북마크·외부 링크 안 깨짐).
  const pub = useMemo(() => all.filter(isPublicArticle), [all])
  const cur = all.find((a) => a.slug === sel)

  if (cur) {
    return (
      <>
        <SiteNav />
        <main id="main" className="art-page art-page--doc">
          <ArticleDetail
            cur={cur} all={pub} onOpen={openArticle}
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
      <main id="main" className="art-page art-page--list">
        {/* 설명 1줄 = 오너 삭제 2026-08-15(대시로 이어붙인 긴 설명 폐지) — 제목·목록이 이미 무슨 면인지 말한다. */}
        <PageHead
          label="INSIGHTS"
          title={<>AI <em>인사이트</em></>}
          meta={latestUpdated(pub)}
        />
        <ListView
          all={pub} tab={tab} onTab={(t) => nav({ tab: t, slug: null })}
          month={month} setMonth={setMonth}
          series={series} setSeries={(id) => nav({ series: id })}
          q={q} setQ={setQ} onOpen={openArticle}
          status={status} onRetry={retry}
          countsOf={(id) => interactions.countsOf(id)}
          freshOf={(a) => isNew(a, seen, todayKey)}
        />
      </main>
      <SiteFooter />
    </>
  )
}
