// 메인(/) 섹션 조각 — 중앙 섹션 헤드(SectionHead) + 하단 INSIGHTS 썸네일 줄. App.jsx가 소비(300줄 규격 분할).
// 4차 개편(2026-08-06 외부 피드백): 좌 라벨 컬럼(Cols·버건디 ■) 폐지 → 중앙 정렬 헤드,
// INSIGHTS = 텍스트 리스트 → 썸네일 카드 한 줄(3건 — 피드백 "넣을 거면 썸네일형으로 짧게").
import { Arrow } from './shared.jsx'
import { loadContent } from './content/loader.js'
import { Thumb } from './pages/insights-parts.jsx'

// 중앙 섹션 헤드 — 소형 영문 키커 + h2(전 섹션 공용, 라벨 영문 정책 승계).
export function SectionHead({ label, title }) {
  return (
    <header className="hs-head">
      <span className="hs-label rv">{label}</span>
      <h2 className="hs-title rv" style={{ transitionDelay: '90ms' }}>{title}</h2>
    </header>
  )
}

// INSIGHTS — 메인 하단 "최근 활동"(북극성 §5). 썸네일 3건 한 줄 + 전체 보기.
// 데이터 = 이미 메인 번들에 있는 loadContent('기사')(빌드타임 글롭 · 날짜 내림차순 정렬 완료) 상위 3건 —
// 새 로더·런타임 fetch 0. 딥링크 = /insights/?p=<슬러그>(Articles.jsx searchFromState 계약).
export const HOME_INSIGHTS_COUNT = 3

export function HomeInsights() {
  const recent = loadContent('기사').slice(0, HOME_INSIGHTS_COUNT)
  return (
    <section className="hs hs-insights page" id="insights">
      <div className="hs-in">
        <SectionHead label="INSIGHTS" title={<>최근 <em>인사이트</em></>} />
        <ul className="hi-grid rv" style={{ transitionDelay: '180ms' }}>
          {recent.map((a) => (
            <li className="hi-item" key={a.slug}>
              <a className="hi-card" href={`/insights/?p=${a.slug}`}>
                <Thumb a={a} />
                <span className="hi-title">{a.title}</span>
                <span className="hi-date">{a.date}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="hs-more rv" style={{ transitionDelay: '260ms' }}>
          <a className="btn-2nd" href="/insights/">전체 보기 <Arrow /></a>
        </p>
      </div>
    </section>
  )
}
