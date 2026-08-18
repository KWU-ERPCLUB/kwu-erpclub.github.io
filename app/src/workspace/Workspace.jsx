// 워크스페이스 셸(M1) — 로그인 + 기능 자리표시. 데이터는 전부 저장소 계층 경유(SPEC §1, P1).
// 공개 6페이지와 코드·CSS를 공유하지 않는다(styles/workspace.css 별도). 공개 헤더에 링크 상시 노출(오너 개정 2026-08-07).
import { useEffect, useState } from 'react'
import { SiteNav, SiteFooter, PageHead } from '../shared.jsx'
import { getRepositories, isBackendConfigured } from '../data/index.js'
import { CONTACT, CONTACT_MAILTO } from '../data/recruit.js'
import Contribute from './Contribute.jsx'
import MyPage from './MyPage.jsx'
import Home from './Home.jsx'
import Flow from './Flow.jsx'
import Postings from './Postings.jsx'
import Admin, { Denied } from './Admin.jsx'

// 기능 탭 — [이름, 접근]. 접근 'staff' = 운영진에게만 노출(M3 ④).
// 2026-08-14 재편(오너): 스터디 흐름 → 로드맵 개명 · 북마크 탭 = 내정보로 흡수 · 탭 설명 문구 폐지(아이콘 대체).
export const WS_TABS = [
  ['홈'],
  ['로드맵'],
  ['공고'],
  ['인사이트 기고'],
  ['내정보'],
  ['운영', 'staff'],
]

// 구 탭명 딥링크 호환 — 구 탭명 진입 시 새 탭으로 매핑(링크 깨짐 0).
const LEGACY_TAB_MAP = {
  제출: '홈', 스터디: '홈', 과제: '홈', 공지: '홈', 세션: '홈',
  컬렉션: '내정보', 북마크: '내정보', 흐름: '로드맵', '스터디 흐름': '로드맵', 기고: '인사이트 기고',
}

export const isStaffRole = (member) => member?.role === '운영진'
export const visibleTabs = (member) => WS_TABS.filter(([, only]) => only !== 'staff' || isStaffRole(member))

// 폰 하단 탭 바 축약 라벨(모바일 spec §3-1) — 긴 탭명만 등재, 나머지는 원명 그대로
const TAB_SHORT = { '인사이트 기고': '기고' }

// 탭 아이콘(설명 문구 대체 — "텍스트보다 시각 전달", 오너 2026-08-14). 16px stroke 인라인 SVG.
const TAB_ICONS = {
  홈: <path d="M3.5 10.2 12 3l8.5 7.2V20a1 1 0 0 1-1 1h-5.2v-5.6H9.7V21H4.5a1 1 0 0 1-1-1z" />,
  로드맵: <><circle cx="5.5" cy="5.5" r="2" /><circle cx="18.5" cy="18.5" r="2" /><path d="M7.5 5.5h7a3.5 3.5 0 0 1 0 7h-5a3.5 3.5 0 0 0 0 7h7" /></>,
  공고: <><path d="M3.5 10.5v3.5l11.5 5V5l-11.5 5.5z" /><path d="M18.5 9a4.2 4.2 0 0 1 0 6.4" /></>,
  '인사이트 기고': <path d="M4.5 19.5l1-4L17 4a2.05 2.05 0 0 1 2.9 2.9L8.4 18.5l-3.9 1z" />,
  내정보: <><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20.5c1.4-3.7 4.5-5.5 7.5-5.5s6.1 1.8 7.5 5.5" /></>,
  운영: <><path d="M4 7h16M4 12h16M4 17h16" /><circle cx="9" cy="7" r="1.7" fill="#fff" /><circle cx="15" cy="12" r="1.7" fill="#fff" /><circle cx="7" cy="17" r="1.7" fill="#fff" /></>,
}

function TabIcon({ name }) {
  return (
    <svg className="ws-tabicon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {TAB_ICONS[name] || null}
    </svg>
  )
}

// 직접 진입(/workspace/?tab=운영) 지원 — 권한 없는 탭이면 셸이 안내 화면을 그린다(이중 차단의 화면 쪽).
// 알 수 없는 값 = 첫 화면(홈).
export function initialTab(search) {
  const raw = new URLSearchParams(search || '').get('tab')
  const q = LEGACY_TAB_MAP[raw] || raw
  return WS_TABS.some(([name]) => name === q) ? q : WS_TABS[0][0]
}

