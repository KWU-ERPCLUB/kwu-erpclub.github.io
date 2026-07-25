import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import About, { AboutIntro, WhyNow, Proof, BarFig } from './About.jsx'

// 구조 검증(콘텐츠·시점 무관) — 2차 구조 개혁: 중앙 셀 폐지 → 풀블리드 스크린 섹션.
const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

test('about = 풀블리드 .home 3섹션 + 중앙 셀(.lattice/.cell) 폐지', () => {
  const html = flat(<About />)
  expect(html).toContain('class="home"')
  expect(html).not.toContain('class="lattice"')
  expect(html).not.toContain('class="cell')
  // 섹션 인덱스 3종(§5 라벨 영문 정책 — 2026-07-25 톤 개혁: WHY NOW→DATA)
  for (const idx of ['ABOUT', 'DATA', 'PROOF']) expect(html).toContain(idx)
  // 풀블리드 섹션 골격 = .hs.page (home 문법 재사용)
  expect(/class="hs[^"]*page/.test(html)).toBe(true)
})

test('① 누구인가 = 대형 타이포 도입 + 가로 진행 타임라인(.rmap)', () => {
  const html = flat(<AboutIntro />)
  expect(html).toContain('ab-mega') // 대형 도입 타이포
  expect(html).toContain('class="rmap') // 가로 진행 타임라인(ROADMAP 문법 재사용)
  expect(html).toContain('rm-node')
  expect(html).toContain('rm-dot')
  // 모집 준비 상태 칩(버건디 화이트리스트 prep)
  expect(html).toContain('status prep')
})

test('② 데이터 = 뷰포트급 헤드라인 + 3단 데이터 블록 + BarFig (서사 라벨·04 선언 블록 제거 — 톤 개혁)', () => {
  const html = flat(<WhyNow />)
  expect(html).toContain('ab-claim-mega')
  // 3단(01~03) 데이터 블록 — 04 "그래서 이 스터디" 선언 블록은 서사 비표기 원칙으로 제거
  const blocks = html.match(/ab-why-block/g) || []
  expect(blocks.length).toBe(3)
  for (const n of ['01', '02', '03']) expect(html).toContain(`ab-why-idx">${n}`)
  // 기존 막대 차트 유지
  expect(html).toContain('barfig')
  expect(html).toContain('bar-fill accent') // 강조 바 1개(버건디)
  // 출처 각주 유지
  expect(html).toContain('stat-src')
})

test('③ 운영 증빙 = 대형 숫자 풀폭 행(stat-rows) + 카운트업(stat-num) + 문의 링크', () => {
  const proof = [
    { num: '1', label: '합성 라벨 A', src: '합성 출처 A' },
    { num: '9', label: '합성 라벨 B', src: '합성 출처 B' },
  ]
  const html = flat(<Proof proof={proof} />)
  expect(html).toContain('stat-rows')
  expect(html).toContain('stat-row')
  expect(html).toContain('stat-num') // 카운트업 대상(SSR = 최종값)
  expect(html).toContain('합성 라벨 A')
  expect(html).toContain('proof-link') // 모집 문의 링크(사실 문장 1줄)
})

test('BarFig = 캡션 + 행별 라벨·값(accent 1개) 순수 렌더', () => {
  const html = flat(
    <BarFig caption="합성 캡션" max={100} rows={[
      { label: 'X', value: 60, display: '60%', accent: true },
      { label: 'Y', value: 30, display: '30%' },
    ]} />,
  )
  expect(html).toContain('합성 캡션')
  expect(html).toContain('bar-fill accent')
  expect(html).toContain('60%')
  expect(html).toContain('30%')
})
