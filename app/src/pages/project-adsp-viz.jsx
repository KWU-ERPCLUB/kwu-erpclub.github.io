// ADsP 인터랙티브 — 고도화 조각(오너 픽 2026-08-13: ★★이상 5레퍼런스 복합).
// DotField(E4 — R2D3/Pudding: 고정 시각화+스텝 스크롤) · ToggleCompare(E2 — Comeau before/after 토글)
// · FailCards(P-A — rauno 카드 그리드) · VerdictSplit(P-B — 조건부 판정).
// 규격: 외부 라이브러리 0 · transform·opacity만 · reduced-motion/no-JS = 최종 상태 정적 표시.
import { useEffect, useMemo, useRef, useState } from 'react'
import { prefersReduced } from '../home-motion.jsx'
import { WEEKLY_ANSWERS, DOT_SCALE, FAILS, VERDICT } from '../data/project-adsp-data.js'

// ── 도트 필드 — 점 1개 = 답안 10건. 스텝: 0 전체 흩뿌림 → 1 주차별 적층 → 2 시험주 강조 ──
const W = 560
const H = 430
const BASE = H - 34 // 히스토그램 베이스라인

// 주차별 도트 수(정직 축척 — 반올림 오차는 캡션에 '≈'로 명시).
const WEEK_DOTS = WEEKLY_ANSWERS.map((d) => Math.round(d.value / DOT_SCALE))
const TOTAL_DOTS = WEEK_DOTS.reduce((a, b) => a + b, 0)

// 레이아웃 좌표 계산 — 순수(테스트 가능). scatter = 중앙 그리드, stack = 주차별 컬럼 적층.
export function dotLayouts() {
  const scatter = []
  const cols = 33
  const gap = 15
  const x0 = (W - (cols - 1) * gap) / 2
  const rows = Math.ceil(TOTAL_DOTS / cols)
  const y0 = (H - (rows - 1) * gap) / 2
  for (let i = 0; i < TOTAL_DOTS; i += 1) {
    scatter.push([x0 + (i % cols) * gap, y0 + Math.floor(i / cols) * gap])
  }
  const stack = []
  const colW = W / WEEK_DOTS.length
  const perRow = 8
  const dgap = 6.4
  WEEK_DOTS.forEach((n, w) => {
    const cx0 = colW * w + (colW - (perRow - 1) * dgap) / 2
    for (let i = 0; i < n; i += 1) {
      stack.push([cx0 + (i % perRow) * dgap, BASE - Math.floor(i / perRow) * dgap])
    }
  })
  return { scatter, stack }
}

// 스텝 텍스트 — 좌열 서사(도트가 답한다).
const DOT_STEPS = [
  { t: '답안 7,976건이 쌓였다.', d: '정식 8명이 6주간 보드에 남긴 기록 전부다. 점 하나가 답안 10건.' },
  { t: '주차별로 세워 보면,', d: '첫 주 15건에서 마지막 주 4,207건까지 — 학습량은 균등하지 않았다.' },
  { t: '절반이 시험 주에 몰렸다.', d: '52.7%가 마지막 6일에 집중 — 벼락치기의 실측. 실전 세트가 막판에 배포된 공급 요인도 겹쳐 있다.' },
]