// ① 미설정 상태 — env 2종이 없을 때(백엔드 프로비저닝 전)
export function NotConfigured() {
  return (
    <section className="ws-panel ws-wait">
      <p className="ws-badge">백엔드 연결 대기</p>
      <p className="ws-note">Supabase 프로젝트 미연결 상태 — 로그인 불가.</p>
      <ul className="ws-steps">
        <li>필요 환경변수 2종: <code>VITE_SUPABASE_URL</code> · <code>VITE_SUPABASE_ANON_KEY</code></li>
        <li>프로비저닝 절차: 저장소 <code>supabase/README.md</code></li>
        <li>연결 전에도 공개 페이지는 정상 동작</li>
      </ul>
    </section>
  )
}

// ② 로그인 폼 — 계정 생성 경로 없음(운영진 초대 생성, SPEC §0-4)
// ID = 학번(개정 2026-08-05). '@' 포함 입력 = 이메일 폴백(오너·운영진) — 검증은 통과시키고 서버가 판정한다.
export function LoginForm({ onSubmit, error, busy }) {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [local, setLocal] = useState('')
  function submit(e) {
    e.preventDefault()
    const id = loginId.replace(/[\s　]/g, '')
    if (!id) return setLocal('학번 입력 필요')
    if (!id.includes('@') && !/^[0-9]{4,12}$/.test(id)) return setLocal('학번은 숫자만(4~12자리)')
    setLocal('')
    return onSubmit?.(id, password)
  }
  return (
    <section className="ws-panel">
      <form className="ws-form" onSubmit={submit}>
        <label className="ws-field">
          <span>학번</span>
          <input
            type="text" value={loginId} autoComplete="username" inputMode="numeric" autoFocus
            placeholder="학번(숫자)" required onChange={(e) => setLoginId(e.target.value)}
          />
        </label>
        <label className="ws-field">
          <span>비밀번호</span>
          <input type="password" value={password} autoComplete="current-password" required onChange={(e) => setPassword(e.target.value)} />
        </label>
        {(local || error) && <p className="ws-error" role="alert">{local || error}</p>}
        <button type="submit" className="ws-submit" disabled={busy}>{busy ? '확인 중' : '로그인'}</button>
      </form>
      <p className="ws-note">
        계정 발급 = 운영진 초대 생성(자가입 없음). 문의 = <a href={CONTACT_MAILTO}>{CONTACT.email}</a>.
      </p>
    </section>
  )
}

