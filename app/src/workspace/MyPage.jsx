// 내정보 탭(M3 ① → 홈 개편 2026-08-06 → 2026-08-14 재편) — 상단 = 자주 볼 것(북마크·관심 공고),
// 하단 = 가끔 볼 것(프로필 수정·비밀번호 변경 = 접힘). 오너 2026-08-14: "자주 안 볼 설정은 숨기고 관심 콘텐츠를 잘 보이게".
// 수정 가능 범위 = 자기소개·관심사(이름·학번·role은 운영진이 관리 — RLS members_update_self가 role 변경을 거부).
import { useCallback, useEffect, useMemo, useState } from 'react'
import Collections from './Collections.jsx'
import { toKey, dday, daysBetween } from './calendar-logic.js'
import { postingStatus } from './postings-logic.js'

const toText = (list) => (Array.isArray(list) ? list.join(', ') : String(list || ''))
const toList = (text) => String(text || '').split(',').map((v) => v.trim()).filter(Boolean).slice(0, 8)

// 읽기 전용 신원 3칸 + 수정 가능 2칸
function Profile({ store, member, onSaved }) {
  const [intro, setIntro] = useState(member?.['자기소개'] || '')
  const [tags, setTags] = useState(toText(member?.['관심사']))
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const row = await store.members.updateMe({ 자기소개: intro, 관심사: toList(tags) })
      setMsg('저장 완료')
      onSaved?.(row)
    } catch (err) {
      setError(err?.message || '저장 실패')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="ws-block">
      <h2 className="ws-h2">프로필</h2>
      <dl className="ws-facts">
        <div><dt>이름</dt><dd>{member?.['이름'] || '미등록'}</dd></div>
        <div><dt>학번</dt><dd>{member?.['학번'] || '미등록'}</dd></div>
        <div><dt>역할</dt><dd>{member?.role || '스터디원'}</dd></div>
      </dl>
      <form className="ws-form ws-form-wide" onSubmit={save}>
        <label className="ws-field">
          <span>자기소개</span>
          <textarea className="ws-textarea" rows={3} value={intro} onChange={(e) => setIntro(e.target.value)} />
        </label>
        <label className="ws-field">
          <span>관심사(쉼표로 구분·최대 8개)</span>
          <input value={tags} placeholder="자동화, 에이전트" onChange={(e) => setTags(e.target.value)} />
        </label>
        {error && <p className="ws-error" role="alert">{error}</p>}
        {msg && <p className="ws-ok" role="status">{msg}</p>}
        <div className="ws-form-acts">
          <button type="submit" className="ws-submit" disabled={busy}>{busy ? '저장 중' : '프로필 저장'}</button>
        </div>
      </form>
    </section>
  )
}

// 비밀번호 변경(2026-08-07) — 로그인 상태에서 본인이 직접(메일 불필요). 초기 비밀번호는 운영진이 공통 임시값으로
// 발급(supabase/README.md 3-1) → 첫 로그인 후 여기서 변경. 잊으면 운영진 재설정(셀프 "찾기"는 비범위).
export function PasswordChange({ store }) {
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function save(e) {
    e.preventDefault()
    setMsg('')
    if (pw.length < 6) return setError('비밀번호는 6자 이상')
    if (pw !== pw2) return setError('두 입력이 다름 — 같은 값 입력')
    setError('')
    setBusy(true)
    try {
      await store.auth.updatePassword(pw)
      setMsg('비밀번호 변경됨 — 다음 로그인부터 새 값 사용')
      setPw('')
      setPw2('')
    } catch (err) {
      setError(err?.message || '변경 실패')
    } finally {
      setBusy(false)
    }
    return undefined
  }

  return (
    <section className="ws-block">
      <h2 className="ws-h2">비밀번호 변경</h2>
      <p className="ws-note">초기(임시) 비밀번호를 받았다면 여기서 본인 값으로 변경. 잊어버린 경우 = 운영진에게 재설정 요청.</p>
      <form className="ws-form ws-form-wide" onSubmit={save}>
        <div className="ws-field-row">
          <label className="ws-field">
            <span>새 비밀번호(6자 이상)</span>
            <input type="password" value={pw} autoComplete="new-password" onChange={(e) => setPw(e.target.value)} />
          </label>
          <label className="ws-field">
            <span>새 비밀번호 확인</span>
            <input type="password" value={pw2} autoComplete="new-password" onChange={(e) => setPw2(e.target.value)} />
          </label>
        </div>
        {error && <p className="ws-error" role="alert">{error}</p>}
        {msg && <p className="ws-ok" role="status">{msg}</p>}
        <div className="ws-form-acts">
          <button type="submit" className="ws-submit" disabled={busy}>{busy ? '변경 중' : '비밀번호 변경'}</button>
        </div>
      </form>
    </section>
  )
}

