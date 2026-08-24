// ADsP 인터랙티브 상세 v2 — 로드맵 레일·플로우 체인·팀 블록·유지/변경 리스트.
// v3(오너 피드백 2026-08-24): 텍스트 대신 시각 요소, 가운데 정렬, 컬러 포인트(ok 초록·warn 앰버·accent 버건디).
// 스타일 = project-adsp-road.css.
import { ROADMAP } from '../data/project-adsp-roadmap.js'
import { TEAMS, TEAM_EXTRAS } from '../data/project-adsp-data.js'

// ── 플로우 체인 — 번호 단계 카드 + 화살표(모바일 세로). 학습 설계(hot)·제작 스택 공용 ──
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

// ── 팀 블록 — 두 팀을 사람 도트로 시각화 + 공통 장치 2칩 ──
export function TeamSplit() {
  return (
    <div className="pa-teams-wrap">
      <div className="pa-teams">
        {TEAMS.map((t, i) => (
          <div className={`pa-team pa-rv ${i === 0 ? 'online' : 'offline'}`} key={t.name}>
            <span className="pa-team-name">{t.name}</span>
            <span className="pa-team-dots" aria-label={`${t.n}명`}>
              {Array.from({ length: t.n }, (_, j) => <i key={j} />)}
            </span>
            <strong className="pa-team-mode">{t.mode}</strong>
            <p>{t.desc}</p>
          </div>
        ))}
      </div>
      <div className="pa-team-extras">
        {TEAM_EXTRAS.map((e) => (
          <div className="pa-team-extra pa-rv" key={e.k}>
            <strong>{e.k}</strong>
            <span>{e.sub}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 유지/변경 2열 — 글리프 마커(✓ 초록 / ↻ 앰버·! 버건디) + 키워드 + 한 줄 ──
export function SplitList({ left, right }) {
  const col = (c) => (
    <div className={`pa-split-col ${c.tone}`}>
      <h3><span className="pa-split-glyph" aria-hidden="true">{c.glyph}</span>{c.title}</h3>
      <ul>
        {c.items.map((it) => (
          <li className="pa-rv" key={it.k}>
            <strong>{it.k}</strong>
            <span>{it.sub}</span>
          </li>
        ))}
      </ul>
    </div>
  )
  return <div className="pa-split">{col(left)}{col(right)}</div>
}

// ── 로드맵 레일 — 세로 스파인 위에 major(문제→결정→결과) / minor(한 줄) 시간순 교차 ──
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
