// 히어로 키비주얼 계약(2026-08-05 2차) — 장식 처리·토큰 색만·모션 자제(§6-2a "모션 자제")·폰 미표시.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import HeroVisual from './hero-visual.jsx'

const css = readFileSync(fileURLToPath(new URL('./styles/hero-visual.css', import.meta.url)), 'utf8')
const src = readFileSync(fileURLToPath(new URL('./hero-visual.jsx', import.meta.url)), 'utf8')

test('키비주얼 = 인라인 SVG 장식(aria-hidden) — 외부 자산·이미지 0', () => {
  const html = renderToString(<HeroVisual />)
  expect(html).toContain('<svg')
  expect(html).toContain('class="hero-kv"')
  expect(html).toContain('aria-hidden="true"')
  expect(html).not.toContain('<img')
  expect(html).not.toContain('http') // 외부 호스트 참조 0
})

test('색 = 기존 토큰만(--line·--dark·--accent) — 하드코딩 색 0·버건디 면(fill) 0', () => {
  const html = renderToString(<HeroVisual />)
  for (const token of ['var(--line)', 'var(--dark)', 'var(--accent)']) expect(html).toContain(token)
  expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}/) // 하드코딩 색상값 없음
  expect(html).not.toContain('<rect')            // 대면적 색 면 없음(§1 버건디 fill 금지)
})

test('히어로에 배치 — 타이포 뒤 배경 레이어(텍스트 가독 보호)', () => {
  const html = renderToString(<App />)
  expect(html).toContain('hero-kv')
  expect(html.indexOf('hero-kv')).toBeLessThan(html.indexOf('hero-mega')) // 마크업 선행 = 배경 레이어
  expect(css).toContain('z-index: 0')
  expect(css).toContain('pointer-events: none')
})

test('모션 = CSS 1회 발화만 — infinite 0 · JS 애니메이션 루프 0 · reduced-motion 정지', () => {
  expect(css).not.toContain('infinite')
  expect(css).toContain('forwards')
  expect(css).toContain('@media (prefers-reduced-motion: reduce)')
  expect(css).toContain('animation: none')
  for (const banned of ['requestAnimationFrame', 'setInterval', 'useEffect']) {
    expect(src, `JS 애니메이션 금지: ${banned}`).not.toContain(banned)
  }
})

test('반응형 = 폰(≤700) 미표시·태블릿 축소', () => {
  expect(css).toContain('@media (max-width: 700px) { .hero-kv { display: none; } }')
  expect(css).toContain('@media (max-width: 1100px)')
})