// ③ 로그인 후 셸(2026-08-06 앱형 재구성) — 문서형(히어로+패널) 폐지, 앱 문법(리서치: Notion·Slack·Classroom):
// 좌 사이드바(고정 232px·sticky) = 라벨 + 탭 + 하단 계정 블록 / 우 콘텐츠 = 남는 폭 전부.
export function Shell({ member, onSignOut, store, onMemberChanged, search }) {
  const [tab, setTab] = useState(() => initialTab(search ?? (typeof window !== 'undefined' ? window.location.search : '')))
  // 방문 탭 keep-alive(2026-08-06 전환 안정화) — 재방문 시 재마운트·재페치·로딩 깜빡임 0. 폼 입력도 유지.
  const [visited, setVisited] = useState(() => new Set([tab]))
  const staff = isStaffRole(member)
  const active = WS_TABS.find(([name]) => name === tab) || WS_TABS[0]

  function go(name) {
    setVisited((prev) => (prev.has(name) ? prev : new Set(prev).add(name)))
    setTab(name)
    if (typeof window !== 'undefined') {
      // 현재 탭을 URL에 반영(2026-08-14 검수) — 새로고침 시 initialTab이 같은 탭으로 복원
      window.history.replaceState(null, '', `?tab=${encodeURIComponent(name)}`)
      window.scrollTo({ top: 0 })   // 이전 탭 스크롤 위치 이월 금지
    }
  }

  // 탭 본문 — visited에 든 탭만 마운트, 비활성은 hidden(display:none)으로 상태 보존.
  function paneOf(name) {
    if (!store) return null
    if (name === '홈') return <Home store={store} member={member} />
    if (name === '로드맵') return <Flow store={store} staff={staff} />
    if (name === '공고') return <Postings store={store} />
    if (name === '인사이트 기고') return <Contribute store={store} />
    if (name === '내정보') return <MyPage store={store} member={member} onProfileSaved={onMemberChanged} />
    // 운영 탭 = 화면 차단(권한 없으면 안내만) + 서버 RLS 이중 방어
    if (name === '운영') return staff ? <Admin store={store} member={member} /> : <Denied />
    return null
  }

  return (
    <div className="ws-shell">
      <nav className="ws-side" aria-label="워크스페이스 기능">
        <p className="ws-side-label">WORKSPACE</p>
        <div className="ws-side-tabs">
          {visibleTabs(member).map(([name]) => (
            <button
              key={name} type="button" aria-current={tab === name ? 'true' : undefined}
              className={`ws-sidebtn${tab === name ? ' on' : ''}`}
              onClick={() => go(name)}
            >
              <TabIcon name={name} />
              <span className="ws-sidebtn-name">{name}</span>
              {/* 폰 하단 탭 바 축약 라벨(모바일 spec §3-1) — 데스크탑은 풀네임 스팬 사용 */}
              <span className="ws-sidebtn-short" aria-hidden="true">{TAB_SHORT[name] || name}</span>
            </button>
          ))}
        </div>
        {/* 계정 블록 = 사이드바 하단(앱 표준 위치 — 구 전폭 밴드 폐지) */}
        <div className="ws-side-me">
          <div>
            <p className="ws-me-name">{member?.이름 || '이름 미등록'}</p>
            <p className="ws-me-role">{member?.role || '스터디원'}</p>
          </div>
          <button type="button" className="ws-signout" onClick={onSignOut}>로그아웃</button>
        </div>
      </nav>

      <div className="ws-content">
        {/* 폰 전용 계정 줄(모바일 spec §3-1) — 사이드바가 하단 탭 바로 내려가면 계정 블록 자리가 없다 */}
        <div className="ws-me-mobile">
          <p className="ws-me-name">{member?.이름 || '이름 미등록'}</p>
          <p className="ws-me-role">{member?.role || '스터디원'}</p>
          <button type="button" className="ws-signout" onClick={onSignOut}>로그아웃</button>
        </div>
        {/* 탭 소형 헤더 — 전 탭 동일(홈 포함, 오너 8/6 4차): 시작 높이·헤어라인이 탭마다 같아야 틀이 안 흔들린다 */}
        <div className="ws-content-head">
          <h1 className="ws-content-title">{active[0]}</h1>
        </div>
        {/* 홈 = 캘린더 + 다가오는 업무 + 과제·공지·세션 흡수(구 제출·스터디 탭) */}
        {[...visited].map((name) => (
          <div key={name} hidden={tab !== name} className="ws-tabpane">{paneOf(name)}</div>
        ))}
      </div>
    </div>
  )
}

export default function Workspace({ repos, configured }) {
  const [store] = useState(() => repos || getRepositories())
  const ready = configured === undefined ? isBackendConfigured() : configured
  const [user, setUser] = useState(() => (ready ? store.auth.currentUser() : null))
  const [member, setMember] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) {
      setMember(null)
      return
    }
    let alive = true
    store.members.me()
      .then((m) => { if (alive) setMember(m) })
      .catch(() => { if (alive) setMember(null) })
    return () => { alive = false }
  }, [store, user])

  async function signIn(loginId, password) {
    setBusy(true)
    setError('')
    try {
      await store.auth.signIn(loginId, password)
      setUser(store.auth.currentUser())
    } catch (e) {
      setError(e?.message || '로그인 실패')
    } finally {
      setBusy(false)
    }
  }

  async function signOut() {
    await store.auth.signOut()
    setUser(null)
  }

  const sub = ready
    ? '스터디 일정·업무 한눈에 + 기고 제출 — 스터디원 전용.'
    : '백엔드 연결 전 — 로그인 기능 대기 상태.'
  const app = ready && Boolean(user)

  // 로그인 전 = 문서형(히어로 헤드 + 좁은 패널) 유지 / 로그인 후 = 앱형 전폭(히어로·패널·푸터 제거).
  return (
    <>
      <SiteNav />
      <main id="main" className={`ws-main${app ? ' ws-app' : ''}`}>
        {/* 로그인 전 헤드 = 공용 PageHead(§3-1 — 자체 head CSS 금지, 2026-08-14 이관) */}
        {!app && <PageHead label="WORKSPACE" title={<>스터디원 <em>작업면</em></>} sub={sub} />}
        {!ready && <NotConfigured />}
        {ready && !user && <LoginForm onSubmit={signIn} error={error} busy={busy} />}
        {app && (
        <Shell member={member} onSignOut={signOut} store={store} onMemberChanged={setMember} />
      )}
      </main>
      {!app && <SiteFooter />}
    </>
  )
}
