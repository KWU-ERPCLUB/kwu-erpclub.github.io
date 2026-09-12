import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import PrepNotices, { PrepGuide, Inline, noticeParam } from './PrepNotice.jsx'
import { PREP_GUIDES, guideForSession, guideHref } from '../data/prep-guides.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

test('준비물 원천 — 회차 1 안내 = 항목 7 · 각 항목에 what·steps · 대시(—) 절 잇기 0', () => {
  const g = guideForSession(1)
  expect(g.id).toBe('ot-prep')
  expect(g.items.length).toBe(7)
  for (const it of g.items) {
    expect(it.what.length).toBeGreaterThan(10)
    expect(it.steps.length).toBeGreaterThanOrEqual(3)
    expect(JSON.stringify(it)).not.toContain(' — ')
  }
  expect(guideForSession(2)).toBeNull()
  expect(guideHref(g)).toBe('/workspace/?tab=공지&notice=ot-prep')
})

test('고정 공지 렌더 — 📌 행 + 체크박스 7 + 진행 0/7, 기본 접힘, ?notice= 일치 시 펼침', () => {
  const closed = flat(<PrepNotices guides={PREP_GUIDES} search="" />)
  expect(closed).toContain('ws-prep-row')
  expect(closed).toContain('id="prep-ot-prep"')
  expect((closed.match(/ws-prep-check"/g) || []).length).toBe(7)
  expect(closed).toContain('0/7')
  expect(closed).not.toMatch(/<details open/)
  const opened = flat(<PrepNotices guides={PREP_GUIDES} search="?tab=공지&notice=ot-prep" />)
  expect(opened).toMatch(/<details open/)
  expect(noticeParam('?tab=공지&notice=ot-prep')).toBe('ot-prep')
})

test('Inline — **굵게**·URL 링크만, HTML 미생성', () => {
  const html = flat(<p><Inline text="**학번**을 넣고 https://kwu-erpclub.github.io/workspace/ 에 <b>x</b>" /></p>)
  expect(html).toContain('<strong>학번</strong>')
  expect(html).toContain('href="https://kwu-erpclub.github.io/workspace/"')
  expect(html).toContain('&lt;b&gt;x&lt;/b&gt;')
})

test('PrepGuide 단독 렌더 — 항목 제목·분 표기·메모', () => {
  const html = flat(<PrepGuide guide={PREP_GUIDES[0]} />)
  expect(html).toContain('워크스페이스 비밀번호 바꾸기')
  expect(html).toContain('5분')
  expect(html).toContain('ws-prep-note')
})
