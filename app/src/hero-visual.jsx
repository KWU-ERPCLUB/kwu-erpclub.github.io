// 히어로 키비주얼(2026-08-05 2차) — §6-2a 4문법 중 미이식분("비주얼 주인공·텍스트 최소")의 절제 이식.
// 모티프 = 정보시스템 격자(헤어라인) 위 노드 + 버건디 궤적 — 추상·기하만(일러스트·아이콘·클립아트 0).
// 색 = 토큰만(--line 격자 / --dark 노드 / --accent 궤적·강조 노드). 버건디 = 선·점만(대면적 0 — §1 금지 준수).
// 배치 = 히어로 우측 배경 레이어(텍스트 위가 아니라 뒤·우측 여백) · 장식이라 aria-hidden.
// 모션 = CSS 1회 발화(궤적 드로잉·노드 페이드)뿐 — JS 루프 0·무한루프 0·reduced-motion 시 정지(home.css).
// 독립 컴포넌트 = 라이브에서 과하면 App.jsx 한 줄 제거로 원복(1 커밋 = revert 단위).
const STEP = 40
const SPAN = 360 // 격자 유효 폭·높이(여백 20 확보)
const TICKS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

// 궤적 경유점 — 격자 교점만 사용(자유 곡선 금지). AI(좌상)→MIS(우하) 흐름을 대각으로 가로지른다.
const TRACE = [[2, 3], [4, 1], [6, 4], [4, 6], [7, 8]]
// 격자 위 무채색 노드(문맥) — 궤적과 겹치지 않는 교점.
const DOTS = [[1, 6], [3, 8], [8, 2], [6, 7], [2, 1]]

const px = (n) => 20 + n * STEP

export default function HeroVisual() {
  const path = TRACE.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${px(x)} ${px(y)}`).join(' ')
  return (
    <svg className="hero-kv" viewBox="0 0 400 400" fill="none" aria-hidden="true" focusable="false">
      <g className="kv-grid" stroke="var(--line)" strokeWidth="1">
        {TICKS.map((t) => <line key={`h${t}`} x1="20" y1={px(t)} x2={20 + SPAN} y2={px(t)} />)}
        {TICKS.map((t) => <line key={`v${t}`} x1={px(t)} y1="20" x2={px(t)} y2={20 + SPAN} />)}
      </g>
      {DOTS.map(([x, y]) => (
        <circle className="kv-dot" key={`d${x}-${y}`} cx={px(x)} cy={px(y)} r="3" fill="var(--dark)" />
      ))}
      <path className="kv-trace" d={path} stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {TRACE.map(([x, y], i) => (
        <circle
          className="kv-node"
          key={`n${x}-${y}`}
          cx={px(x)}
          cy={px(y)}
          r={i === TRACE.length - 1 ? 5 : 3.5}
          fill={i === 0 || i === TRACE.length - 1 ? 'var(--accent)' : 'var(--dark)'}
        />
      ))}
      {/* 종점 강조 링 — 버건디 마이크로 액센트(면 아님·지름 28px 내) */}
      <circle className="kv-ring" cx={px(TRACE[TRACE.length - 1][0])} cy={px(TRACE[TRACE.length - 1][1])} r="13" stroke="var(--accent)" strokeWidth="1.5" />
    </svg>
  )
}
