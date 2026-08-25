// ADsP 인터랙티브 상세 — 정적 조각(캐러셀·지표 표·제작 루프·타일·발췌·프롬프트·로그 레일).
// 스크롤 인터랙션 조각(도트 필드·토글 등) = project-adsp-viz.jsx 분리(300줄 규격).
// (구 WeeklyChart 막대 차트 = 2026-08-13 고도화에서 DotField로 대체 — 같은 데이터의 상위 표현)
import { useEffect, useRef, useState } from 'react'
import { prefersReduced } from '../home-motion.jsx'
import {
  METRICS, TOOL_SLIDES, BUILD_STEPS, BUILD_PRINCIPLES,
  CODE_STATS, SPEC_EXCERPT, COMMIT_LOG, PROMPTS,
} from '../data/project-adsp-data.js'

// ── 지표 4종 압축 표 — E5 색코딩: 톤 칩(차콜 농도 3단 + 실전 = 버건디)으로 지표 식별 고정 ──
export function MetricTable() {
  return (
    <div className="pa-mtable-wrap">
      <table className="pa-mtable">
        <thead>
          <tr><th>지표</th><th>계산식</th><th>답하는 질문</th><th>1기 실측</th></tr>
        </thead>
        <tbody>
          {METRICS.map((m) => (
            <tr key={m.key}>
              <th scope="row"><span className={`pa-tone ${m.tone}`} aria-hidden="true" />{m.key}</th>
              <td><code>{m.formula}</code></td>
              <td>{m.q}</td>
              <td><strong>{m.value}</strong> <span className="pa-mtable-src">{m.valueLabel}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// (구 ToolTiles 도구 타일 = v2에서 FlowChain(STACK_FLOW)로 대체 — project-adsp-road.jsx)

// ── 투입 규모 스탯 행(P-C) — 전부 git·docs 실측, 시간 추정치 게재 안 함 ──
export function CodeStats() {
  return (
    <div className="pa-cstats">
      {CODE_STATS.map((s) => (
        <div className="pa-cstat" key={s.label}>
          <span className="pa-cstat-num">{s.value}</span>
          <span className="pa-cstat-label">{s.label}</span>
          <span className="pa-cstat-src">{s.src}</span>
        </div>
      ))}
    </div>
  )
}

// (구 LogRail 개선 스트립 = v2 개편에서 RoadmapRail minor 노드로 대체 — project-adsp-road.jsx)

// ── 제작 루프 — 단계 4칸 + 순환 캡션(모바일 = 세로 적층) ───────────────────
export function BuildLoop() {
  return (
    <div className="pa-loop">
      <ol className="pa-loop-row">
        {BUILD_STEPS.map((s) => (
          <li className="pa-loop-step" key={s.k}>
            <span className="pa-loop-no">{s.no}</span>
            <span className="pa-loop-k">{s.k}</span>
            <span className="pa-loop-who">{s.who}</span>
            <p>{s.desc}</p>
          </li>
        ))}
      </ol>
      <p className="pa-loop-cap">④에서 다시 ①로. 6주 동안 이 루프를 돌렸다.</p>
    </div>
  )
}

// ── 위임 원칙 4칸 — "AI를 어떻게 이끌었나"(각 원칙 = 페이지 내 실측 사례 1:1 근거) ──
export function BuildPrinciples() {
  return (
    <div className="pa-feat-grid pa-prin">
      {BUILD_PRINCIPLES.map((p) => (
        <div className="pa-feat pa-rv" key={p.k}>
          <h3>{p.k}</h3>
          <p>{p.how}</p>
          <span className="pa-feat-src">근거 · {p.src}</span>
        </div>
      ))}
    </div>
  )
}

// ── 실물 발췌 2종 — spec 문서 + git 커밋 로그(원문 그대로) ──────────────────
export function BuildEvidence() {
  return (
    <div className="pa-evi">
      <div className="pa-doc">
        <div className="pa-evi-head"><span className="pa-evi-tag">실물 발췌 · spec 문서</span><code>{SPEC_EXCERPT.file}</code></div>
        <pre>{SPEC_EXCERPT.lines.join('\n')}</pre>
        <p className="pa-evi-note">{SPEC_EXCERPT.note}</p>
      </div>
      <div className="pa-term">
        <div className="pa-evi-head"><span className="pa-evi-tag">실물 발췌 · git 커밋 로그</span><code>git log --oneline</code></div>
        <pre>{COMMIT_LOG.join('\n')}</pre>
        <p className="pa-evi-note">6주간 커밋 248회. 전 과정이 이력으로 남아 있다.</p>
      </div>
    </div>
  )
}

// ── AI 명령 카드 — 원문 미보존이라 재구성 예시 라벨 필수 ────────────────────
export function PromptCard({ idx = 0 }) {
  const p = PROMPTS[idx]
  return (
    <div className="pa-prompt">
      <div className="pa-prompt-head">
        <span className="pa-evi-tag alt">AI에게 내린 명령 · 재구성 예시</span>
        <span className="pa-prompt-ctx">{p.ctx}</span>
      </div>
      <p>&ldquo;{p.text}&rdquo;</p>
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

// (구 CompareSlider = 오너 기각 8/12 · 구 MetricTabs = 오너 기각 8/13 · 구 WeeklyChart = DotField로 대체 8/13)
