// 메인 모션 조각 — 섹션 스파이·패럴랙스·문자 스태거·카운트업. App.jsx가 소비.
// 규격: transform·opacity만 · reduced-motion = 전부 정지·즉시 표시 · 순수 로직 = home-logic.js.
import { useEffect, useRef } from 'react'
import { parseStat, countupFrame } from './home-logic.js'

export const prefersReduced = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// 섹션=페이지 스파이: 뷰포트 중앙이 속한 섹션만 활성(시각 강조 전용).
// IO 경계 이벤트 방식은 빠른 스크롤에서 진입 이벤트를 놓쳐 강조가 안 바뀌는 버그가 있어(2026-07-25),
// 스크롤마다 rAF로 중앙점 포함 섹션을 직접 계산하는 결정적 방식으로 교체. 중앙이 섹션 밖(푸터 등)이면 마지막 활성 유지.
// 스톨 수정(2026-08-05):
//   ① seen = 중앙 도달이 아니라 **뷰포트 진입 전**(위아래 REVEAL_MARGIN=0.25vh 여유)에 부여 → 리빌이 늦어
//      반투명에 걸리는 정체 제거. ② seen은 한 번 붙으면 제거하지 않음(once). ③ html.home-js 게이트를 이 훅이 부여 —
//      JS 미작동·reduced-motion이면 클래스가 없어 CSS 감쇠 규칙 자체가 꺼짐(= opacity 1).
const REVEAL_MARGIN = 0.25

export function useSectionSpy() {
  useEffect(() => {
    const pages = Array.from(document.querySelectorAll('.page'))
    if (pages.length === 0) return
    if (prefersReduced()) return // 게이트 미부여 = 감쇠·리빌 전부 비적용(정적 선명)
    const root = document.documentElement
    root.classList.add('home-js')
    let raf = 0
    const pick = () => {
      raf = 0
      const vh = window.innerHeight
      const cy = vh / 2
      const ahead = vh * REVEAL_MARGIN
      let cur = null
      for (const p of pages) {
        const r = p.getBoundingClientRect()
        if (r.top < vh + ahead && r.bottom > -ahead) p.classList.add('seen') // once — 제거하지 않음
        if (r.top <= cy && r.bottom > cy) cur = p
      }
      if (!cur) return
      pages.forEach((p) => p.classList.toggle('active', p === cur))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    pick()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
      root.classList.remove('home-js')
    }
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

// 항목별 스크롤 리빌 — selector 항목이 뷰포트에 들어올 때 .in 부여(once·IO). 섹션 단위 .rv와 달리
// 항목 하나하나가 스크롤에 맞춰 순차 등장한다(로드맵 지그재그용). reduced-motion·no-JS = CSS 게이트가 즉시 표시.
export function useItemReveal(selector) {
  useEffect(() => {
    if (prefersReduced()) return
    const nodes = Array.from(document.querySelectorAll(selector))
    if (nodes.length === 0) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } })
    }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' })
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [selector])
}

// 히어로 포인터 인터랙션 — 커서 추적 글로우([data-hero-glow] translate) + 블롭 레이어 역방향 드리프트
// ([data-hero-drift] — 블롭 개별에는 무한 float 애니메이션이 있어 컨테이너에만 transform, 충돌 0).
// hover 디바이스 한정(터치 무시)·rAF 스로틀·transform만·reduced-motion 미적용.
export function useHeroPointer() {
  useEffect(() => {
    if (prefersReduced()) return
    if (typeof window.matchMedia === 'function' && !window.matchMedia('(hover: hover)').matches) return
    const hero = document.querySelector('.hs-hero')
    const glow = document.querySelector('[data-hero-glow]')
    const drift = document.querySelector('[data-hero-drift]')
    if (!hero || !glow) return
    let raf = 0
    let x = 0
    let y = 0
    const apply = () => {
      raf = 0
      const r = hero.getBoundingClientRect()
      glow.style.transform = `translate3d(${(x - r.left).toFixed(0)}px, ${(y - r.top).toFixed(0)}px, 0) translate(-50%, -50%)`
      glow.style.opacity = '1'
      if (drift) { // 중심 기준 -0.03 배 역방향 — 커서와 배경이 서로 밀리는 깊이감
        const dx = (x - r.left - r.width / 2) * -0.03
        const dy = (y - r.top - r.height / 2) * -0.03
        drift.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`
      }
    }
    const onMove = (e) => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(apply) }
    const onLeave = () => { glow.style.opacity = '0' }
    hero.addEventListener('pointermove', onMove, { passive: true })
    hero.addEventListener('pointerleave', onLeave, { passive: true })
    return () => {
      hero.removeEventListener('pointermove', onMove)
      hero.removeEventListener('pointerleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
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
