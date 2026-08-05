// 워크스페이스 셸(M1) — 로그인 + 기능 자리표시. 데이터는 전부 저장소 계층 경유(SPEC §1, P1).
// 공개 6페이지와 코드·CSS를 공유하지 않는다(styles/workspace.css 별도). 공개 내비에 링크 없음(URL 직접 진입).
import { useEffect, useState } from 'react'
import { SiteNav, SiteFooter } from '../shared.jsx'
import { getRepositories, isBackendConfigured } from '../data/index.js'

// M3에서 채울 기능 탭 — [이름, 한 줄 설명]. M1에서는 전부 '준비 중'.
export const WS_TABS = [
  ['세션', '회차·자료 열람'],
  ['과제', '링크 제출·내 제출 확인'],
  ['공지', '내부 공지·운영 로그'],
  ['컬렉션', '개인 스크랩·북마크'],
]

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
export function LoginForm({ onSubmit, error, busy }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  return (
    <section className="ws-panel">
      <form
        className="ws-form"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit?.(email, password)
        }}
      >
        <label className="ws-field">
          <span>이메일</span>
          <input type="email" value={email} autoComplete="username" required onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="ws-field">
          <span>비밀번호</span>
          <input type="password" value={password} autoComplete="current-password" required onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="ws-error" role="alert">{error}</p>}
        <button type="submit" className="ws-submit" disabled={busy}>{busy ? '확인 중' : '로그인'}</button>
      </form>
      <p className="ws-note">계정 발급 = 운영진 초대 생성(자가입 없음). 문의 = 단톡방.</p>
    </section>
  )
}

// ③ 로그인 후 셸 — 멤버 이름·역할 + 기능 탭 자리표시
export function Shell({ member, onSignOut }) {
  return (
    <section className="ws-panel">
      <div className="ws-me">
        <div>
          <p className="ws-me-name">{member?.이름 || '이름 미등록'}</p>
          <p className="ws-me-role">{member?.role || '스터디원'}</p>
        </div>
        <button type="button" className="ws-signout" onClick={onSignOut}>로그아웃</button>
      </div>
      <ul className="ws-tabs">
        {WS_TABS.map(([name, desc]) => (
          <li key={name} className="ws-tab">
            <p className="ws-tab-name">{name}</p>
            <p className="ws-tab-desc">{desc}</p>
            <span className="status prep">준비 중</span>
          </li>
        ))}
      </ul>
      <p className="ws-note">기능 탑재 = M3 범위. 지금은 로그인·프로필 확인만.</p>
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

  async function signIn(email, password) {
    setBusy(true)
    setError('')
    try {
      await store.auth.signIn(email, password)
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
    ? '세션·과제·공지·컬렉션 — 스터디원 전용. 공개 페이지와 분리.'
    : '백엔드 연결 전 — 로그인 기능 대기 상태.'

  return (
    <>
      <SiteNav />
      <main className="ws-main">
        <PageHead sub={sub} />
        {!ready && <NotConfigured />}
        {ready && !user && <LoginForm onSubmit={signIn} error={error} busy={busy} />}
        {ready && user && <Shell member={member} onSignOut={signOut} />}
      </main>
      <SiteFooter />
    </>
  )
}
