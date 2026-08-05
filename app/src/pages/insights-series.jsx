// 시리즈 UI — 목록 상단 고정 밴드 + 전용 아카이브 뷰(오너 확정 2026-08-05).
// 오너 요구 = "주간 트렌드는 고정 썸네일로 눈에 잘 띄게 + 회차를 모아둘 공간".
// 위계 = page-head 바로 아래(피처 행보다 위) — 목록에서 가장 먼저 눈에 걸리는 자리.
// 레퍼런스 = Every.to 시리즈 블록(고정 커버 + 시리즈명·설명 + 최신 회차 크게 + 이전 회차 링크 + 전체 보기).
import { dateTimeOf } from './insights-parts.jsx'

// ── 목록 상단 밴드 — band = seriesBands()의 한 항목 { series, latest, prev, total } ──
export function SeriesBand({ band, onOpen, onSeries }) {
  const { series: s, latest, prev, total } = band
  return (
    <section className="ins-series" aria-label={`${s.표시명} 시리즈`}>
      <div className="ins-series-cover">
        <img src={s.커버} alt={`${s.표시명} 시리즈 커버`} />
      </div>
      <div className="ins-series-body">
        <span className="ins-series-idx">SERIES</span>
        <h2 className="ins-series-name">{s.표시명}</h2>
        <p className="ins-series-desc">{s.설명}</p>

        <button type="button" className="ins-series-latest" onClick={() => onOpen(latest.slug)}>
          <span className="ins-series-latest-label">최신 회차</span>
          <span className="ins-series-latest-title">{latest.title}</span>
          <span className="ins-series-latest-date">{dateTimeOf(latest)}</span>
        </button>

        {prev.length > 0 && (
          <ul className="ins-series-prev">
            {prev.map((a) => (
              <li key={a.slug}>
                <button type="button" onClick={() => onOpen(a.slug)}>
                  <span className="ins-series-prev-title">{a.title}</span>
                  <span className="ins-series-prev-date">{(a.date || '').slice(0, 10)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <button type="button" className="ins-series-all" onClick={() => onSeries(s.id)}>
          전체 보기 <span>({total}회)</span>
        </button>
      </div>
    </section>
  )
}

// ── 아카이브 뷰(?series=<id>) — 회차 역순 콤팩트 리스트. 고정 커버는 머리에서 1회만 ──
export function SeriesArchive({ series: s, items, onOpen, onBack }) {
  return (
    <section className="ins-arch">
      <header className="ins-arch-head">
        <div className="ins-arch-cover"><img src={s.커버} alt={`${s.표시명} 시리즈 커버`} /></div>
        <div className="ins-arch-meta">
          <span className="art-idx">SERIES</span>
          <h1>{s.표시명}</h1>
          <p className="ins-arch-desc">{s.설명}</p>
          <p className="ins-arch-count"><strong>{items.length}</strong>회 · {s.주기} 발행</p>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="art-empty">
          <p className="art-empty-title">아직 발행된 회차 없음.</p>
          <p>{s.주기} 발행되면 이 자리에 회차가 쌓인다.</p>
        </div>
      ) : (
        <ul className="ins-arch-list">
          {items.map((a) => (
            <li key={a.slug}>
              <button type="button" onClick={() => onOpen(a.slug)}>
                <span className="ins-arch-date">{(a.date || '').slice(0, 10)}</span>
                <span className="ins-arch-text">
                  <span className="ins-arch-title">{a.title}</span>
                  {a['설명'] && <span className="ins-arch-desc-row">{a['설명']}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <nav className="art-foot" aria-label="인사이트 이동">
        <button type="button" className="art-back" onClick={onBack}>← 인사이트 전체</button>
      </nav>
    </section>
  )
}
