// AIM 허브 사이트 로드맵 — 세로 지그재그 타임라인(구 가로 스크롤 '여정' 대체, 2026-08-19).
// 노드가 중앙 축을 두고 좌우로 번갈아 붙고, 스크롤 진입 시 순차로 등장한다.
//   큰 전환점(major) = 큰 점 + 굵은 카드 + 라벨. 나머지 = 작은 점.
// no-JS·reduced-motion = 리빌 게이트가 붙지 않아 전부 즉시 선명(정보 손실 0).
import { useEffect, useRef, useState } from 'react'
import { prefersReduced } from '../home-motion.jsx'
import { MILESTONES } from '../data/project-site-roadmap-data.js'

// 축 채움 — 화면에 들어온 마지막 노드까지 스파인이 칠해진다(진행한 만큼 채워지는 축).
function useSpineFill(ref) {
  const [pct, setPct] = useState(100) // SSR·정지 모드 = 완주 상태
  useEffect(() => {
    if (prefersReduced()) return undefined
    const el = ref.current
    if (!el) return undefined
    setPct(0)
    let raf = 0
    const calc = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const mid = window.innerHeight * 0.62
      const p = ((mid - r.top) / r.height) * 100
      setPct(Math.max(0, Math.min(100, p)))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(calc) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    calc()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [ref])
  return pct
}

// 바뀐 면 칩 — 어느 화면이 움직였는지가 로드맵의 축.
function PageTags({ pages }) {
  return (
    <ul className="ps-rm-tags">
      {pages.map((p) => <li key={p}>{p}</li>)}
    </ul>
  )
}

// before → after — 값이 둘 다 있을 때만 렌더(반쪽 표기 금지).
function Shift({ before, after }) {
  if (!before || !after) return null
  return (
    <p className="ps-rm-shift">
      <span className="ps-rm-before">{before}</span>
      <span className="ps-rm-to" aria-hidden="true">→</span>
      <span className="ps-rm-after">{after}</span>
    </p>
  )
}

export function RoadmapNode({ m, idx }) {
  const side = idx % 2 === 0 ? 'left' : 'right'
  return (
    <li className={`ps-rm-node ${side}${m.major ? ' major' : ''} ps-rv`}>
      <span className="ps-rm-dot" aria-hidden="true" />
      <div className="ps-rm-card">
        <div className="ps-rm-top">
          <span className="ps-rm-date">{m.date}</span>
          {m.major && <span className="ps-rm-flag">큰 전환점</span>}
        </div>
        <h3 className="ps-rm-title">{m.title}</h3>
        <PageTags pages={m.pages} />
        <p className="ps-rm-decide">{m.decide}</p>
        {m.ai && (
          <p className="ps-rm-ai">
            <span className="ps-rm-ai-label">AI 활용</span>
            {m.ai}
          </p>
        )}
        <Shift before={m.before} after={m.after} />
      </div>
    </li>
  )
}

export function RoadmapZigzag() {
  const ref = useRef(null)
  const pct = useSpineFill(ref)
  return (
    <div className="ps-rm" ref={ref}>
      <div className="ps-rm-spine" aria-hidden="true">
        <span className="ps-rm-spine-fill" style={{ height: `${pct}%` }} />
      </div>
      <ol className="ps-rm-list">
        {MILESTONES.map((m, i) => <RoadmapNode m={m} idx={i} key={`${m.date}-${m.title}`} />)}
      </ol>
    </div>
  )
}
