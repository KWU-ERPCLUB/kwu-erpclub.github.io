// 운영 탭 — 지원자 열람(/recruit 신청 폼 접수분, 0006). 읽기 전용 — 수정·삭제 경로 없음(DELETABLE 불변).
// 서버 차단 = RLS applications_manage_staff(운영진만 select) — 비운영진이 불러도 0행.
import { useEffect, useState } from 'react'

const COLS = ['이름', '학번', '전공', '전화번호', '써본ai', '관심주제']

export default function AdminApplicants({ store }) {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    store.applications.list()
      .then((list) => { if (alive) setRows(list || []) })
      .catch((e) => { if (alive) setError(e?.message || '불러오기 실패') })
    return () => { alive = false }
  }, [store])

  return (
    <section className="ws-block">
      <h3 className="ws-h3">지원자 <span className="ws-count">{rows.length}</span></h3>
      {error && <p className="ws-error" role="alert">{error}</p>}
      <div className="ws-tablewrap">
        <table className="ws-table">
          <thead>
            <tr>
              <th>이름</th><th>학번</th><th>전공</th><th>전화번호</th><th>써본 AI</th><th>관심 주제</th><th>제출일</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                {COLS.map((c) => <td key={c}>{r[c] || '—'}</td>)}
                <td>{String(r.created_at || '').slice(0, 10) || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && !error && <p className="ws-note">지원자 0건.</p>}
      <p className="ws-note">읽기 전용 — 수정·삭제 없음. 접수 경로 = /recruit 신청 폼(익명 제출).</p>
    </section>
  )
}
