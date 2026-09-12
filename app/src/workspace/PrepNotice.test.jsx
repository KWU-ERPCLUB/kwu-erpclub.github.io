import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import { PrepGuideBody, Inline, itemIndexFromHash, splitSite } from './PrepNotice.jsx'
import { PREP_GUIDES, guideForSession, guideHref, guideItems } from '../data/prep-guides.js'
import GuidePrep, { guideFromPath } from '../pages/GuidePrep.jsx'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

// 표기를 걷어낸 실제 읽는 글자 — `[이름](주소)`는 이름만 남긴다(주소는 화면에 안 나온다).
const plain = (s) => s
  .replace(/\[([^\][]+)\]\((?:https?:\/\/|\/)[^\s)]+\)/g, '$1')
  .replace(/\*\*|\[\[|\]\]|\{\{|\}\}|<<|>>|\(\(|\)\)/g, '')

test('준비물 원천 — 묶음 4 · 항목 7 · 문장 규칙(대시 0 · 단계 40자 안 · 추임새 0 · 시간 없음 · 아이콘) · 공지 본문 = 정보·링크 블록', () => {
  const g = guideForSession(1)
  expect(g.groups.map((x) => x.label)).toEqual(['계정', '신청', '설치', '제출'])
  const items = guideItems(g)
  expect(items.length).toBe(7)
  for (const it of items) {
    expect(it.title.length).toBeLessThanOrEqual(18)
    expect(it.steps.length).toBeGreaterThanOrEqual(3)
    for (const s of it.steps) {
      expect(plain(s).length).toBeLessThanOrEqual(40)
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

// 오너 2026-09-13: 주소를 그대로 노출하지 않는다 — 링크는 전부 `[이름](주소)`로 쓴다.
test('링크 표기 — 준비물 원천에 맨 주소 0건, 전부 이름 붙은 링크', () => {
  for (const g of PREP_GUIDES) {
    const text = JSON.stringify(g).replace(/\[[^\][]+\]\((?:https?:\/\/|\/)[^\s)]+\)/g, 'LINK')
    expect(text).not.toMatch(/https?:\/\//)
  }
})

test('가이드 페이지 — 경로로 가이드 선택 · 셸(nav·PageHead·footer) · 본체(행 7 · 상세) · 진행 체크는 과제 탭으로', () => {
  expect(guideFromPath('/guide/ot-prep/').id).toBe('ot-prep')
  expect(guideFromPath('/guide/없음/').id).toBe('ot-prep')
  const html = flat(<GuidePrep pathname="/guide/ot-prep/" />)
  expect(html).toContain('pg-head')
  expect(html).toContain('OT 준비물 7가지')
  expect((html.match(/ws-prep-rowbtn/g) || []).length).toBe(7)
  expect(html).toContain('is-active')
  // 체크·완료 버튼·스테퍼는 과제 탭(서버 저장)으로 이관 — 가이드는 방법만 그린다
  expect(html).not.toContain('type="checkbox"')
  expect(html).not.toContain('ws-prep-done')
  expect(html).not.toContain('ws-prep-step-dot')
  expect(html).toContain('/workspace/?tab=과제')
})

test('PrepGuideBody 단독 — 단계 번호 열 · 항목 앵커(과제 탭 「하는 법」 착지점)', () => {
  const html = flat(<PrepGuideBody guide={PREP_GUIDES[0]} />)
  expect((html.match(/ws-prep-step-no/g) || []).length).toBeGreaterThanOrEqual(6)
  expect(html).toContain('id="item-pw"')
  expect(html).toContain('id="item-materials"')
})

test('itemIndexFromHash — #item-<id>로 그 항목, 없거나 모르는 값이면 첫 항목', () => {
  const items = guideItems(PREP_GUIDES[0])
  expect(itemIndexFromHash(items, '#item-github')).toBe(items.findIndex((i) => i.id === 'github'))
  expect(itemIndexFromHash(items, '#item-없음')).toBe(0)
  expect(itemIndexFromHash(items, '')).toBe(0)
})

test('Inline — 버튼·경로·입력·키캡·이름 링크가 모양으로, HTML 미생성', () => {
  const ui = flat(<p><Inline text="[[저장]] {{설정 › 비밀번호 변경}} <<학번>> ((Ctrl+Alt+I)) <b>x</b>" /></p>)
  expect(ui).toContain('class="ws-ui-btn">저장')
  expect((ui.match(/ws-ui-crumb/g) || []).length).toBe(2)
  expect(ui).toContain('class="ws-ui-input">학번')
  expect((ui.match(/<kbd>/g) || []).length).toBe(3)
  expect(ui).toContain('&lt;b&gt;x&lt;/b&gt;')

  // 링크 = 이름만 보이고 주소는 href로만(오너 2026-09-13)
  const link = flat(<p><Inline text="[무료 Gemini](https://gemini.google.com)로 시작" /></p>)
  expect(link).toContain('href="https://gemini.google.com"')
  expect(link).toContain('무료 Gemini')
  expect(link).not.toContain('>gemini.google.com<')
})

test('splitSite — 이름 붙은 링크로 시작하면 사이트 카드(이름 + 나머지 글)', () => {
  expect(splitSite('[구글 문서](https://docs.google.com) 열기'))
    .toEqual({ url: 'https://docs.google.com', label: '구글 문서', rest: '열기' })
  // 맨 주소 폴백 = 도메인을 이름 자리에(데이터가 규칙을 어겨도 화면은 산다)
  expect(splitSite('https://docs.google.com 접속'))
    .toEqual({ url: 'https://docs.google.com', label: 'docs.google.com', rest: '접속' })
  expect(splitSite('[[저장]] 누르기')).toEqual({ url: null, label: '', rest: '[[저장]] 누르기' })
})
