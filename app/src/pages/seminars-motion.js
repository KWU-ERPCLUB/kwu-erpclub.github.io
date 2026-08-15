// 세미나 타임라인 모션(2026-08-15 오너: "드래그 형식으로 내리면 인터랙티브하게").
// 두 가지만 한다 — ① 스파인 진행 채움(스크롤 위치 → 선 높이) ② 화면 중앙에 가장 가까운 행 = 활성.
// transform·opacity·height만 건드린다(레이아웃 리플로 0). reduced-motion이면 즉시 최종 상태로 고정.
import { useEffect, useRef, useState } from 'react'

const reduced = () => typeof window !== 'undefined'
  && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// 반환 = { ref, fill, active }
//   ref    = 타임라인 <ol>에 건다
//   fill   = 0~1 진행도(스파인 채움 비율)
//   active = 화면 중앙에 가장 가까운 행 인덱스(-1 = 없음)
export function useTimelineFlow(count) {
  const ref = useRef(null)
  const [fill, setFill] = useState(0)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el || count === 0) return
    if (reduced()) { setFill(1); setActive(0); return }

    let raf = 0
    const measure = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const mid = window.innerHeight / 2
      // 진행도 = 타임라인 상단이 화면 중앙을 지난 정도(0~1).
      const span = rect.height || 1
      setFill(Math.max(0, Math.min(1, (mid - rect.top) / span)))
      // 활성 = 중앙선에 가장 가까운 행.
      const rows = el.querySelectorAll('[data-row]')
      let best = -1
      let bestD = Infinity
      rows.forEach((r, i) => {
        const b = r.getBoundingClientRect()
        const d = Math.abs(b.top + b.height / 2 - mid)
        if (d < bestD) { bestD = d; best = i }
      })
      setActive(best)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure) }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [count])

  return { ref, fill, active }
}

// 행 진입 리빌 — 한 번 보이면 유지(되돌리지 않음). 셀렉터로 잡아 클래스만 붙인다.
export function useRowReveal(selector, deps = []) {
  useEffect(() => {
    const rows = document.querySelectorAll(selector)
    if (rows.length === 0) return
    if (reduced()) { rows.forEach((r) => r.classList.add('in')); return }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.classList.add('in')
        io.unobserve(e.target)
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 })
    rows.forEach((r) => io.observe(r))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
