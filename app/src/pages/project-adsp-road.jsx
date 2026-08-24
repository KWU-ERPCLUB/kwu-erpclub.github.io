// ADsP 인터랙티브 상세 v2 — 로드맵 레일 + 플로우 체인(학습 설계·제작 다이어그램).
// 오너 지시(2026-08-24): 로드맵 = 핵심 결정(major) 카드 + 사이사이 자잘한 결정(minor)을 한 레일에,
// 제작·학습 구조는 비개발자도 직관적으로 읽히는 단계 다이어그램으로. 스타일 = project-adsp-road.css.
import { ROADMAP } from '../data/project-adsp-roadmap.js'

// ── 플로우 체인 — 번호 붙은 단계 카드 + 화살표(모바일 = 세로 적층). 학습 설계·제작 스택 공용 ──
export function FlowChain({ items, ariaLabel, tone = '' }) {
  return (
    <ol className={`pa-flow ${tone}`.trim()} aria-label={ariaLabel}>
      {items.map((it, i) => (
        <li className="pa-flow-step pa-rv" key={it.k}>
          <span className="pa-flow-no" aria-hidden="true">{i + 1}</span>
          <span className="pa-flow-k">{it.k}</span>
          {it.name ? <span className="pa-flow-name">{it.name}</span> : null}
          <p>{it.desc}</p>
          {it.who ? <span className="pa-flow-who">{it.who}</span> : null}
        </li>
      ))}
    </ol>
  )
}

// ── 로드맵 레일 — 세로 스파인 위에 major(문제→결정→결과 카드) / minor(한 줄) 시간순 교차 ──
// media: major 노드에 끼워 넣을 시각 자료 슬롯(토글 비교·지표 표·프롬프트 카드 등) — 페이지가 주입.
export function RoadmapRail({ media = {} }) {
  return (
    <ol className="pa-road" aria-label="보드 고도화 로드맵">
      {ROADMAP.map((n) => (n.kind === 'major' ? (
        <li className="pa-road-node major pa-rv" key={n.title}>
          <span className="pa-road-dot" aria-hidden="true" />
          <div className="pa-road-card">
            <span className="pa-road-date">{n.date}</span>
            <h3>{n.title}</h3>
            <div className="pa-road-tri">
              <div className="pa-road-cell"><span className="pa-road-label">문제</span><p>{n.problem}</p></div>
              <div className="pa-road-cell main"><span className="pa-road-label">결정</span><p>{n.decision}</p></div>
              <div className="pa-road-cell"><span className="pa-road-label">결과</span><p>{n.result}</p></div>
            </div>
            {n.media && media[n.media] ? <div className="pa-road-media">{media[n.media]}</div> : null}
          </div>
        </li>
      ) : (
        <li className="pa-road-node minor pa-rv" key={`${n.date}-${n.text}`}>
          <span className="pa-road-dot sm" aria-hidden="true" />
          <div className="pa-road-mini">
            <span className="pa-road-date">{n.date}</span>
            <p>{n.text}</p>
          </div>
        </li>
      )))}
    </ol>
  )
}
