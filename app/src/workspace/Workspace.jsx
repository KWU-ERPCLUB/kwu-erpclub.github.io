// 워크스페이스 셸(M1) — 로그인 + 기능 자리표시. 데이터는 전부 저장소 계층 경유(SPEC §1, P1).
// 공개 6페이지와 코드·CSS를 공유하지 않는다(styles/workspace.css 별도). 공개 내비에 링크 없음(URL 직접 진입).
import { useEffect, useState } from 'react'
import { SiteNav, SiteFooter } from '../shared.jsx'
import { getRepositories, isBackendConfigured } from '../data/index.js'
import Contribute from './Contribute.jsx'
import MyPage from './MyPage.jsx'
import Sessions from './Sessions.jsx'
import Assignments from './Assignments.jsx'
import Notices from './Notices.jsx'
import Admin, { Denied } from './Admin.jsx'

// 기능 탭 — [이름, 한 줄 설명, 접근]. 접근 'staff' = 운영진에게만 노출(M3 ④).
// 접수창구 4탭(spec 2026-08-05-워크스페이스-개편 §1) — 첫 화면 = 제출(로그인 직후 "낼 것"이 보인다).
export const WS_TABS = [
  ['제출', '기고·과제 제출과 상태 확인'],
  ['스터디', '공지·세션 일정·운영 기록 — 읽기 전용'],
  ['내정보', '프로필·활동내역·북마크·스크랩'],
  ['운영', '승인대기·멤버·콘텐츠 관리', 'staff'],
]

// 구 6탭 딥링크 호환(§1 W3) — 구 탭명 진입 시 새 탭으로 매핑(링크 깨짐 0).
const LEGACY_TAB_MAP = { 기고: '제출', 과제: '제출', 공지: '스터디', 세션: '스터디' }

export const isStaffRole = (member) => member?.role === '운영진'
export const visibleTabs = (member) => WS_TABS.filter(([, , only]) => only !== 'staff' || isStaffRole(member))

// 직접 진입(/workspace/?tab=운영) 지원 — 권한 없는 탭이면 셸이 안내 화면을 그린다(이중 차단의 화면 쪽).
// 알 수 없는 값 = 첫 화면(제출).
export function initialTab(search) {
  const raw = new URLSearchParams(search || '').get('tab')
  const q = LEGACY_TAB_MAP[raw] || raw
  return WS_TABS.some(([name]) => name === q) ? q : WS_TABS[0][0]
}

function PageHead({ sub }) {
  return (
    <div className="ws-head">
      <p className="ws-eyebrow">WORKSPACE</p>
      <h1 className="ws-h1">스터디원 <em>작업면</em></h1>
      <p className="ws-lead">{sub}</p>
    </div>
  )
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
            type="text" value={loginId} autoComplete="username" inputMode="numeric"
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
      <p className="ws-note">계정 발급 = 운영진 초대 생성(자가입 없음). 문의 = 단톡방.</p>
    </section>
  )
}

// ③ 로그인 후 셸 — 멤버 이름·역할 + 기능 탭. 활성 탭만 패널을 그린다.
export function Shell({ member, onSignOut, store, onMemberChanged, search }) {
  const [tab, setTab] = useState(() => initialTab(search ?? (typeof window !== 'undefined' ? window.location.search : '')))
  const staff = isStaffRole(member)
  return (
    <section className="ws-panel">
      <div className="ws-me">
        <div>
          <p className="ws-me-name">{member?.이름 || '이름 미등록'}</p>
          <p className="ws-me-role">{member?.role || '스터디원'}</p>
        </div>
        <button type="button" className="ws-signout" onClick={onSignOut}>로그아웃</button>
      </div>

      <nav className="ws-tabbar" aria-label="워크스페이스 기능">
        {visibleTabs(member).map(([name, desc]) => (
          <button
            key={name} type="button" aria-pressed={tab === name} title={desc}
            className={`ws-tabbtn${tab === name ? ' on' : ''}`}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </nav>

      {/* 제출 = 기고 + 과제 조립(§1 — 기고 먼저) · 스터디 = 공지(운영 기록 포함) + 세션 조립(읽기 전용) */}
      {store && tab === '제출' && (
        <>
          <Contribute store={store} />
          <Assignments store={store} />
        </>
      )}
      {store && tab === '스터디' && (
        <>
          <Notices store={store} />
          <Sessions store={store} />
        </>
      )}
      {store && tab === '내정보' && <MyPage store={store} member={member} onProfileSaved={onMemberChanged} />}
      {/* 운영 탭 = 화면 차단(권한 없으면 안내만) + 서버 RLS 이중 방어 */}
      {store && tab === '운영' && (staff ? <Admin store={store} member={member} /> : <Denied />)}
    </section>
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
    ? '기고·과제 제출과 스터디 공지 확인 — 스터디원 전용.'
    : '백엔드 연결 전 — 로그인 기능 대기 상태.'

  return (
    <>
      <SiteNav />
      <main className="ws-main">
        <PageHead sub={sub} />
        {!ready && <NotConfigured />}
        {ready && !user && <LoginForm onSubmit={signIn} error={error} busy={busy} />}
        {ready && user && (
        <Shell member={member} onSignOut={signOut} store={store} onMemberChanged={setMember} />
      )}
      </main>
      <SiteFooter />
    </>
  )
}
