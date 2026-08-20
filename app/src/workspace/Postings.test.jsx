import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Postings, { PostingCard } from './Postings.jsx'
import AdminPostings from './AdminPostings.jsx'
import { createMockRepositories } from '../data/mock.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

// SSR = 초기(로딩) 상태만 그린다 — 페치 후 목록·정렬은 순수 로직 테스트(postings-logic.test.js)가 담당.
test('공고 탭 골격 = 종류 필터 + 접수 임박 레일 + 보드 안내', () => {
  const html = flat(<Postings store={createMockRepositories({ user: 'mock-member' })} />)
  for (const k of ['전체', '공모전', '채용', '자격증', '교내활동']) expect(html).toContain(k)
  expect(html).toContain('접수 임박')
  // 보드 안내 = 조작법 3줄(오너 2026-08-19 축약). 구 설명문("왜 유효한가")은 코멘트 폐지로 사실도 아니게 됐다.
  expect(html).toContain('보드 안내')
  expect(html).toContain('원문 사이트로 이동')
  expect(html).not.toContain('왜 유효한가')
  expect(html).toContain('불러오는 중')
})

// 행 = 링크(2026-08-19 2차 오너) — 이 보드는 링크 모음판이라 행 전체가 원문 사이트로 가는 링크다.
// 화면에 남는 것 = 종류·제목·출처·날짜·D-n. 코멘트·주최 상세는 원문이 더 잘 보여 준다(펼침 폐지).
test('행 = 원문 링크 자체 + 종류·제목·출처·D-n(마감=흐림)', () => {
  const active = flat(<PostingCard todayKey="2026-09-08" row={{ id: 'p', 제목: 'ADsP 51회 접수', 종류: '자격증', 주최: 'Kdata', 출처: '링커리어', url: 'https://example.com/x', 접수시작: '2026-09-05', 접수마감: '2026-09-09', 시험일: '2026-10-11', 코멘트: '접수창 5일 주의', 고정: true }} />)
  expect(active).toContain('class="ws-prow-link" href="https://example.com/x"')
  expect(active).toContain('자격증')
  expect(active).toContain('링커리어')          // 출처 배지
  expect(active).toContain('D-1')
  expect(active).toContain('09-09')            // 행 날짜 = 연도 없는 짧은 표기
  expect(active).not.toContain('접수창 5일 주의')  // 코멘트 = 목록에 쓰지 않는다(데이터로만 유지)
  expect(active).not.toContain('고정')          // 고정 배지 폐지 — 오너가 설정한 적 없는 값(2026-08-19)

  const closed = flat(<PostingCard todayKey="2026-09-08" row={{ id: 'q', 제목: '지난 공모전', 종류: '공모전', url: 'https://example.com/y', 접수마감: '2026-09-01', 코멘트: 'c' }} />)
  expect(closed).toContain('closed')
  expect(closed).toContain('마감')

  const always = flat(<PostingCard todayKey="2026-09-08" row={{ id: 'r', 제목: '상시 채용', 종류: '채용', url: 'https://example.com/z', 접수마감: null, 코멘트: 'c' }} />)
  expect(always).toContain('상시')
})

test('공고 저장소 — 운영진만 등록·삭제, 멤버는 열람만(목 저장소)', async () => {
  const staff = createMockRepositories({ user: 'mock-staff' })
  const before = await staff.postings.list()
  const added = await staff.postings.save({ 제목: '새 공고', 종류: '채용', url: 'https://example.com/new', 코멘트: '한 줄' })
  expect(await staff.postings.list()).toHaveLength(before.length + 1)
  await staff.postings.remove(added.id)
  expect(await staff.postings.list()).toHaveLength(before.length)

  const member = createMockRepositories({ user: 'mock-member' })
  expect((await member.postings.list()).length).toBeGreaterThan(0)   // 열람 가능
  await expect(member.postings.save({ 제목: 'x', 종류: '채용', url: 'https://e.com', 코멘트: 'c' })).rejects.toThrow('권한 없음')
  await expect(member.postings.remove('mock-p1')).rejects.toThrow('권한 없음')
})

// 관심 ★(2026-08-14) — 카드에 토글 버튼, 체크한 것은 내정보 "관심 공고"에 모인다(0013 posting_interests).
test('카드 관심 ★ — onToggleInterest 있으면 토글 버튼(aria-pressed), 없으면 미렌더', () => {
  const row = { id: 'p', 제목: 't', 종류: '채용', url: 'https://e.com', 접수마감: null, 코멘트: 'c' }
  const withStar = flat(<PostingCard todayKey="2026-09-08" row={row} interested onToggleInterest={() => {}} />)
  expect(withStar).toContain('ws-post-star')
  expect(withStar).toContain('aria-pressed="true"')
  const noStar = flat(<PostingCard todayKey="2026-09-08" row={row} />)
  expect(noStar).not.toContain('ws-post-star')
})

test('관심 저장소 — 본인 행만 켜고 끈다(목 = 0013 RLS 동형), 비로그인 = 거부', async () => {
  const member = createMockRepositories({ user: 'mock-member' })
  const before = await member.postings.listInterests()
  expect(before).toContain('mock-p2')                       // 시드 1건
  await member.postings.toggleInterest('mock-p1', true)
  expect(await member.postings.listInterests()).toContain('mock-p1')
  await member.postings.toggleInterest('mock-p1', false)
  expect(await member.postings.listInterests()).not.toContain('mock-p1')

  const other = createMockRepositories({ user: 'mock-staff' })
  expect(await other.postings.listInterests()).not.toContain('mock-p2')   // 본인 것만
  const anon = createMockRepositories()
  expect(await anon.postings.listInterests()).toEqual([])
  await expect(anon.postings.toggleInterest('mock-p1', true)).rejects.toThrow('로그인 필요')
})

// 열람 표시(2026-08-20 오너) — 새 공고 = N 배지, 열람한 행 = seen 클래스(제목 흐림). 판정은 posting-seen.test.js.
test('카드 열람 표시 — fresh = N 배지, seen = 흐림 클래스, 기본 = 둘 다 없음', () => {
  const row = { id: 'p', 제목: 't', 종류: '채용', url: 'https://e.com', 접수마감: null, 코멘트: 'c' }
  const fresh = flat(<PostingCard todayKey="2026-09-08" row={row} fresh onSee={() => {}} />)
  expect(fresh).toContain('ws-prow-new')
  const seenHtml = flat(<PostingCard todayKey="2026-09-08" row={row} seen />)
  expect(seenHtml).toContain('ws-prow seen')
  const plain = flat(<PostingCard todayKey="2026-09-08" row={row} />)
  expect(plain).not.toContain('ws-prow-new')
  expect(plain).not.toContain('ws-prow seen')
})

test('운영 폼 골격 = 전 필드 + 코멘트는 선택', () => {
  const html = flat(<AdminPostings store={createMockRepositories({ user: 'mock-staff' })} />)
  for (const label of ['제목', '종류', '주최(선택)', '원문 링크', '접수시작(선택)', '접수마감(선택)', '시험일(선택)', '다가오는 업무에 표시']) {
    expect(html).toContain(label)
  }
  expect(html).toContain('코멘트(선택)')   // 필수 → 선택(2026-08-19, migration 0018)
  expect(html).toContain('캘린더에 자동 합류')
})
