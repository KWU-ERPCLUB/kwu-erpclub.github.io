import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import PrepNotices, { PrepGuide, Inline, noticeParam, firstOpen } from './PrepNotice.jsx'
import { PREP_GUIDES, guideForSession, guideHref, guideItems } from '../data/prep-guides.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

test('준비물 원천 — 묶음 4(계정·신청·설치·제출) · 항목 7 · 문장 규칙(대시 0 · 단계 25자 안 · 추임새 0)', () => {
  const g = guideForSession(1)
  expect(g.id).toBe('ot-prep')
  expect(g.groups.map((x) => x.label)).toEqual(['계정', '신청', '설치', '제출'])
  const items = guideItems(g)
  expect(items.length).toBe(7)
  for (const it of items) {
    expect(it.title.length).toBeLessThanOrEqual(18)   // 영문 도구명 포함 기준
    expect(it.what.split(/[.]\s/).length).toBeLessThanOrEqual(3)
    expect(it.steps.length).toBeGreaterThanOrEqual(3)
    for (const s of it.steps) {
      expect(s.replace(/https?:\/\/\S+/g, 'URL').replace(/\*\*/g, '').length).toBeLessThanOrEqual(40)
      expect(s.endsWith('.')).toBe(false)
    }
    const all = JSON.stringify(it)
    expect(all).not.toContain(' — ')
    expect(all).not.toMatch(/끝\.|성공|꼭:|지금 바로|오늘 안에/)
  }
  expect(guideForSession(2)).toBeNull()
  expect(guideHref(g)).toBe('/workspace/?tab=공지&notice=ot-prep')
})

test('고정 공지 렌더 — 📌 행 · 진행 막대 · 묶음 라벨 4 · 행 7 · 기본 접힘 · ?notice= 일치 시 펼침', () => {
  const closed = flat(<PrepNotices guides={PREP_GUIDES} search="" />)
  expect(closed).toContain('id="prep-ot-prep"')
  expect(closed).toContain('role="progressbar"')
  expect((closed.match(/ws-prep-group-label/g) || []).length).toBe(4)
  expect((closed.match(/ws-prep-rowbtn/g) || []).length).toBe(7)
  expect(closed).not.toMatch(/<details open/)
  const opened = flat(<PrepNotices guides={PREP_GUIDES} search="?tab=공지&notice=ot-prep" />)
  expect(opened).toMatch(/<details open/)
  expect(noticeParam('?tab=공지&notice=ot-prep')).toBe('ot-prep')
})

test('상세 — 첫 항목 기본 선택 · 단계 번호 열 · 끝냄 버튼 1개(채움) · 검정 원·pill 버튼 없음', () => {
  const html = flat(<PrepGuide guide={PREP_GUIDES[0]} />)
  expect(html).toContain('is-active')
  expect((html.match(/ws-prep-step-no/g) || []).length).toBeGreaterThanOrEqual(6)
  expect((html.match(/ws-prep-done"/g) || []).length).toBe(2)   // SSR = 좌(1열용 인라인) + 우(2열용 패널) 각 1개, CSS가 하나만 보임
  expect(html).not.toContain('ws-prep-how')
  expect(html).not.toContain('ws-prep-check-no')
})

test('firstOpen — 첫 미완료, 전부 완료면 0', () => {
  expect(firstOpen([true, false, true])).toBe(1)
  expect(firstOpen([true, true])).toBe(0)
  expect(firstOpen([false])).toBe(0)
})

test('Inline — **굵게**·URL 링크만, HTML 미생성', () => {
  const html = flat(<p><Inline text="**학번**을 넣고 https://kwu-erpclub.github.io/workspace/ 에 <b>x</b>" /></p>)
  expect(html).toContain('<strong>학번</strong>')
  expect(html).toContain('href="https://kwu-erpclub.github.io/workspace/"')
  expect(html).toContain('&lt;b&gt;x&lt;/b&gt;')
})
