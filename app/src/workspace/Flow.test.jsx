import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Flow, { weekStatus } from './Flow.jsx'
import { findByNo, seminarHref } from './Roadmap.jsx'
import { createMockRepositories } from '../data/mock.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

test('weekStatus — 시작일~+6일 = 이번 주, 이전 = 예정, 이후 = 지난', () => {
  expect(weekStatus('2026-09-07', '2026-09-07')).toBe('이번 주')
  expect(weekStatus('2026-09-07', '2026-09-13')).toBe('이번 주')
  expect(weekStatus('2026-09-07', '2026-09-14')).toBe('지난')
  expect(weekStatus('2026-09-07', '2026-09-06')).toBe('예정')
})

test('흐름 탭 골격 = 클릭형 로드맵 + 주차 기록(SSR — 데이터는 클라이언트 로드)', () => {
  const html = flat(<Flow store={createMockRepositories({ user: 'mock-member' })} staff={false} />)
  expect(html).toContain('차시를 누르면')          // 2026-08-13 개편 — 로드맵 = 진입점
  expect(html).not.toContain('차시 진행')          // 구 별도 섹션은 로드맵에 흡수·제거
  expect(html).toContain('주차 기록')
  expect(html).toContain('주 단위 진행 기록')
  expect(html).not.toContain('주차 기록 추가')     // 비운영진 = 등록 폼 없음
})

test('1기 로드맵 = 클릭형 세로 타임라인(회차별 주제·배울 것 상시, 세부는 드롭박스, 미정은 추후 확정 표기)', () => {
  const html = flat(<Flow store={createMockRepositories({ user: 'mock-member' })} staff={false} />)
  expect(html).toContain('1기 로드맵')
  expect(html).toContain('ws-rm')                  // 타임라인 골격
  expect(html).toContain('ws-rm-toggle')           // 차시 = 토글 버튼(드롭박스 진입)
  expect(html).toContain('aria-expanded')
  expect(html).toContain('킥오프 — 질문에서 위임으로')
  expect(html).toContain('다섯 활용 축 체험')
  expect(html).toContain('중간 쇼케이스')
  expect(html).toContain('2차 프로젝트 — 팀')
  expect(html).toContain('추후 확정')              // 미정 값을 확정처럼 쓰지 않는다
  expect(html).not.toContain('서로 묻는 질문')     // 2026-08-06 오너 — 질문 블록 제거
  expect(html.indexOf('1기 로드맵')).toBeLessThan(html.indexOf('주차 기록'))  // 상단 배치(로드맵 → 주차 기록)
  // 마케팅 어투 금지(모집 카피 규칙 준용)
  for (const banned of ['지금 바로', '놓치지', '마지막 기회', '서두르', '얼른']) expect(html).not.toContain(banned)
})

test('회차 매칭 — 로드맵 no ↔ DB 세션·세미나 회차, 세미나 딥링크(?p=슬러그)', () => {
  expect(findByNo([{ 회차: 1 }, { 회차: 2 }], 2)).toEqual({ 회차: 2 })
  expect(findByNo([{ 회차: '1' }], 1)).toEqual({ 회차: '1' })   // 문자열 회차도 매칭(frontmatter·DB 혼용)
  expect(findByNo([], 1)).toBeNull()
  expect(seminarHref({ slug: '2026-07-25-bapzzi-question-to-delegation' })).toBe('/seminars/?p=2026-07-25-bapzzi-question-to-delegation')
  expect(seminarHref(null)).toBeNull()
})

test('운영진 = 인라인 등록 폼 노출', () => {
  const html = flat(<Flow store={createMockRepositories({ user: 'mock-staff' })} staff />)
  expect(html).toContain('주차 기록 추가')
  expect(html).toContain('시작일')
})

test('flow 저장소 — 운영진만 쓰기·삭제(목 = RLS 동형)', async () => {
  const member = createMockRepositories({ user: 'mock-member' })
  await expect(member.flow.save({ 주차: '9월 3주', 시작일: '2026-09-21', 제목: 'x' })).rejects.toThrow()
  const staff = createMockRepositories({ user: 'mock-staff' })
  const row = await staff.flow.save({ 주차: '9월 3주', 시작일: '2026-09-21', 제목: 'x' })
  expect(row.id).toBeTruthy()
  await staff.flow.remove(row.id)
  const rows = await staff.flow.list()
  expect(rows.some((r) => r.id === row.id)).toBe(false)
})
