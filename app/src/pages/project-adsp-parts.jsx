// ADsP 인터랙티브 상세 — 조각 컴포넌트(차트·캐러셀·탭·비교 슬라이더).
// 규격: 외부 라이브러리 0 · 인라인 SVG · reduced-motion 정지 · 색 = 차콜 본체 + 버건디 강조(단일 계열,
// 식별은 축·직접 라벨이 담당 — dataviz 규칙: 범례 없는 단일 시리즈 + 강조 1).
import { useEffect, useRef, useState } from 'react'
import { prefersReduced } from '../home-motion.jsx'
import { WEEKLY_ANSWERS, METRICS, TOOL_SLIDES } from '../data/project-adsp-data.js'

// ── 주별 답안 막대 차트 — hover 툴팁 + 강조 막대 직접 라벨 ─────────────────
export function WeeklyChart() {
  const [hov, setHov] = useState(null)
  const W = 640
  const H = 300
  const PAD = { t: 34, r: 12, b: 34, l: 12 }
  const max = Math.max(...WEEKLY_ANSWERS.map((d) => d.value))
  const iw = (W - PAD.l - PAD.r) / WEEKLY_ANSWERS.length
  const bw = Math.min(64, iw - 14)
  return (
    <figure className="pa-chart" aria-label="주별 답안 수 막대 차트">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" onMouseLeave={() => setHov(null)}>
        {WEEKLY_ANSWERS.map((d, i) => {
          const h = Math.max(3, ((H - PAD.t - PAD.b) * d.value) / max)
          const x = PAD.l + iw * i + (iw - bw) / 2
          const y = H - PAD.b - h
          const on = hov === i
          return (
            <g key={d.week}>
              {/* 히트 영역 = 막대보다 크게(인터랙션 규칙) */}
              <rect x={PAD.l + iw * i} y={PAD.t - 20} width={iw} height={H - PAD.t - PAD.b + 20}
                fill="transparent" onMouseEnter={() => setHov(i)} />
              <rect className={`pa-bar${d.hot ? ' hot' : ''}${on ? ' on' : ''}`}
                x={x} y={y} width={bw} height={h} rx="4" />
              {/* 직접 라벨 = 강조 막대 상시 · 나머지는 hover 시 */}
              {(d.hot || on) && (
                <text className={`pa-bar-val${d.hot ? ' hot' : ''}`} x={x + bw / 2} y={y - 8} textAnchor="middle">
                  {d.value.toLocaleString()}
                </text>
              )}
              <text className="pa-bar-week" x={x + bw / 2} y={H - PAD.b + 20} textAnchor="middle">{d.week}</text>
            </g>
          )
        })}
        {/* 베이스라인 */}
        <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} className="pa-axis" />
      </svg>
      <figcaption>
        주(월~일)별 답안 수 — 정식 8명 합계 7,976건. <strong>시험 주에 52.7%가 몰렸다.</strong>{' '}
        실전 세트가 막판에 배포된 공급 요인도 겹쳐 있다.
      </figcaption>
    </figure>
  )
}

// ── 4지표 pill 탭(A4) — 정의·실측·읽는 법 전환 ────────────────────────────
export function MetricTabs() {
  const [cur, setCur] = useState(0)
  const m = METRICS[cur]
  return (
    <div className="pa-metrics">
      <div className="pa-pills" role="tablist" aria-label="지표 4종">
        {METRICS.map((x, i) => (
          <button key={x.key} type="button" role="tab" aria-selected={i === cur}
            className={`pa-pill${i === cur ? ' on' : ''}`} onClick={() => setCur(i)}>
            {x.key}
          </button>
        ))}
      </div>
      <div className="pa-metric-body" role="tabpanel">
        <div className="pa-metric-val">
          <span className="pa-metric-num">{m.value}</span>
          <span className="pa-metric-vlabel">{m.valueLabel}</span>
        </div>
        <div className="pa-metric-txt">
          <p className="pa-metric-formula"><code>{m.formula}</code></p>
          <p className="pa-metric-read">{m.reading}</p>
        </div>
      </div>
    </div>
  )
}

// ── 도구 캐러셀(A3 변형) — 자동 재생·도트·일시정지. 슬라이드 = 실측 캡처(이름 블러본).
//    녹화 클립 확보 시 img → video 교체 슬롯. reduced-motion·비가시 탭 = 자동 재생 없음.
export function ToolCarousel() {
  const [cur, setCur] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef(null)
  useEffect(() => {
    if (paused || prefersReduced()) return undefined
    timer.current = setInterval(() => setCur((c) => (c + 1) % TOOL_SLIDES.length), 5200) // 애니메이션 슬라이드(3프레임×1.6s) 한 바퀴 보장
    return () => clearInterval(timer.current)
  }, [paused])
  const s = TOOL_SLIDES[cur]
  return (
    <div className="pa-carousel">
      <div className="pa-car-frame">
        {TOOL_SLIDES.map((x, i) => (
          <img key={x.img} src={x.img} alt={x.caption} loading={i === 0 ? 'eager' : 'lazy'}
            className={`pa-car-img${i === cur ? ' on' : ''}`} />
        ))}
      </div>
      <div className="pa-car-bar">
        <p className="pa-car-cap">{s.caption}</p>
        <div className="pa-car-dots" role="tablist" aria-label="보드 화면 전환">
          {TOOL_SLIDES.map((x, i) => (
            <button key={x.img} type="button" role="tab" aria-selected={i === cur}
              aria-label={`${i + 1}번 화면`} className={`pa-dot${i === cur ? ' on' : ''}`}
              onClick={() => setCur(i)} />
          ))}
          <button type="button" className="pa-car-pause" aria-pressed={paused}
            aria-label={paused ? '자동 전환 재생' : '자동 전환 일시정지'} onClick={() => setPaused(!paused)}>
            {paused ? '▶' : '❚❚'}
          </button>
        </div>
      </div>
    </div>
  )
}

// (구 CompareSlider before/after 비교 슬라이더 = 오너 2026-08-12 기각 — "뭔 차이인지 모르겠음". 재도입 = 오너 재승인)