export function DotField() {
  // SSR·no-JS·reduced-motion = 최종 스텝(2) 정적 — 정보는 항상 온전.
  const [step, setStep] = useState(2)
  const wrapRef = useRef(null)
  const { scatter, stack } = useMemo(dotLayouts, [])
  useEffect(() => {
    if (prefersReduced()) return undefined
    const steps = Array.from(wrapRef.current?.querySelectorAll('.pa-dot-step') || [])
    if (steps.length === 0) return undefined
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setStep(Number(e.target.dataset.step)) })
    }, { rootMargin: '-45% 0px -45% 0px' })
    steps.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])
  const pos = step === 0 ? scatter : stack
  // 시험주(마지막 주차) 도트 시작 인덱스 — 강조 스텝에서만 버건디.
  const hotFrom = TOTAL_DOTS - WEEK_DOTS[WEEK_DOTS.length - 1]
  return (
    <div className="pa-dotwrap" ref={wrapRef}>
      <div className="pa-dot-steps">
        {DOT_STEPS.map((s, i) => (
          <div className="pa-dot-step" data-step={i} key={s.t}>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
          </div>
        ))}
      </div>
      <div className="pa-dot-sticky">
        <svg viewBox={`0 0 ${W} ${H}`} role="img"
          aria-label="답안 7,976건 도트 차트 — 주차별 적층, 시험 주 52.7% 강조">
          {pos.map(([x, y], i) => (
            <circle key={i} r="2.7" className={`pa-fdot${step === 2 && i >= hotFrom ? ' hot' : ''}`}
              style={{ transform: `translate(${x}px, ${y}px)`, transitionDelay: `${(i % 24) * 14}ms` }} />
          ))}
          {step > 0 && WEEKLY_ANSWERS.map((d, w) => (
            <text key={d.week} className="pa-fdot-week" textAnchor="middle"
              x={(W / WEEKLY_ANSWERS.length) * (w + 0.5)} y={H - 12}>{d.week}</text>
          ))}
          {step === 2 && (
            <text className="pa-fdot-label" textAnchor="middle"
              x={(W / WEEKLY_ANSWERS.length) * (WEEKLY_ANSWERS.length - 0.5)} y={44}>52.7%</text>
          )}
        </svg>
        <p className="pa-dot-cap">점 1개 ≈ 답안 10건 · 정식 8명 합계 7,976건 — 시험 당일 스냅샷 실측</p>
      </div>
    </div>
  )
}

// ── before/after 토글(E2) — 같은 프레임에서 명시적 버튼 전환(기각된 슬라이더와 다름) ──
export function ToggleCompare({ a, b, caption }) {
  const [cur, setCur] = useState(1) // 초기 = after(개선 결과가 기본)
  const items = [a, b]
  return (
    <figure className="pa-toggle">
      <div className="pa-tg-frame">
        {items.map((it, i) => (
          <img key={it.img} src={it.img} alt={it.alt} loading="lazy"
            className={`pa-tg-img${i === cur ? ' on' : ''}`} />
        ))}
      </div>
      <div className="pa-tg-bar">
        <div className="pa-tg-btns" role="tablist" aria-label="개선 전후 비교">
          {items.map((it, i) => (
            <button key={it.label} type="button" role="tab" aria-selected={i === cur}
              className={`pa-tg-btn${i === cur ? ' on' : ''}`} onClick={() => setCur(i)}>
              {it.label}
            </button>
          ))}
        </div>
        <figcaption>{caption}</figcaption>
      </div>
    </figure>
  )
}

// ── 실패 카드 그리드(P-A) — 라벨(수리됨·절반 성공·설계 한계) + 증상·원인·수리 ──
const FAIL_TONE = { 수리됨: 'ok', '절반 성공': 'half', '설계 한계': 'limit' }
export function FailCards() {
  return (
    <div className="pa-fails">
      {FAILS.map((f) => (
        <div className="pa-fail pa-rv" key={f.title}>
          <span className={`pa-fail-tag ${FAIL_TONE[f.label]}`}>{f.label}</span>
          <h3>{f.title}</h3>
          <p>{f.cause}</p>
          <p className="pa-fail-fix">{f.fix}</p>
        </div>
      ))}
    </div>
  )
}

// ── 조건부 판정(P-B) — 통한 조건 / 한계 2열. 성공 선언으로 닫지 않는다 ──
export function VerdictSplit() {
  return (
    <div className="pa-verdict">
      <div className="pa-vd-col">
        <h3>이 방식이 통한 조건</h3>
        <ul>{VERDICT.works.map((t) => <li key={t}>{t}</li>)}</ul>
      </div>
      <div className="pa-vd-col limit">
        <h3>같은 방식이 안 통할 조건</h3>
        <ul>{VERDICT.limits.map((t) => <li key={t}>{t}</li>)}</ul>
      </div>
    </div>
  )
}
