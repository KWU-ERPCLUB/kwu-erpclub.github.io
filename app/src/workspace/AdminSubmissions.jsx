// 운영 제출 현황(2026-08-06 워크스페이스 재구성) — 멤버×과제 배지 매트릭스(Canvas Gradebook 문법).
// 10~20명 규모 = 한 화면에 전원이 들어가는 표가 최적(리서치 D). 데이터 = submissions.listAll(RLS 운영진 전원 열람).
import { useCallback, useEffect, useState } from 'react'

// 셀 판정 — 제출 행이 있으면 링크 배지, 없으면 미제출. 순수 함수(테스트 대상).
export function cellOf(subs, memberId, assignmentId) {
  return subs.find((s) => s.member_id === memberId && s.assignment_id === assignmentId) || null
}

// 제출률 — 과제 1건 기준 제출 멤버 수 / 전체 멤버 수.
export function rateOf(subs, members, assignmentId) {
  if (members.length === 0) return '0/0'
  const n = members.filter((m) => cellOf(subs, m.id, assignmentId)).length
  return `${n}/${members.length}`
}

export default function AdminSubmissions({ store }) {
  const [members, setMembers] = useState([])
  const [assignments, setAssignments] = useState([])
  const [subs, setSubs] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const load = useCallback(() => Promise.all([
    store.members.list(),
    store.assignments.list(),
    store.submissions.listAll(),
  ]).then(([m, a, s]) => {
    setMembers(m || [])
    setAssignments(a || [])
    setSubs(s || [])
    setStatus('ready')
  }).catch((e) => { setError(e?.message || '불러오기 실패'); setStatus('error') }), [store])

  useEffect(() => { load() }, [load])

  return (
    <section className="ws-block">
      <h2 className="ws-h2">제출 현황 <span className="ws-count">{assignments.length}</span></h2>
      <p className="ws-note">행 = 멤버 · 열 = 과제. 배지 클릭 = 제출물 열기. 하단 = 과제별 제출률.</p>
      {status === 'loading' && <p className="ws-note">불러오는 중</p>}
      {error && <p className="ws-error" role="alert">{error}</p>}
      {status === 'ready' && assignments.length === 0 && <p className="ws-note">등록된 과제 0건 — 콘텐츠 영역에서 과제 등록.</p>}
      {status === 'ready' && assignments.length > 0 && (
        <div className="ws-tablewrap">
          <table className="ws-table ws-matrix">
            <thead>
              <tr>
                <th scope="col">멤버</th>
                {assignments.map((a) => <th scope="col" key={a.id}>{a['제목']}</th>)}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <th scope="row">{m['이름']}</th>
                  {assignments.map((a) => {
                    const sub = cellOf(subs, m.id, a.id)
                    return (
                      <td key={a.id}>
                        {sub
                          ? <a className="ws-cell-done" href={sub.url} target="_blank" rel="noreferrer">제출</a>
                          : <span className="ws-cell-miss">미제출</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr className="ws-matrix-rate">
                <th scope="row">제출률</th>
                {assignments.map((a) => <td key={a.id}>{rateOf(subs, members, a.id)}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
