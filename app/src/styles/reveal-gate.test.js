// 리빌·감쇠 계약 회귀 가드(2026-08-05 스톨 수정) — 라이브에서 섹션이 반투명(0.35)에 걸려 정체한 결함의 재발 방지.
// 테스트 환경 = node(jsdom 없음) → DOM 대신 CSS 원문·훅 소스를 계약으로 단언한다.
//   ① 감쇠 하한 ≥ 0.55  ② 감쇠·초기 은닉 규칙은 전부 JS 게이트(.home-js/.home-spy-js/.rc-spy-js) 뒤
//   ③ seen 제거 코드 없음(once)  ④ reduced-motion 예외 유지
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const read = (rel) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')
const home = read('./home.css')
const sections = read('./home-sections.css')
const recruit = read('./recruit.css')
const motion = read('../home-motion.jsx')
const app = read('../App.jsx')

// 주석·문자열이 아닌 선언에서 opacity 소수값만 수집(0/1은 리빌 초기·최종값 → 감쇠 아님).
function decayValues(css) {
  return [...css.matchAll(/opacity:\s*(0\.\d+)/g)].map((m) => parseFloat(m[1]))
}

test('감쇠 하한 = 0.55 이상 — 0.35/0.45/0.26 등 반투명 정체 값 부재', () => {
  for (const [name, css] of [['home.css', home], ['home-sections.css', sections]]) {
    for (const v of decayValues(css)) {
      expect(v, `${name} opacity:${v} — 감쇠 하한 0.55 미만`).toBeGreaterThanOrEqual(0.55)
    }
  }
  // recruit.css는 폼·카드 등 비감쇠 opacity도 쓰므로 스파이 규칙만 좁혀 검사
  for (const line of recruit.split('\n').filter((l) => l.includes('rc-steps-spy') && l.includes('opacity'))) {
    const v = parseFloat((line.match(/opacity:\s*(0\.\d+)/) || [])[1] || '1')
    expect(v, `recruit.css "${line.trim()}"`).toBeGreaterThanOrEqual(0.55)
  }
})

test('감쇠·초기 은닉 = JS 게이트 뒤에만 — no-JS = 전부 선명', () => {
  // 게이트 없는 `.page {` 블록에 opacity 선언이 남아 있으면 no-JS에서 반투명으로 굳는다
  const hasOpacityDecl = (block) => /opacity:\s*[\d.]/.test(block) // transition: opacity …는 선언 아님
  const pageBlock = home.match(/\n\.page \{[\s\S]*?\}/)[0]
  expect(hasOpacityDecl(pageBlock)).toBe(false)
  // .rv·.sc 초기 은닉도 게이트 뒤
  expect(home).toContain('.home-js .page .rv {')
  expect(home).toContain('.home-js .sc { opacity: 0;')
  const scBlock = home.match(/\n\.sc \{[\s\S]*?\}/)[0]
  expect(hasOpacityDecl(scBlock)).toBe(false)
  // 워드 스택 감쇠도 게이트 뒤
  expect(sections).toContain('.home-spy-js .wl-item { opacity:')
  const wlBlock = sections.match(/\n\.wl-item \{[\s\S]*?\}/)[0]
  expect(hasOpacityDecl(wlBlock)).toBe(false)
})

test('훅이 게이트 클래스를 부여 + seen은 once(제거 코드 없음) + 진입 전 트리거', () => {
  expect(motion).toContain("classList.add('home-js')")
  expect(app).toContain("classList.add('home-spy-js')")
  expect(motion).toContain("classList.add('seen')")
  expect(motion).not.toContain("classList.remove('seen')")
  expect(motion).not.toMatch(/toggle\('seen'/)
  // 뷰포트 진입 전 여유(REVEAL_MARGIN) — 중앙 도달까지 기다리지 않는다
  expect(motion).toMatch(/REVEAL_MARGIN\s*=\s*0\.\d+/)
})

test('reduced-motion = 감쇠·전환 전부 해제(게이트 포함)', () => {
  expect(home).toContain('.home-js .page, .home-js .page .rv { transition: none; opacity: 1; transform: none; }')
  expect(home).toContain('.sc, .home-js .sc { transition: none; opacity: 1; transform: none; }')
  expect(sections).toContain('.wl-item, .home-spy-js .wl-item { transition: none; opacity: 1; }')
})
