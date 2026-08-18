import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Workspace, { NotConfigured, LoginForm, Shell, WS_TABS, visibleTabs, initialTab } from './Workspace.jsx'
import { createMockRepositories } from '../data/mock.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

// ── ① 미설정(env 없음) — 로그인 폼 대신 대기 안내 ──
test('미설정 = 백엔드 연결 대기 안내(로그인 폼 없음)', () => {
  const html = flat(<Workspace repos={createMockRepositories()} configured={false} />)
  expect(html).toContain('백엔드 연결 대기')
  expect(html).toContain('VITE_SUPABASE_URL')
  expect(html).toContain('VITE_SUPABASE_ANON_KEY')
  expect(html).not.toContain('ws-form')
})

test('미설정 안내 = 프로비저닝 문서 경로 명시', () => {
  expect(flat(<NotConfigured />)).toContain('supabase/README.md')
})

// ── ② 로그인 폼 — 자가입 경로 없음(SPEC §0-4) ──
test('설정됨·비로그인 = 학번·비밀번호 폼(이메일 입력 아님 — §0-4 개정)', () => {
  const html = flat(<Workspace repos={createMockRepositories()} configured />)
  expect(html).toContain('ws-form')
  expect(html).toContain('>학번<')
  expect(html).toContain('placeholder="학번(숫자)"')
  expect(html).toContain('numeric')
  expect(html).not.toContain('type="email"')
  expect(html).not.toContain('이메일')
  expect(html).toContain('type="password"')
  expect(html).toContain('운영진 초대 생성')
  // 회원가입·비밀번호 재설정 등 자가입 경로 미노출
  expect(html).not.toContain('회원가입')
})

test('LoginForm — 오류 메시지는 role=alert, 처리 중이면 버튼 비활성', () => {
  const err = flat(<LoginForm error="잘못된 로그인" />)
  expect(err).toContain('role="alert"')
  expect(err).toContain('잘못된 로그인')
  expect(flat(<LoginForm busy />)).toContain('disabled')
})

// ── ③ 로그인 후 셸 (좌 사이드바 5탭 — 홈 개편 2026-08-06) ──
test('Shell = 멤버 이름·역할 + 좌 사이드바(기본 탭 = 홈: 캘린더+업무) + 로그아웃', () => {
  const html = flat(<Shell member={{ 이름: '홍길동', role: '운영진' }} store={createMockRepositories({ user: 'mock-staff' })} search="" />)
  expect(html).toContain('홍길동')
  expect(html).toContain('운영진')
  for (const [name] of WS_TABS) expect(html).toContain(name)
  expect(html).toContain('ws-side')            // 좌측 사이드바 골격
  expect(html).toContain('ws-cal-grid')        // 첫 화면 = 대형 월 캘린더
  expect(html).toContain('다가오는 업무')
  expect(html).toContain('과제')               // 구 제출 탭 흡수(제출 UI 홈 상주)
  expect(html).toContain('공지')               // 구 스터디 탭 흡수
  expect(html).toContain('로그아웃')
})

test('기고 탭 = 단독 탭 승격(?tab=기고 — 키트·승인 요청 도달)', () => {
  const html = flat(<Shell member={{ 이름: '홍길동', role: '스터디원' }} store={createMockRepositories({ user: 'mock-member' })} search="?tab=기고" />)
  expect(html).toContain('ws-contribute')
  expect(html).toContain('프롬프트 복사')
  expect(html).toContain('승인 요청')
})

test('내정보 탭 = 프로필·북마크·활동내역(북마크 단독 탭 폐지 — 2026-08-14 흡수)', () => {
  const my = flat(<Shell member={{ 이름: '홍길동', role: '스터디원' }} store={createMockRepositories({ user: 'mock-member' })} search="?tab=내정보" />)
  expect(my).toContain('ws-mypage')
  expect(my).toContain('프로필')
  expect(my).toContain('활동내역')
  expect(my).toContain('내 북마크')            // 흡수된 북마크 섹션(정사각 그리드)
  expect(my).toContain('ws-marks')
  expect(my).not.toContain('링크 스크랩')
  // 구 북마크 탭 진입 = 내정보로 매핑
  const marks = flat(<Shell member={{ 이름: '홍길동', role: '스터디원' }} store={createMockRepositories({ user: 'mock-member' })} search="?tab=북마크" />)
  expect(marks).toContain('내 북마크')
})

// ── M3 ④ 역할별 탭 노출 ──
test('운영 탭 = 운영진에게만 노출(스터디원 탭바에 없음)', () => {
  expect(visibleTabs({ role: '운영진' }).map(([n]) => n)).toContain('운영')
  expect(visibleTabs({ role: '스터디원' }).map(([n]) => n)).not.toContain('운영')
  expect(visibleTabs(null).map(([n]) => n)).not.toContain('운영')

  const html = flat(<Shell member={{ 이름: 'ㄱ', role: '스터디원' }} store={createMockRepositories({ user: 'mock-member' })} search="" />)
  expect(html).not.toContain('>운영<')
})

