import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Log, { splitEntry, Changelog } from './Log.jsx'
import { HISTORY } from './data/log.js'

// 구조 검증(콘텐츠·시점 무관) — 2차 구조 개혁: 내부형 doc 셸 폐지 → linear.app 체인지로그 톤 풀블리드.
const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

// ── splitEntry(순수) — 원문 그대로 '제목 — 설명' 경계 분리(날조 없음) ──
test('splitEntry — " — " 경계로 제목·설명 분리', () => {
  const { title, desc } = splitEntry('사이트 역할 개정 — 메인은 소개, 세부는 기록용.')
  expect(title).toBe('사이트 역할 개정')
  expect(desc).toBe('메인은 소개, 세부는 기록용.')
})
test('splitEntry — 경계 없으면 전체가 제목·설명 빈값', () => {
  const { title, desc } = splitEntry('경계 없는 한 줄 기록.')
  expect(title).toBe('경계 없는 한 줄 기록.')
  expect(desc).toBe('')
})

// ── Changelog(세로 타임라인) — 합성 데이터로 구조만 검증 ──
test('Changelog = 날짜 그룹 세로 타임라인(마커·유형 배지·제목 볼드·개조식 설명)', () => {
  const history = [
    ['2099-01-02', [
      ['live', '신규', '항목 하나 — 부가 설명.'],
      ['prep', '개선', '설명 없는 항목.'],
    ]],
    ['2099-01-01', [['planned', '기록', '이전 항목 — 상세.']]],
  ]
  const html = flat(<Changelog history={history} />)
  expect(html).toContain('cl-timeline')
  expect(html).toContain('cl-group')
  expect(html).toContain('cl-date') // 대형 날짜 마커
  expect(html).toContain('2099-01-02')
  expect(html).toContain('cl-entries')
  expect(html).toContain('cl-entry')
  // 유형 배지(status 4종 문법 재사용) + 제목 볼드
  expect(html).toContain('status live')
  expect(html).toContain('status prep')
  expect(html).toContain('cl-title">항목 하나')
  // 개조식 설명(경계 있는 것만)
  expect(html).toContain('cl-desc">부가 설명.')
  expect(html).not.toContain('cl-desc">설명 없는 항목') // 경계 없으면 desc 미렌더
})

// ── 전체 Log — 내부형 doc 셸 폐지 + page-head + 로드맵 + 성과 ──
test('log = doc 셸(사이드바·breadcrumb) 폐지 + 풀블리드 셸', () => {
  const html = flat(<Log />)
  expect(html).not.toContain('doc-wrap')
  expect(html).not.toContain('doc-side')
  expect(html).not.toContain('doc-main')
  expect(html).not.toContain('crumb')
  expect(html).toContain('class="log-main"')
})

test('page-head(§3-1) = 눈썹 LOG + 헤드라인 + 설명 + 최종 갱신(데이터 실제 날짜)', () => {
  const html = flat(<Log />)
  expect(html).toContain('log-eyebrow">LOG')
  expect(html).toContain('log-h1')
  expect(html).toContain('log-lead')
  expect(html).toContain(`최종 갱신 ${HISTORY[0][0]}`) // HISTORY 최상단에서 파생(하드코딩 아님 — 기록 추가 시 자동 추종)
  // "내부 운영용" 콜아웃 유지 + RECRUIT 링크(about 폐지 2026-08-05)
  expect(html).toContain('log-callout')
  expect(html).toContain('href="/recruit/"')
})

test('로드맵 = 대형 리스트(단계 번호 + 상태 칩 4종) · 성과 = 스탯 스트립', () => {
  const html = flat(<Log />)
  expect(html).toContain('rmap-list')
  expect(html).toContain('rmap-no')
  expect(html).toContain('rmap-label')
  // 상태 칩 4종 문법(완료/모집 준비/예정)
  expect(html).toContain('status done')
  expect(html).toContain('status prep')
  expect(html).toContain('status planned')
  // 성과 스탯 스트립(언더바 문법 재사용) + 저장소 링크
  expect(html).toContain('log-stats')
  expect(html).toContain('stat-num')
  expect(html).toContain('btn-2nd')
})
