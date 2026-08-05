// 운영 탭 — 멤버 관리(M3 ②). 명단(이름·학번·role·가입일) + 전공(member_private, 운영진만 RLS 통과) + 역할 변경.
// 초대(계정 생성)는 여기서 불가 — auth admin API가 service key를 요구한다(§1 키 규칙: 클라이언트엔 anon key만).
// 따라서 화면에는 절차 안내만 둔다(원천 = supabase/README.md 3단계·3-1단계).
import { useCallback, useEffect, useState } from 'react'

const ROLES = ['운영진', '스터디원']

export default function AdminMembers({ store, meId }) {
  const [rows, setRows] = useState([])
  const [majors, setMajors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')

  const load = useCallback(() => Promise.all([store.members.list(), store.members.listPrivate()])
    .then(([list, priv]) => {
      setRows(list || [])
      setMajors(Object.fromEntries((priv || []).map((p) => [p.member_id, p['전공']])))
    })
    .catch((e) => setError(e?.message || '불러오기 실패')), [store])

  useEffect(() => { load() }, [load])

  async function changeRole(id, role) {
    setBusy(id)
    setError('')
    try {
      await store.members.setRole(id, role)
      await load()
    } catch (e) {
      setError(e?.message || '역할 변경 실패')
    } finally {
      setBusy('')
    }
  }

  return (
    <section className="ws-block">
      <h3 className="ws-h3">멤버 <span className="ws-count">{rows.length}</span></h3>
      {error && <p className="ws-error" role="alert">{error}</p>}
      <div className="ws-tablewrap">
        <table className="ws-table">
          <thead>
            <tr><th>이름</th><th>학번</th><th>전공</th><th>가입일</th><th>역할</th></tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id}>
                <td>{m['이름']}</td>
                <td>{m['학번'] || '—'}</td>
                <td>{majors[m.id] || '—'}</td>
                <td>{m['가입일'] || '—'}</td>
                <td>
                  <select
                    aria-label={`${m['이름']} 역할`}
                    value={m.role}
                    disabled={busy === m.id || m.id === meId}
                    onChange={(e) => changeRole(m.id, e.target.value)}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="ws-note">멤버 0건.</p>}
      <p className="ws-note">본인 역할은 변경 대상 아님 — 운영진 0명 상태를 만들지 않기 위함.</p>

      <h3 className="ws-h3">계정 초대</h3>
      <ul className="ws-steps">
        <li>앱에서 계정 생성 불가 — auth admin API = service key 필요(클라이언트에는 anon key만 둔다)</li>
        <li>절차 원천 = 저장소 <code>supabase/README.md</code> 3단계(운영진)·3-1단계(학번 계정)</li>
        <li>요약: Authentication &gt; Users &gt; Add user(<code>s&lt;학번&gt;@member.erpclub</code>, Auto Confirm)
          → UID 복사 → SQL Editor에서 <code>members</code> insert(이름·role·학번)</li>
        <li>전공은 <code>member_private</code>에 별도 insert — 운영진만 열람</li>
      </ul>
    </section>
  )
}
