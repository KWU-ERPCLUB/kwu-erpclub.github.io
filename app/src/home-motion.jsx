// 메인 모션 조각 — 섹션 스파이·패럴랙스·문자 스태거·카운트업. App.jsx가 소비.
// 규격: transform·opacity만 · reduced-motion = 전부 정지·즉시 표시 · 순수 로직 = home-logic.js.
import { useEffect, useRef } from 'react'
import { parseStat, countupFrame } from './home-logic.js'

export const prefersReduced = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// 섹션=페이지 스파이: 뷰포트 중앙 밴드에 걸린 섹션만 활성(시각 강조 전용). reduced-motion=전부 활성.
export function useSectionSpy() {
  useEffect(() => {
    const pages = document.querySelectorAll('.page')
    if (prefersReduced()) {
      pages.forEach((p) => { p.classList.add('active'); p.classList.add('seen') })
      return
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('seen') // 한 번 활성화된 섹션은 내용 유지(비활성=감쇠만)
          pages.forEach((p) => p.classList.toggle('active', p === e.target))
        }
      }),
      { rootMargin: '-42% 0px -42% 0px', threshold: 0 },
    )
    pages.forEach((p) => io.observe(p))
    return () => io.disconnect()
  }, [])
}

// 가벼운 패럴랙스 — [data-parallax] 요소를 스크롤의 일부만큼 translateY(transform만·rAF 스로틀).
// reduced-motion = 미적용. 마퀴 띠 등 비-리빌 요소에만 부여(리빌 transform과 충돌 방지).
export function useParallax() {
  useEffect(() => {
    if (prefersReduced()) return
    const nodes = Array.from(document.querySelectorAll('[data-parallax]'))
    if (nodes.length === 0) return
    let raf = 0
    const apply = () => {
      raf = 0
      const y = window.scrollY || 0
      for (const el of nodes) {
        const f = parseFloat(el.dataset.parallax) || 0
        el.style.transform = `translateY(${(y * f).toFixed(1)}px)`
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply) }
    window.addEventListener('scroll', onScroll, { passive: true })
    apply()
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])
}

// 문자 단위 스태거 리빌 — 각 글자를 span으로 감싸 순차 등장(transform·opacity만).
// SSR·no-JS·reduced-motion = 그대로 최종 표시(CSS가 즉시 노출). accent=버건디 강조(화이트리스트 ①).
export function StaggerChars({ text, accent = false, start = 0 }) {
  const chars = Array.from(text)
  return (
    <span className={accent ? 'sc-accent' : undefined}>
      {chars.map((ch, i) => (
        <span
          className="sc"
          key={`${ch}-${i}`}
          style={{ transitionDelay: `${(start + i) * 45}ms` }}
        >
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  )
}

// 수치 카운트업 — 진입(IO) 시 0→값(rAF·countupFrame 순수 로직). SSR·reduced-motion = 최종값 즉시.
export function CountUp({ value }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const stat = parseStat(value)
    if (prefersReduced()) { el.textContent = value; return }
    el.textContent = countupFrame(stat, 0) // 진입 전 0 상태
    let raf = 0
    const run = () => {
      const dur = 1100
      const t0 = performance.now()
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur)
        el.textContent = countupFrame(stat, p)
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { io.disconnect(); run() } })
    }, { threshold: 0.4 })
    io.observe(el)
    return () => { io.disconnect(); if (raf) cancelAnimationFrame(raf) }
  }, [value])
  // 초기 렌더(SSR/no-JS) = 최종값 노출 → 콘텐츠·SEO 보존. JS 마운트 시 0에서 재생.
  return <span className="stat-num" ref={ref}>{value}</span>
}
