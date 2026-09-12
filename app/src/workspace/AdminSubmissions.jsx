// 운영 제출 현황(2026-08-06 워크스페이스 재구성) — 멤버×과제 배지 매트릭스(Canvas Gradebook 문법).
// 10~20명 규모 = 한 화면에 전원이 들어가는 표가 최적(리서치 D). 데이터 = submissions.listAll(RLS 운영진 전원 열람).
// 2026-09-13 과제 3종: 링크형은 원문으로 나가고, 폼·체크리스트형은 답을 표 아래 패널에서 편다(0025 답변 jsonb).
import { useCallback, useEffect, useState } from 'react'
import { kindOf, formOf } from '../data/assignment-forms.js'
import { progressOf, isSubmitted } from './assignments-logic.js'

// 셀 판정 — 제출 행이 있으면 링크 배지, 없으면 미제출. 순수 함수(테스트 대상).
export function cellOf(subs, memberId, assignmentId) {
  return subs.find((s) => s.member_id === memberId && s.assignment_id === assignmentId) || null
}

// 제출률 — 과제 1건 기준 제출로 인정된 멤버 수 / 전체 멤버 수.
// 체크리스트형은 "행이 있다"가 아니라 "전 항목 체크"가 제출이다(assignments-logic isSubmitted).
export function rateOf(subs, members, assignment) {
  if (members.length === 0) return '0/0'
  const row = typeof assignment === 'string' ? { id: assignment } : assignment
  const n = members.filter((m) => isSubmitted(row, cellOf(subs, m.id, row.id))).length
  return `${n}/${members.length}`
}

// 셀 표기 — 링크형 = 원문으로 나가는 배지 / 폼·체크리스트형 = 답 패널을 여는 배지.
function Cell({ row, sub, onOpen }) {
  if (!sub) return <span className="ws-cell-miss">미제출</span>
  const kind = kindOf(row)
  if (kind === '링크') {
    return sub.url
      ? <a className="ws-cell-done" href={sub.url} target="_blank" rel="noreferrer">낸 문서 열기</a>
      : <span className="ws-cell-miss">미제출</span>
  }
  if (kind === '체크리스트') {
    const { done, total } = progressOf(formOf(row), sub)
    return (
      <button type="button" className={`ws-cell-done${done === total ? '' : ' part'}`} onClick={() => onOpen({ row, sub })}>
        {done}/{total}
      </button>
    )
  }
  return <button type="button" className="ws-cell-done" onClick={() => onOpen({ row, sub })}>답 보기</button>
}

// 답 패널 — 표 아래에서 한 사람의 답을 펼친다(새 창·모달 없이).
function AnswerPanel({ open, memberName, onClose }) {
  if (!open) return null
  const { row, sub } = open
  const form = formOf(row)
  const answer = sub['답변'] || {}
  const lines = kindOf(row) === '체크리스트'
    ? (form?.items || []).map((it) => [it.label, answer[it.key] ? '완료' : '아직'])
    : (form?.fields || []).map((f) => [f.label, String(answer[f.key] ?? '').trim() || '빈칸'])
  return (
    <section className="ws-block ws-answers">
      <div className="ws-row-top">
        <h3 className="ws-h3">{memberName} · {row['제목']}</h3>
        <button type="button" className="ws-modal-x" onClick={onClose} aria-label="닫기">×</button>
      </div>
      <dl className="md-info">
        {lines.map(([k, v]) => <div className="md-info-row" key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
    </section>
  )
}

export default function AdminSubmissions({ store }) {
  const [members, setMembers] = useState([])
  const [assignments, setAssignments] = useState([])
  const [subs, setSubs] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [open, setOpen] = useState(null)      // 답 패널 대상 { row, sub }

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
      <p className="ws-note">행 = 멤버 · 열 = 과제. 배지 클릭 = 낸 것 보기. 하단 = 과제별 제출률.</p>
      {status === 'loading' && <div className="ws-skel" aria-label="불러오는 중"><span /><span /></div>}
      {error && <p className="ws-error" role="alert">{error}</p>}
      {status === 'ready' && assignments.length === 0 && <p className="ws-note">등록된 과제 0건. 콘텐츠 영역에서 과제 등록.</p>}
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
                  {assignments.map((a) => (
                    <td key={a.id}>
                      <Cell
                        row={a} sub={cellOf(subs, m.id, a.id)}
                        onOpen={(x) => setOpen({ ...x, name: m['이름'] })}
                      />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="ws-matrix-rate">
                <th scope="row">제출률</th>
                {assignments.map((a) => <td key={a.id}>{rateOf(subs, members, a)}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <AnswerPanel open={open} memberName={open?.name} onClose={() => setOpen(null)} />
    </section>
  )
}
