// 내정보 탭(M3 ① → 홈 개편 2026-08-06) — 프로필·활동내역. 북마크·스크랩은 북마크 탭으로 분리.
// 수정 가능 범위 = 자기소개·관심사(이름·학번·role은 운영진이 관리 — RLS members_update_self가 role 변경을 거부).
import { useCallback, useEffect, useState } from 'react'

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

  return (
    <div className="ws-mypage">
      {error && <p className="ws-error" role="alert">{error}</p>}
      {/* key = 멤버 로드 완료 시 폼 초기값을 다시 잡기 위함(비동기 도착) */}
      <Profile key={member?.id || 'pending'} store={store} member={member} onSaved={onProfileSaved} />
      <Activity articles={articles} submissions={submissions} assignments={assignments} />
    </div>
  )
}
