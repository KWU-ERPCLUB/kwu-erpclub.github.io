// 메인(/) 섹션 조각 — 좌 라벨 컬럼 골격(Cols) + 하단 INSIGHTS 섹션. App.jsx가 소비(300줄 규격 분할).
// 시각 문법 = 기존 것만 승계(헤어라인 리스트 = .wl·.fx-item 계열). 새 시각 언어 발명 0.
import { Arrow } from './shared.jsx'
import { loadContent } from './content/loader.js'

// B2 좌 라벨 컬럼 골격 — 좌 고정 라벨(버건디 ■ + 소형 영문) / 우 콘텐츠. 폰(≤820px) = 상하 적층.
export function Cols({ label, children }) {
  return (
    <div className="hs-in hs-cols">
      <div className="hs-side"><span className="hs-label rv">{label}</span></div>
      <div className="hs-body">{children}</div>
    </div>
  )
}

// INSIGHTS — 메인 하단 "최근 활동"(북극성 §5). 기사 노출 0이던 결함 수정(2026-08-05).
// 데이터 = 이미 메인 번들에 있는 loadContent('기사')(빌드타임 글롭 · 날짜 내림차순 정렬 완료) 상위 3건 —
// 새 로더·런타임 fetch 0. 딥링크 = /insights/?p=<슬러그>(Articles.jsx searchFromState 계약).
export const HOME_INSIGHTS_COUNT = 3

export function HomeInsights() {
  const recent = loadContent('기사').slice(0, HOME_INSIGHTS_COUNT)
  return (
    <section className="hs hs-insights page" id="insights">
      <Cols label="04 — INSIGHTS">
        <h2 className="hs-title rv" style={{ transitionDelay: '90ms' }}>최근 <em>인사이트</em></h2>
        <ul className="hi-list rv" style={{ transitionDelay: '180ms' }}>
          {recent.map((a) => (
            <li className="hi-item" key={a.slug}>
              <a className="hi-link" href={`/insights/?p=${a.slug}`}>
                <span className="hi-meta">
                  <span className="hi-nature">{a['성격']}</span>
                  <span className="hi-date">{a.date}</span>
                </span>
                <span className="hi-title">{a.title}</span>
                <span className="hi-desc">{a['설명']}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="hp-more-links rv" style={{ transitionDelay: '260ms' }}>
          <a className="proof-link" href="/insights/">전체 보기 <Arrow /></a>
        </p>
      </Cols>
    </section>
  )
}
