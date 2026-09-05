// 세미나 목록 v5(2026-08-15 오너 개편) 계약 — 세로 타임라인 + lead 강조, 필터·피처 밴드·3열 그리드 폐지.
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import SeminarsTimeline, { SeminarTimeline, SeminarRow } from './SeminarsTimeline.jsx'

const noop = () => {}
const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')
const TODAY = '2026-07-25'

const base = (over = {}) => ({
  slug: 's', title: '세미나 제목', author: '홍', date: '2026-07-10', 회차: '1', 유형: '인지', body: '서문 문장.', ...over,
})

// ── SeminarTimeline (프리젠테이션) ──
test('빈 상태 = 디자인된 1줄 "세미나 기록 아직 없음"', () => {
  const html = renderToString(<SeminarTimeline items={[]} today={TODAY} />)
  expect(html).toContain('sem-tl-empty')
  expect(html).toContain('세미나 기록 아직 없음')
})

test('구조 = 스파인 1개 + 행 N개, 맨 위 = lead(최신·다음)', () => {
  const items = [base({ slug: 'a', title: '최신글', date: '2026-08-01' }), base({ slug: 'b', title: '이전글', date: '2026-06-01' })]
  const html = flat(<SeminarTimeline items={items} today={TODAY} onOpen={noop} />)
  expect((html.match(/sem-tl-spine/g) || []).length).toBe(1)
  expect((html.match(/sem-tl-row/g) || []).length).toBe(2)
  expect((html.match(/is-lead/g) || []).length).toBe(1) // lead = 1건뿐
  expect(html.indexOf('최신글')).toBeLessThan(html.indexOf('이전글'))
  // 구 골격(피처 밴드·3열 그리드·필터) 부재
  for (const gone of ['sem-feat', 'sem-grid', 'sem-card', 'sem-filter', 'NEXT SEMINAR', 'LATEST SEMINAR']) {
    expect(html).not.toContain(gone)
  }
})

// ── SeminarRow ──
test('행 = 회차 노드 + 썸네일 + 날짜·유형 + 제목(대시는 줄바꿈)', () => {
  const s = base({ 회차: '2', 유형: '실습', 썸네일: ['/t1.png', '/t2.png'], title: '앞절 — 뒷절' })
  const html = flat(<SeminarRow s={s} today={TODAY} onOpen={noop} index={1} />)
  expect(html).toContain('sem-tl-node')
  expect(html).toContain('sem-tl-ep')
  expect(html).toContain('sem-tl-shot')
  expect(html).toContain('/t1.png')
  expect(html).not.toContain('/t2.png') // 첫 장 1장만
  expect(html).toContain('2026.07.10')
  expect(html).toContain('실습')
  expect(html).toContain('sem-tl-h-main')
  expect(html).toContain('sem-tl-h-sub')
  expect(html).not.toContain('—') // 대시 미표기
  // 썸네일 없으면 프레임 자체가 없다
  expect(flat(<SeminarRow s={base()} today={TODAY} onOpen={noop} />)).not.toContain('sem-tl-shot')
})

test('행 — 예정 배지: date>today ∨ 일정미정, 과거면 없음', () => {
  expect(flat(<SeminarRow s={base({ date: '2026-08-07' })} today={TODAY} />)).toContain('sem-soon-badge')
  const tbd = flat(<SeminarRow s={base({ date: '2026-06-01', 일정미정: true })} today={TODAY} />)
  expect(tbd).toContain('sem-soon-badge')
  expect(tbd).toContain('일정 미정')
  expect(tbd).not.toContain('2026.06.01')
  expect(flat(<SeminarRow s={base({ date: '2026-06-01' })} today={TODAY} />)).not.toContain('sem-soon-badge')
})

test('행 — lead 클래스는 주입값 그대로 반영', () => {
  expect(flat(<SeminarRow s={base()} today={TODAY} lead />)).toContain('is-lead')
  expect(flat(<SeminarRow s={base()} today={TODAY} />)).not.toContain('is-lead')
})

// 회귀 고정(2026-09-05) — 스크롤 연동 모션 폐지. `in`(리빌)·`is-active`(중앙 행)는 React가 className을
// 덮어쓰며 서로를 지웠고 행이 opacity:0에 갇혀 화면이 백지가 됐다. 두 클래스·스파인 채움이 다시 들어오면 FAIL.
test('스크롤 연동 잔재 부재 — is-active·sem-tl-fill 없음', () => {
  const items = [base({ slug: 'a', date: '2026-08-01' }), base({ slug: 'b', date: '2026-06-01' })]
  const html = flat(<SeminarTimeline items={items} today={TODAY} onOpen={noop} />)
  expect(html).toContain('sem-tl-spine')
  for (const gone of ['is-active', 'sem-tl-fill', 'scaleY']) {
    expect(html).not.toContain(gone)
  }
})

// ── 컨테이너 ──
test('컨테이너 = 헤드만(필터 바·설명 줄 폐지 2026-08-15)', () => {
  const all = [base({ slug: 'a', 주제: '에이전트' }), base({ slug: 'b', 주제: '거버넌스·리스크' })]
  const html = flat(<SeminarsTimeline all={all} today={TODAY} onOpen={noop} />)
  expect(html).toContain('SEMINARS')
  expect(html).toContain('sem-tl')
  expect(html).not.toContain('sem-filter')
  expect(html).not.toContain('sem-sort')
  expect(html).not.toContain('pg-sub')   // 설명 줄 삭제
  expect(html).not.toContain('공간입니다')
})

// 미공개(공개:false) = 대외 노출 금지(오너 2026-08-15) — 운영진 열람은 워크스페이스 경로.
test('공개:false 세미나는 목록에서 제외', () => {
  const all = [base({ slug: 'pub', title: '공개분' }), base({ slug: 'hid', title: '준비중분', 공개: false })]
  const html = flat(<SeminarsTimeline all={all} today={TODAY} onOpen={noop} />)
  expect(html).toContain('공개분')
  expect(html).not.toContain('준비중분')
})
