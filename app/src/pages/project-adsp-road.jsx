// ADsP 인터랙티브 상세 — 로드맵(좌 스티키 시간축 + 우 카드, minor 접힘 그룹)·플로우 체인·팀 블록·스플릿 리스트.
// v7(spec 2026-08-24): 로드맵 = G2 골격, minor = 직전 major 아래 "사이 결정 N건" <details>(SSR 텍스트 포함).
// 스타일 = project-adsp-road.css · 시간축 = project-adsp-objects.jsx RoadAxis.
import { useEffect, useRef, useState } from 'react'
import { ROADMAP } from '../data/project-adsp-roadmap.js'
import { TEAMS, TEAM_EXTRAS } from '../data/project-adsp-data.js'
import { RoadAxis } from './project-adsp-objects.jsx'
import { prefersReduced } from '../home-motion.jsx'

// ── 플로우 체인 — 번호 단계 카드 + 화살표(모바일 세로). 학습 설계(hot)·제작 스택 공용. 스태거 = --i ──
export function FlowChain({ items, ariaLabel, tone = '' }) {
  return (
    <ol className={`pa-flow ${tone}`.trim()} aria-label={ariaLabel}>
      {items.map((it, i) => (
        <li className="pa-flow-step pa-rv" key={it.k} style={{ '--i': i }}>
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

// ── 팀 블록 — 리듬 격자(V2) 아래 팀 텍스트 2열(무테) + 공통 장치 칩 행 ──
export function TeamSplit() {
  return (
    <div className="pa-teams-wrap">
      <div className="pa-teams">
        {TEAMS.map((t, i) => (
          <div className={`pa-team pa-rv ${i === 0 ? 'online' : 'offline'}`} key={t.name} style={{ '--i': i }}>
            <span className="pa-team-name">{t.name}</span>
            <strong className="pa-team-mode">{t.mode}</strong>
            <p>{t.desc}</p>
          </div>
        ))}
      </div>
      <div className="pa-team-extras pa-rv">
        {TEAM_EXTRAS.map((e) => (
          <span className="pa-team-extra" key={e.k}>
            <strong>{e.k}</strong><span>{e.sub}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── 유지/변경 2열 — 글리프 마커(✓ 초록 / ↻·! 버건디) + 키워드 + 한 줄 ──
export function SplitList({ left, right }) {
  const col = (c) => (
    <div className={`pa-split-col ${c.tone}`}>
      <h3><span className="pa-split-glyph" aria-hidden="true">{c.glyph}</span>{c.title}</h3>
      <ul>
        {c.items.map((it, i) => (
          <li className="pa-rv" key={it.k} style={{ '--i': i }}>
            <strong>{it.k}</strong>
            <span>{it.sub}</span>
          </li>
        ))}
      </ul>
    </div>
  )
  return <div className="pa-split">{col(left)}{col(right)}</div>
}

// ROADMAP → [{major, minors:[...]}] 그룹(minor는 직전 major에 귀속. 첫 major 전 minor는 첫 그룹 앞에).
export function groupRoadmap(nodes = ROADMAP) {
  const groups = []
  let lead = []
  for (const n of nodes) {
    if (n.kind === 'major') groups.push({ major: n, minors: [] })
    else if (groups.length === 0) lead.push(n)
    else groups[groups.length - 1].minors.push(n)
  }
  if (lead.length && groups.length) groups[0].minors.unshift(...lead)
  return groups
}

// 스크롤 스파이 — 뷰포트 중앙에 가장 가까운 노드 인덱스(ROADMAP 순서). 축 강조 + 카드 .cur.
function useRoadSpy(count) {
  const [cur, setCur] = useState(0)
  const wrap = useRef(null)
  useEffect(() => {
    if (prefersReduced() || !wrap.current) return undefined
    const els = Array.from(wrap.current.querySelectorAll('[data-road-i]'))
    let raf = 0
    const pick = () => {
      raf = 0
      const cy = window.innerHeight * 0.45
      let best = 0
      let bd = Infinity
      els.forEach((el) => {
        const r = el.getBoundingClientRect()
        const d = Math.abs(r.top + Math.min(r.height, 240) / 2 - cy)
        if (d < bd) { bd = d; best = Number(el.dataset.roadI) }
      })
      setCur(best)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick) }
    window.addEventListener('scroll', onScroll, { passive: true })
    pick()
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [count])
  return [wrap, cur]
}

// ── 로드맵 — 좌 스티키 시간축(RoadAxis) + 우 major 카드(문제 1줄 → 결정 히어로 → 결과 1줄) + minor 접힘 ──
export function RoadmapRail({ media = {} }) {
  const groups = groupRoadmap()
  const [wrap, cur] = useRoadSpy(ROADMAP.length)
  const idx = (n) => ROADMAP.indexOf(n)
  return (
    <div className="pa-road-wrap" ref={wrap}>
      <RoadAxis nodes={ROADMAP} current={cur} />
      <ol className="pa-road" aria-label="보드 고도화 로드맵">
        {groups.map(({ major: n, minors }) => (
          <li className={`pa-road-node pa-rv${idx(n) === cur ? ' cur' : ''}`} key={n.title} data-road-i={idx(n)}>
            <div className="pa-road-card">
              <span className="pa-road-date">{n.date}</span>
              <h3>{n.title}</h3>
              <div className={`pa-road-body${n.media && media[n.media] ? ' has-media' : ''}`}>
                <div className="pa-road-steps">
                  <p className="pa-road-why"><span className="pa-road-tag">문제</span>{n.problem}</p>
                  <div className="pa-road-act"><span className="pa-road-tag">결정</span><p>{n.decision}</p></div>
                  <p className="pa-road-out"><span className="pa-road-tag">결과</span>{n.result}</p>
                </div>
                {n.media && media[n.media] ? <div className="pa-road-media">{media[n.media]}</div> : null}
              </div>
            </div>
            {minors.length ? (
              <details className="pa-road-minors">
                <summary>사이 결정 {minors.length}건</summary>
                <ul>
                  {minors.map((m) => (
                    <li key={`${m.date}-${m.text}`} data-road-i={idx(m)}>
                      <span className="pa-road-mdate">{m.date}</span><p>{m.text}</p>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  )
}
