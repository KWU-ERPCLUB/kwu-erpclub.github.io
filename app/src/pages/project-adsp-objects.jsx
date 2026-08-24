// ADsP 상세 — 시각 오브젝트 4종(spec 2026-08-24 §3): V1 PassIsotype · V2 TeamRhythm · V3 RoadAxis · V5 MetricGap.
// (V4 DotField = project-adsp-viz.jsx). 규칙: 외부 라이브러리 0 · transform/opacity/SVG attr만 · 수량은 데이터 계산 ·
// reduced-motion·no-JS = 최종 상태 정적(진입 애니메이션은 IO 후 .on 클래스로만).
import { useEffect, useRef, useState } from 'react'
import { prefersReduced } from '../home-motion.jsx'
import { WEEKLY_ANSWERS, METRICS, TEAMS } from '../data/project-adsp-data.js'

// 진입 1회 게이트 — 마운트 시 정적(최종 상태), 뷰포트 진입 시 .on 부여(CSS가 재생). reduced-motion = 즉시 on.
function useEnter(threshold = 0.4) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (prefersReduced()) { setOn(true); return undefined }
    const el = ref.current
    if (!el) return undefined
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { setOn(true); io.disconnect() } })
    }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, on]
}

// ── V1 합격 아이소타입 — 응시 N 중 합격 M. 유닛 수 = 데이터(하드코딩 금지) ──
export function PassIsotype({ taken = 10, passed = 5 }) {
  const [ref, on] = useEnter()
  const rate = Math.round((passed / taken) * 100)
  return (
    <figure className={`pa-iso${on ? ' on' : ''}`} ref={ref} role="img"
      aria-label={`응시 ${taken}명 중 ${passed}명 합격, 합격률 ${rate}%`}>
      <div className="pa-iso-row" aria-hidden="true">
        {Array.from({ length: taken }, (_, i) => (
          <span key={i} className={`pa-iso-u${i < passed ? ' pass' : ''}`} style={{ '--i': i }} />
        ))}
      </div>
      <figcaption>
        <strong className="pa-iso-rate">{rate}%</strong>
        <span>최종 합격률 · 응시 {taken}명 중 {passed}명</span>
      </figcaption>
    </figure>
  )
}

// ── V2 팀 리듬 격자 — 6주 × 7일. 1팀 = 매일(월~금) 점, 2팀 = 주 1회(토) 점. 셀 수 = 주 × 7 ──
const DAYS = ['월', '화', '수', '목', '금', '토', '일']
export function teamCells(weeks = WEEKLY_ANSWERS.length) {
  const daily = []
  const weekly = []
  for (let w = 0; w < weeks; w += 1) {
    for (let d = 0; d < 7; d += 1) {
      if (d < 5) daily.push([w, d])
      if (d === 5) weekly.push([w, d])
    }
  }
  return { daily, weekly }
}
export function TeamRhythm() {
  const [ref, on] = useEnter(0.3)
  const weeks = WEEKLY_ANSWERS.length
  const { daily, weekly } = teamCells(weeks)
  const cell = 22
  const gap = 6
  const W = weeks * 7 * (cell + gap)
  const rowH = cell + 14
  const x = (w, d) => (w * 7 + d) * (cell + gap)
  const row = (name, cells, y, tone) => (
    <g className={`pa-tr-row ${tone}`}>
      <text className="pa-tr-name" x={0} y={y - 6}>{name}</text>
      {Array.from({ length: weeks * 7 }, (_, i) => (
        <rect key={i} className="pa-tr-bg" x={x(Math.floor(i / 7), i % 7)} y={y} width={cell} height={cell} rx={5} />
      ))}
      {cells.map(([w, d], i) => (
        <rect key={`${w}-${d}`} className="pa-tr-dot" x={x(w, d)} y={y} width={cell} height={cell} rx={5}
          style={{ '--i': i }} />
      ))}
    </g>
  )
  return (
    <figure className={`pa-tr${on ? ' on' : ''}`} ref={ref}>
      <svg viewBox={`-4 0 ${W + 8} ${rowH * 2 + 44}`} role="img"
        aria-label={`두 팀의 만나는 리듬, ${weeks}주. 1팀은 매일 온라인, 2팀은 주 1회 오프라인`}>
        {WEEKLY_ANSWERS.map((wk, w) => (
          <text key={wk.week} className="pa-tr-week" x={x(w, 0)} y={12}>{wk.week}</text>
        ))}
        {row(TEAMS[0].name, daily, 34, 'hot')}
        {row(TEAMS[1].name, weekly, 34 + rowH + 10, 'dark')}
        {DAYS.map((d, i) => (
          <text key={d} className="pa-tr-day" x={x(0, i) + cell / 2} y={rowH * 2 + 40} textAnchor="middle">{d}</text>
        ))}
      </svg>
      <figcaption>칸 하나가 하루. 1팀은 평일마다, 2팀은 토요일 하루. 두 리듬을 한 화면에서 잇는 것이 보드의 역할.</figcaption>
    </figure>
  )
}