// 관심 공고(0013) — 공고 탭에서 ★ 체크한 것만 마감 임박순으로. 체크·해제 = 공고 탭에서.
export function InterestedPostings({ store }) {
  const todayKey = useMemo(() => toKey(new Date()), [])
  const [rows, setRows] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    Promise.all([store.postings.list(), store.postings.listInterests()])
      .then(([all, ids]) => {
        if (!alive) return
        const mine = (all || []).filter((r) => (ids || []).includes(r.id))
        // 마감 임박순(마감·시험일 없는 상시는 뒤로), 마감 지난 것은 맨 뒤
        const due = (r) => r['접수마감'] || r['시험일'] || '9999-12-31'
        mine.sort((a, b) => {
          const ac = postingStatus(a, todayKey) === '마감' ? 1 : 0
          const bc = postingStatus(b, todayKey) === '마감' ? 1 : 0
          return ac - bc || due(a).localeCompare(due(b))
        })
        setRows(mine)
        setReady(true)
      })
      .catch(() => setReady(true))
    return () => { alive = false }
  }, [store, todayKey])

  return (
    <section className="ws-block ws-interested">
      <h2 className="ws-h2">관심 공고 <span className="ws-count">{rows.length}</span></h2>
      {ready && rows.length === 0 && <p className="ws-note">관심 공고 0건 — 공고 탭에서 ★를 누르면 여기 모인다.</p>}
      <ul className="ws-list">
        {rows.map((r) => {
          const due = r['접수마감'] || r['시험일']
          const closed = postingStatus(r, todayKey) === '마감'
          return (
            <li key={r.id}>
              <a className="ws-up-item" href={r.url} target="_blank" rel="noreferrer" style={closed ? { opacity: 0.55 } : undefined}>
                <span className="ws-up-title">{r['제목']}</span>
                {due && <span className="ws-up-when">{due.slice(5).replace('-', '/')}</span>}
                {due && !closed && (
                  <span className={`ws-up-dday${daysBetween(todayKey, due) <= 7 ? ' soon' : ''}`}>{dday(todayKey, due)}</span>
                )}
                {(!due || closed) && <span className="ws-up-dday">{closed ? '마감' : '상시'}</span>}
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// 내 기고 + 내 과제 제출 — 상태만 확인하는 읽기 목록(수정은 각 탭에서)
function Activity({ articles, submissions, assignments }) {
  const titleOf = (id) => assignments.find((a) => a.id === id)?.['제목'] || '(삭제된 과제)'
  return (
    <section className="ws-block">
      <h2 className="ws-h2">활동내역</h2>
      <h3 className="ws-h3">내 기고 <span className="ws-count">{articles.length}</span></h3>
      {articles.length === 0 && <p className="ws-note">기고 0건 — 기고 탭에서 작성.</p>}
      <ul className="ws-list">
        {articles.map((a) => (
          <li key={a.id} className="ws-scrap">
            <div className="ws-row-top">
              <span className="ws-row-title">{a['제목']}</span>
              <span className={`status ${a['상태'] === '게재' ? 'done' : 'prep'}`}>{a['상태']}</span>
              <span className="ws-mark-meta">{a['게재일'] || ''}</span>
            </div>
          </li>
        ))}
      </ul>

      <h3 className="ws-h3">내 과제 제출 <span className="ws-count">{submissions.length}</span></h3>
      {submissions.length === 0 && <p className="ws-note">제출 0건 — 홈의 과제 섹션에서 링크 제출.</p>}
      <ul className="ws-list">
        {submissions.map((s) => (
          <li key={s.id} className="ws-scrap">
            <div className="ws-row-top">
              <span className="ws-row-title">{titleOf(s.assignment_id)}</span>
              <a className="ws-mark-meta" href={s.url} target="_blank" rel="noreferrer">제출 링크</a>
            </div>
            {s['메모'] && <p className="ws-scrap-memo">{s['메모']}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function MyPage({ store, member, onProfileSaved }) {
  const [articles, setArticles] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [assignments, setAssignments] = useState([])
  const [error, setError] = useState('')

  const load = useCallback(() => Promise.all([
    store.articles.listMine(),
    store.submissions.listMine(),
    store.assignments.list(),
  ]).then(([a, s, h]) => {
    setArticles(a || [])
    setSubmissions(s || [])
    setAssignments(h || [])
  }).catch((e) => setError(e?.message || '불러오기 실패')), [store])

  useEffect(() => { load() }, [load])

  // 공통 프레임(ws-cols): 본문 = 북마크·관심 공고(자주 볼 것) + 접힘 설정(가끔 볼 것) / 레일 = 활동내역(읽기).
  return (
    <div className="ws-mypage ws-cols">
      <div className="ws-cmain">
        {error && <p className="ws-error" role="alert">{error}</p>}
        <Collections store={store} />
        <InterestedPostings store={store} />
        {/* 설정 = 접힘(2026-08-14 오너 — 자주 확인 안 할 내용은 숨김) */}
        <section className="ws-block">
          <details className="ws-settings">
            <summary>프로필 수정</summary>
            {/* key = 멤버 로드 완료 시 폼 초기값을 다시 잡기 위함(비동기 도착) */}
            <Profile key={member?.id || 'pending'} store={store} member={member} onSaved={onProfileSaved} />
          </details>
          <details className="ws-settings">
            <summary>비밀번호 변경</summary>
            <PasswordChange store={store} />
          </details>
        </section>
      </div>
      <aside className="ws-crail">
        <Activity articles={articles} submissions={submissions} assignments={assignments} />
      </aside>
    </div>
  )
}
