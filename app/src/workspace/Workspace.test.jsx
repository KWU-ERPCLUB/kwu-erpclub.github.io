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

// ── ③ 로그인 후 셸 (접수창구 4탭 — spec 2026-08-05-워크스페이스-개편) ──
test('Shell = 멤버 이름·역할 + 탭바(기본 탭 = 제출: 기고+과제) + 로그아웃', () => {
  const html = flat(<Shell member={{ 이름: '홍길동', role: '운영진' }} store={createMockRepositories({ user: 'mock-staff' })} search="" />)
  expect(html).toContain('홍길동')
  expect(html).toContain('운영진')
  for (const [name] of WS_TABS) expect(html).toContain(name)
  expect(html).toContain('ws-tabbar')
  expect(html).toContain('ws-contribute')    // W1: 첫 화면 = 제출(기고 먼저)
  expect(html).toContain('프롬프트 복사')     // 1트랙 키트 패널 도달 가능
  expect(html).toContain('승인 요청')
  expect(html).toContain('과제')              // 과제 섹션이 같은 탭에 조립됨
  expect(html).toContain('로그아웃')
})

test('내정보 탭 = 프로필·활동내역·컬렉션 통합 유지(?tab=내정보)', () => {
  const html = flat(<Shell member={{ 이름: '홍길동', role: '스터디원' }} store={createMockRepositories({ user: 'mock-member' })} search="?tab=내정보" />)
  expect(html).toContain('ws-mypage')
  expect(html).toContain('프로필')
  expect(html).toContain('활동내역')
  expect(html).toContain('내 북마크')          // 컬렉션 통합 — 한 화면에서 확인
  expect(html).toContain('링크 스크랩')
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
  expect(initialTab('?tab=없는탭')).toBe('제출')   // 미지 값 = 첫 화면(W1)

  const store = createMockRepositories({ user: 'mock-member' })
  const denied = flat(<Shell member={{ 이름: 'ㄱ', role: '스터디원' }} store={store} search="?tab=운영" />)
  expect(denied).toContain('운영진 전용')
  expect(denied).not.toContain('ws-admin"')

  const staff = flat(<Shell member={{ 이름: 'ㄴ', role: '운영진' }} store={createMockRepositories({ user: 'mock-staff' })} search="?tab=운영" />)
  expect(staff).toContain('승인대기')
  expect(staff).toContain('멤버')
})

// W3: 구 6탭 딥링크 = 새 탭으로 매핑(링크 깨짐 0)
test('구 탭명 딥링크 매핑 — 기고·과제 → 제출 / 공지·세션 → 스터디', () => {
  expect(initialTab('?tab=기고')).toBe('제출')
  expect(initialTab('?tab=과제')).toBe('제출')
  expect(initialTab('?tab=공지')).toBe('스터디')
  expect(initialTab('?tab=세션')).toBe('스터디')
})

test('제출·스터디 탭 = 준비 중 문구 없이 실제 화면(구 딥링크 경유 포함)', () => {
  const store = createMockRepositories({ user: 'mock-member' })
  const member = { 이름: 'ㄱ', role: '스터디원' }
  const 제출 = flat(<Shell member={member} store={store} search="?tab=과제" />)
  expect(제출).toContain('과제')
  expect(제출).toContain('ws-contribute')
  expect(제출).not.toContain('준비 중')
  const 스터디 = flat(<Shell member={member} store={store} search="?tab=세션" />)
  expect(스터디).toContain('공지')                 // 공지 먼저
  expect(스터디).toContain('세션')
  expect(스터디).toContain('운영 기록')            // OpsLog 승계(IA 4차)
  expect(스터디).not.toContain('준비 중')
})

// P5 재해석(§0-5 개정): 학번 = 로그인 ID → 본인 화면 표시 허용. 사적 필드는 전공뿐 — 셸이 그리지 않는다.
test('Shell = 본인 학번 표시·전공 미표시(P5)', () => {
  const member = { 이름: '홍길동', role: '스터디원', 학번: '2021000000', 전공: '경영학부' }
  const html = flat(<Shell member={member} store={createMockRepositories({ user: 'mock-member' })} search="?tab=내정보" />)
  expect(html).toContain('2021000000')
  expect(html).not.toContain('경영학부')
})

// ── 공통 골격(디자인규칙 §3-1) ──
test('page-head 골격 = 눈썹 WORKSPACE + h1 + 서브 1줄, nav·footer 공용', () => {
  const html = flat(<Workspace repos={createMockRepositories()} configured={false} />)
  expect(html).toContain('ws-eyebrow">WORKSPACE')
  expect(html).toContain('ws-h1')
  expect(html).toContain('ws-lead')
  expect(html).toContain('class="nav"')
  expect(html).toContain('class="footer"')
})

test('공개 내비에 워크스페이스 링크 없음(M3에서 판단)', () => {
  const html = flat(<Workspace repos={createMockRepositories()} configured={false} />)
  expect(html).not.toContain('href="/workspace/"')
})

// ── 경어체 금지(디자인규칙 §0-1 개조식 전면) ──
test('카피 = 개조식(경어체 종결 0건)', () => {
  const html = flat(<Workspace repos={createMockRepositories()} configured />)
    + flat(<NotConfigured />)
    + flat(<Shell member={{ 이름: 'ㄱ', role: '스터디원' }} store={createMockRepositories({ user: 'mock-member' })} search="" />)
  const text = html.replace(/<[^>]+>/g, ' ')
  for (const bad of ['합니다', '입니다', '됩니다', '하세요', '주세요']) expect(text).not.toContain(bad)
})