// ── V3 로드맵 세로 시간축(스티키) — 노드 17개를 날짜 비례 위치에 틱으로. 현재 노드 = 스크롤 스파이(.pa-road-node.cur) ──
const AXIS_START = new Date('2026-06-26')
const AXIS_END = new Date('2026-08-10')
export function axisPos(dateStr) {
  const [m, d] = dateStr.split(/\s*~\s*/)[0].split('-').map(Number)
  const t = new Date(2026, m - 1, d) - AXIS_START
  return Math.max(0, Math.min(1, t / (AXIS_END - AXIS_START)))
}
export function RoadAxis({ nodes, current }) {
  const H = 520
  const top = 14
  const span = H - 28
  const weeks = ['6/26', '7/6', '7/13', '7/20', '7/27', '8/3', '8/10']
  return (
    <div className="pa-axis" aria-hidden="true">
      <svg viewBox={`0 0 120 ${H}`} width="120" height={H}>
        <line className="pa-axis-line" x1={70} y1={top} x2={70} y2={top + span} />
        {weeks.map((w, i) => {
          const y = top + (span * i) / (weeks.length - 1)
          return (
            <g key={w}>
              <line className="pa-axis-tick" x1={64} y1={y} x2={76} y2={y} />
              <text className="pa-axis-week" x={56} y={y + 4} textAnchor="end">{w}</text>
            </g>
          )
        })}
        {nodes.map((n, i) => {
          const y = top + span * axisPos(n.date)
          const cur = i === current
          return (
            <circle key={`${n.date}-${i}`} cx={70} cy={y}
              r={n.kind === 'major' ? (cur ? 9 : 6) : (cur ? 5 : 3)}
              className={`pa-axis-node ${n.kind}${cur ? ' cur' : ''}`} />
          )
        })}
      </svg>
    </div>
  )
}

// ── V5 지표 간극 — 절 퀴즈 정답률 vs 실전 첫 시도, 같은 축의 막대 2개 + 차이 라벨(오너 08-24: 스케일·마커형은 불명확 → 막대) ──
function pct(v) { return parseFloat(String(v).replace('%', '')) }
export function MetricGap() {
  const [ref, on] = useEnter()
  const quiz = METRICS.find((m) => m.key === '정답률')
  const real = METRICS.find((m) => m.key === '실전점수')
  const a = pct(quiz.value)
  const b = pct(real.value)
  const gap = Math.round((a - b) * 10) / 10
  const rows = [
    { k: 'quiz', label: '절 퀴즈 정답률', v: a, note: '정리본을 읽고 바로 푼 값' },
    { k: 'real', label: '실전 첫 시도', v: b, note: '모의고사·기출 첫 응시' },
  ]
  return (
    <figure className={`pa-gap${on ? ' on' : ''}`} ref={ref} role="img"
      aria-label={`절 퀴즈 정답률 ${a}%와 실전 첫 시도 ${b}%. 차이 ${gap}포인트는 정리본을 읽고 바로 푼 허수`}>
      <div className="pa-gap-rows" aria-hidden="true">
        {rows.map((r) => (
          <div className={`pa-gap-row ${r.k}`} key={r.k}>
            <span className="pa-gap-lab"><strong>{r.label}</strong><small>{r.note}</small></span>
            <span className="pa-gap-tr"><i style={{ '--w': `${r.v}%` }} /></span>
            <span className="pa-gap-val">{r.v}%</span>
          </div>
        ))}
      </div>
      <p className="pa-gap-diff">차이 <strong>{gap}p</strong>는 방금 읽고 푼 퀴즈의 허수</p>
      <figcaption>같은 8명의 두 숫자. 실력 판단은 실전 첫 시도만.</figcaption>
    </figure>
  )
}