test('직접 진입(?tab=운영) — 스터디원은 안내만, 운영진은 운영 화면', () => {
  expect(initialTab('?tab=운영')).toBe('운영')
  expect(initialTab('?tab=없는탭')).toBe('홈')   // 미지 값 = 첫 화면(홈)

  const store = createMockRepositories({ user: 'mock-member' })
  const denied = flat(<Shell member={{ 이름: 'ㄱ', role: '스터디원' }} store={store} search="?tab=운영" />)
  expect(denied).toContain('운영진 전용')
  expect(denied).not.toContain('ws-admin"')

  const staff = flat(<Shell member={{ 이름: 'ㄴ', role: '운영진' }} store={createMockRepositories({ user: 'mock-staff' })} search="?tab=운영" />)
  expect(staff).toContain('승인대기')
  expect(staff).toContain('멤버')
})

// 구 탭명 딥링크 = 새 탭으로 매핑(링크 깨짐 0 — 2026-08-06 홈 개편, 2026-08-14 재편)
test('구 탭명 딥링크 매핑 — 제출·스터디·과제·세션 → 홈 / 컬렉션·북마크 → 내정보 / 흐름 → 로드맵 / 기고 → 새 이름', () => {
  expect(initialTab('?tab=제출')).toBe('홈')
  expect(initialTab('?tab=스터디')).toBe('홈')
  expect(initialTab('?tab=과제')).toBe('홈')
  expect(initialTab('?tab=공지')).toBe('공지')   // 2026-08-18 전용 탭 승격 — 더는 홈으로 안 보냄
  expect(initialTab('?tab=세션')).toBe('홈')
  expect(initialTab('?tab=컬렉션')).toBe('내정보')
  expect(initialTab('?tab=북마크')).toBe('내정보')
  expect(initialTab('?tab=흐름')).toBe('로드맵')
  expect(initialTab('?tab=스터디 흐름')).toBe('로드맵')
  expect(initialTab('?tab=기고')).toBe('인사이트 기고')
})

test('홈 = 과제 제출·공지 화면(구 딥링크 경유 포함) — 세션·운영 기록은 홈에서 제거(2026-08-18)', () => {
  const store = createMockRepositories({ user: 'mock-member' })
  const member = { 이름: 'ㄱ', role: '스터디원' }
  const 홈 = flat(<Shell member={member} store={store} search="?tab=과제" />)
  expect(홈).toContain('ws-cal-grid')
  expect(홈).toContain('과제')
  expect(홈).toContain('공지')
  expect(홈).not.toContain('운영 기록')        // 운영 탭으로 이동(오너 — 스터디원 열람 불필요)
  expect(홈).not.toContain('준비 중')
})

// 공지 전용 탭(2026-08-18 오너) — 스터디원에게도 노출 + 탭 본문 = 카드 서식.
test('공지 탭 — 사이드바 노출 + ?tab=공지 진입 시 공지 본문 렌더, 홈 레일은 제목만', () => {
  expect(visibleTabs({ role: '스터디원' }).map(([n]) => n)).toContain('공지')
  const store = createMockRepositories({ user: 'mock-member' })
  const html = flat(<Shell member={{ 이름: 'ㄱ', role: '스터디원' }} store={store} search="?tab=공지" />)
  expect(html).toContain('ws-notices')
})

// P5 재해석(§0-5 개정): 학번 = 로그인 ID → 본인 화면 표시 허용. 사적 필드는 전공뿐 — 셸이 그리지 않는다.
test('Shell = 본인 학번 표시·전공 미표시(P5)', () => {
  const member = { 이름: '홍길동', role: '스터디원', 학번: '2021000000', 전공: '경영학부' }
  const html = flat(<Shell member={member} store={createMockRepositories({ user: 'mock-member' })} search="?tab=내정보" />)
  expect(html).toContain('2021000000')
  expect(html).not.toContain('경영학부')
})

// ── 앱형 셸(2026-08-06 재구성) — 로그인 후 = 히어로·패널 없음 + 사이드바 계정 블록 + 탭 소형 헤더 ──
test('로그인 후 = 앱 셸(히어로 헤드·문서 패널 없음, 사이드바 하단 계정 블록 + 아이콘 탭)', () => {
  const html = flat(<Shell member={{ 이름: '홍길동', role: '스터디원' }} store={createMockRepositories({ user: 'mock-member' })} search="?tab=내정보" />)
  expect(html).not.toContain('ws-head')          // 히어로 헤드 = 로그인 전 전용
  expect(html).not.toContain('ws-panel')         // 문서 패널 래핑 폐지
  expect(html).toContain('ws-side-me')           // 계정 블록 = 사이드바 하단
  expect(html).toContain('ws-content-head')      // 홈 외 탭 = 소형 헤더
  expect(html).toContain('ws-tabicon')           // 탭 = 아이콘(설명 문구 폐지 — 2026-08-14)
  expect(html).not.toContain('ws-sidebtn-desc')
  expect(html).toContain('aria-current="true"')  // 사이드바 현재 탭 = aria-current(구 aria-pressed — 2026-08-14 검수)
})

