// 인사이트(INSIGHTS) — 목록 리디자인(2026-08-05 오너 픽, 레퍼런스 = 당근 careers 블로그 계열)
//   + v3.1 NEXTERS 실측 문법(§6-2a, 같은 날 2차): B2 좌 라벨 컬럼 골격(INSIGHTS/FEATURED/LATEST ■).
//   v3.2(오너 피드백 2026-08-05): 블랙 통계 밴드(B1) 완전 제거 — 인사이트 디자인은 이것으로 확정, 이외 변경 금지.
// [page-head(B2)] → FEATURED(피처 행 2건, 기본 뷰만) → LATEST(필터 바 + 그리드 + 더보기).
// 3계층 반응형 = articles.css(폰 <760 1열 리스트 / 태블릿 760~1199 2열 / 데스크톱 ≥1200 피처+3열+필터 상시 레일).
// 시리즈(2026-08-05 오너 재판정) = **필터 칩 1개**뿐. 밴드·전용 아카이브 폐지 — 시리즈 글도 일반 흐름(피처·그리드·카운트 포함).
// URL: ?tab=<key>=성격 선택 · ?series=<id>=시리즈 필터 · ?p=<slug>=상세(문서 셸 변경 없음). 0건=디자인된 빈 상태.
import { useEffect, useState, useCallback } from 'react'
import { SiteNav, SiteFooter, PageHead, latestUpdated, CONTRIBUTING_URL } from '../shared.jsx'
import { useArticles, useInteractions } from './insights-source.js'
import { TOPICS } from '../content/schema.js'
import {
  HUB_TAB, TABS, NATURE_KEY, PAGE_SIZE, stateFromSearch, searchFromState,
  filterArticles, pinnedFirst, extractMonths, splitFeature, pageSlice, seriesOptions,
} from './insights-logic.js'
import { ArticleRow, FeatureCard, SectionLabel } from './insights-parts.jsx'
import ArticleDetail from './ArticleDetail.jsx'
// v3.1 골격 분할 CSS(상세 셸 이관분 — articles.css 315줄 부채 분할). 이 JSX가 상세도 그리므로 여기서 로드.
import '../styles/insights-detail.css'

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

// 시리즈 칩 열 — 정기 연재(주간·분기 등) 필터. 레지스트리 기반 = 시리즈 추가 시 칩 자동 증가.
// 소속 글이 0건이면 열 전체를 그리지 않는다(빈 필터 금지).
function SeriesChips({ options, value, onSelect }) {
  if (options.length === 0) return null
  return (
    <div className="art-filter art-filter-sub" role="group" aria-label="시리즈 필터">
      <span className="art-filter-label">시리즈</span>
      <button
        type="button" aria-pressed={value === null}
        className={value === null ? 'on' : ''} onClick={() => onSelect(null)}
      >전체</button>
      {options.map((o) => (
        <button
          key={o.id} type="button" aria-pressed={value === o.id}
          className={value === o.id ? 'on' : ''} onClick={() => onSelect(o.id)}
        >{o.label} <span className="art-filter-n">{o.count}</span></button>
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
export function ListView({ all, tab, onTab, topic, setTopic, series = null, setSeries = () => {}, month, setMonth, q, setQ, onOpen, status = 'ready', onRetry }) {
  const [shown, setShown] = useState(PAGE_SIZE)
  const nature = tab === HUB_TAB ? null : tab
  const months = extractMonths(all)
  const serieses = seriesOptions(all)
  // 시리즈 = 다른 필터와 같은 문법(AND 결합). 시리즈 글은 그리드·피처·카운트에 일반 기사와 동일하게 포함된다.
  const filtered = filterArticles(all, { nature, topic, series, month, q })
  const { pinned, rest } = pinnedFirst(filtered)
  const ordered = [...pinned, ...rest]
  const pinnedSlugs = new Set(pinned.map((a) => a.slug))
  // 피처 행 = 필터·검색이 하나도 없는 기본 뷰에서만(필터 뷰 = 위계 없이 전량 그리드).
  const isDefault = !nature && !topic && !series && !month && !q.trim()
  const { feature, list } = isDefault ? splitFeature(ordered) : { feature: [], list: ordered }
  const { visible, remaining } = pageSlice(list, shown)

  // 필터 변경 = 노출 개수 초기화(더보기 상태가 조건을 넘어 남지 않게).
  useEffect(() => { setShown(PAGE_SIZE) }, [tab, topic, series, month, q])

  return (
    <>
      {/* v3.1 B2 — FEATURED: 좌 라벨 / 우 피처 카드(고정+최신 2건, 기본 뷰만) */}
      {status === 'ready' && feature.length > 0 && (
        <section className="ins-sec">
          <SectionLabel>FEATURED</SectionLabel>
          <div className="ins-sec-body">
            <ul className="art-features">
              {feature.map((a) => <FeatureCard key={a.slug} a={a} onOpen={onOpen} pinned={pinnedSlugs.has(a.slug)} />)}
            </ul>
          </div>
        </section>
      )}

      {/* v3.1 B2 — LATEST: 좌 라벨 / 우 필터·카운트·그리드·더보기(기능 계약 불변) */}
      <section className="ins-sec">
      <SectionLabel>LATEST</SectionLabel>
      <div className="ins-sec-body">
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
          <SeriesChips options={serieses} value={series} onSelect={setSeries} />
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
      ) : ordered.length === 0 ? null : (
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
      </div>
      </section>
    </>
  )
}

// repos·configured = 테스트 주입구(P4). 미지정 = env 판정(설정됨 → DB, 미설정 → md 글롭).
export default function Articles({ repos, configured }) {
  const { items: all, status, retry } = useArticles({ repos, configured })
  const interactions = useInteractions({ repos, configured })
  const initial = typeof window === 'undefined'
    ? { tab: HUB_TAB, slug: null, series: null }
    : stateFromSearch(window.location.search)
  const [tab, setTab] = useState(initial.tab)
  const [sel, setSel] = useState(initial.slug)
  const [series, setSeries] = useState(initial.series)
  const [topic, setTopic] = useState(null)
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
        {/* 페이지 헤드 = 공용 PageHead(3차 통일) — 좌 라벨 INSIGHTS가 눈썹 역할 승계 */}
        <PageHead
          label="INSIGHTS"
          title={<>AI <em>인사이트</em></>}
          sub="AI 이슈의 분석·축적 — 스터디원 기고."
          meta={latestUpdated(all)}
        />
        <ListView
          all={all} tab={tab} onTab={(t) => nav({ tab: t, slug: null })}
          topic={topic} setTopic={setTopic} month={month} setMonth={setMonth}
          series={series} setSeries={(id) => nav({ series: id })}
          q={q} setQ={setQ} onOpen={openArticle}
          status={status} onRetry={retry}
        />
      </main>
      <SiteFooter />
    </>
  )
}
