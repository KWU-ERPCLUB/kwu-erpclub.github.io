import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import { PrepGuideBody, Inline, firstOpen, splitSite } from './PrepNotice.jsx'
import { PREP_GUIDES, guideForSession, guideHref, guideItems } from '../data/prep-guides.js'
import GuidePrep, { guideFromPath } from '../pages/GuidePrep.jsx'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

test('준비물 원천 — 묶음 4 · 항목 7 · 문장 규칙(대시 0 · 단계 40자 안 · 추임새 0 · 시간 없음 · 아이콘) · 공지 본문 = 정보·링크 블록', () => {
  const g = guideForSession(1)
  expect(g.groups.map((x) => x.label)).toEqual(['계정', '신청', '설치', '제출'])
  const items = guideItems(g)
  expect(items.length).toBe(7)
  for (const it of items) {
    expect(it.title.length).toBeLessThanOrEqual(18)
    expect(it.steps.length).toBeGreaterThanOrEqual(3)
    for (const s of it.steps) {
      expect(s.replace(/https?:\/\/\S+/g, 'URL').replace(/\*\*|\[\[|\]\]|\{\{|\}\}|<<|>>|\(\(|\)\)/g, '').length).toBeLessThanOrEqual(40)
      expect(s.endsWith('.')).toBe(false)
    }
    const all = JSON.stringify(it)
    expect(all).not.toContain(' — ')
    expect(all).not.toMatch(/끝\.|성공|꼭:|지금 바로|오늘 안에/)
    expect(it.minutes).toBeUndefined()
    expect(it.icon).toBeTruthy()
  }
  expect(g.notice.kind).toBe('준비물')
  expect(g.notice.body).toContain('::: 정보')
  expect(g.notice.body).toContain('::: 링크')
  expect(g.notice.body).not.toMatch(/\[\[|<<|\(\(/)   // 공지에는 단계·버튼 칩 표기 금지
  expect(guideHref(g)).toBe('/guide/ot-prep/')
})

test('가이드 페이지 — 경로로 가이드 선택 · 셸(nav·PageHead·footer) · 본체(스테퍼 4 · 행 7 · 상세 · 완료 버튼)', () => {
  expect(guideFromPath('/guide/ot-prep/').id).toBe('ot-prep')
  expect(guideFromPath('/guide/없음/').id).toBe('ot-prep')
  const html = flat(<GuidePrep pathname="/guide/ot-prep/" />)
  expect(html).toContain('pg-head')
  expect(html).toContain('OT 준비물 7가지')
  expect((html.match(/ws-prep-step-dot/g) || []).length).toBe(4)
  expect((html.match(/ws-prep-rowbtn/g) || []).length).toBe(7)
  expect(html).toContain('is-active')
  expect(html).toContain('>완료<')
  expect(html).not.toContain('끝냄')
})

test('PrepGuideBody 단독 — 단계 번호 열 · 준비물 칩 · 재료 카드는 해당 항목에서만', () => {
  const html = flat(<PrepGuideBody guide={PREP_GUIDES[0]} />)
  expect((html.match(/ws-prep-step-no/g) || []).length).toBeGreaterThanOrEqual(6)
  expect((html.match(/ws-prep-done"/g) || []).length).toBe(2)   // SSR = 인라인 + 패널, CSS가 하나만 보임
})

test('firstOpen — 첫 미완료, 전부 완료면 0', () => {
  expect(firstOpen([true, false, true])).toBe(1)
  expect(firstOpen([true, true])).toBe(0)
})

test('Inline — 버튼·경로·입력·키캡 표기가 모양으로, HTML 미생성', () => {
  const ui = flat(<p><Inline text="[[저장]] {{설정 › 비밀번호 변경}} <<학번>> ((Ctrl+Alt+I)) <b>x</b>" /></p>)
  expect(ui).toContain('class="ws-ui-btn">저장')
  expect((ui.match(/ws-ui-crumb/g) || []).length).toBe(2)
  expect(ui).toContain('class="ws-ui-input">학번')
  expect((ui.match(/<kbd>/g) || []).length).toBe(3)
  expect(ui).toContain('&lt;b&gt;x&lt;/b&gt;')
  expect(splitSite('https://docs.google.com 접속')).toEqual({ url: 'https://docs.google.com', rest: '접속' })
})