// 2026-08-18 개편 — 다가오는 업무 = 개인 캘린더 2주 창 전량(구 ★만·역할 분기 안내 폐기).
test('다가오는 업무 빈 상태 = 공고 탭 등록 안내 한 줄(역할 무관)', async () => {
  const { UpcomingTasks } = await import('./Home.jsx')
  const html = flat(<UpcomingTasks items={[]} todayKey="2026-09-01" onSelect={() => {}} />)
  expect(html).toContain('2주 내 일정 0건')
  expect(html).not.toContain('운영 탭')
})

// 공통 프레임(오너 확정 8/6 3차) — 전 탭 = 본문+우측 레일 단일 그리드. 탭 전환 시 열 경계 이동 0.
test('전 탭 = 공통 프레임(ws-cols 본문+레일) — 탭별 개별 분할 금지', () => {
  for (const tab of ['홈', '로드맵', '공고', '인사이트 기고', '내정보']) {
    const html = flat(<Shell member={{ 이름: 'ㄱ', role: '스터디원' }} store={createMockRepositories({ user: 'mock-member' })} search={`?tab=${tab}`} />)
    expect(html, tab).toContain('ws-cols')
    expect(html, tab).toContain('ws-cmain')
    expect(html, tab).toContain('ws-crail')
  }
  const staff = flat(<Shell member={{ 이름: 'ㄴ', role: '운영진' }} store={createMockRepositories({ user: 'mock-staff' })} search="?tab=운영" />)
  expect(staff).toContain('ws-cols')
  expect(staff).toContain('ws-crail')
})

test('운영 탭에 제출 현황 매트릭스 포함(운영진)', () => {
  const html = flat(<Shell member={{ 이름: 'ㄴ', role: '운영진' }} store={createMockRepositories({ user: 'mock-staff' })} search="?tab=운영" />)
  expect(html).toContain('제출 현황')
})

// ── 공통 골격(디자인규칙 §3-1 — 자체 head 폐지, 공용 PageHead 이관 2026-08-14) ──
test('page-head 골격 = 공용 PageHead(눈썹 WORKSPACE + h1 + 서브 1줄), nav·footer 공용', () => {
  const html = flat(<Workspace repos={createMockRepositories()} configured={false} />)
  expect(html).toContain('pg-label">WORKSPACE')
  expect(html).toContain('pg-title')
  expect(html).toContain('pg-sub')
  expect(html).not.toContain('ws-eyebrow')       // 구 자체 head CSS = 위반(§3-1) — 제거됨
  expect(html).toContain('class="nav"')
  expect(html).toContain('class="footer"')
})

// 링크 상시 노출(오너 개정 2026-08-07) — 비로그인도 나브에서 로그인 화면에 도달할 수 있어야 한다.
test('공개 내비에 워크스페이스 링크 상시 노출', () => {
  const html = flat(<Workspace repos={createMockRepositories()} configured={false} />)
  expect(html).toContain('href="/workspace/"')
})

// ── 캘린더 항목 세부 팝업(2026-08-07 오너 — 새 창 대신 작은 둥근 팝업) ──
test('ItemPopup = 종류·제목·날짜·설명 + 공고면 원문 링크, item 없으면 미렌더', async () => {
  const { ItemPopup } = await import('./Home.jsx')
  const item = { date: '2026-10-02', 제목: '접수 마감 — ADsP 51회', 종류: '공고', 시간: '', 설명: '접수창 5일', 주최: 'Kdata', url: 'https://example.com/x' }
  const html = flat(<ItemPopup item={item} onClose={() => {}} />)
  expect(html).toContain('ws-modal-card')
  expect(html).toContain('접수 마감 — ADsP 51회')
  expect(html).toContain('2026-10-02')
  expect(html).toContain('접수창 5일')
  expect(html).toContain('href="https://example.com/x"')
  expect(html).toContain('닫기')
  expect(flat(<ItemPopup item={null} onClose={() => {}} />)).toBe('')
})

// ── 경어체 금지(디자인규칙 §0-1 개조식 전면) ──
test('카피 = 개조식(경어체 종결 0건)', () => {
  const html = flat(<Workspace repos={createMockRepositories()} configured />)
    + flat(<NotConfigured />)
    + flat(<Shell member={{ 이름: 'ㄱ', role: '스터디원' }} store={createMockRepositories({ user: 'mock-member' })} search="" />)
  const text = html.replace(/<[^>]+>/g, ' ')
  for (const bad of ['합니다', '입니다', '됩니다', '하세요', '주세요']) expect(text).not.toContain(bad)
})
