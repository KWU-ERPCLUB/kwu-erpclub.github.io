// 흐름 탭(2026-08-06 오너 확정) — 스터디의 주차별 흐름: 저번 주 뭐 했고 · 이번 주 뭐 하고 · 다음 주 뭐 할지.
// 데이터 = flow_weeks(0008, 열람=멤버·쓰기=운영진). 운영진에게만 인라인 등록 폼 노출.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toKey } from './calendar-logic.js'

// 주 판정 — 시작일~+6일 안에 오늘이 있으면 '이번 주', 지났으면 '지난', 아니면 '예정'. 순수 함수(테스트 대상).
export function weekStatus(startKey, todayKey) {
  const start = new Date(`${startKey}T12:00:00`)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const endKey = toKey(end)
  if (todayKey < startKey) return '예정'
  if (todayKey > endKey) return '지난'
  return '이번 주'
}

const STATUS_CLASS = { '이번 주': 'now', 지난: 'past', 예정: 'next' }

function WeekCard({ row, todayKey, staff, onRemove }) {
  const status = weekStatus(row['시작일'], todayKey)
  return (
    <li className={`ws-flow-card ${STATUS_CLASS[status]}`}>
      <div className="ws-flow-head">
        <span className="ws-flow-week">{row['주차']}</span>
        <span className={`ws-flow-status ${STATUS_CLASS[status]}`}>{status}</span>
        <span className="ws-mark-meta">{row['시작일']} 주</span>
        {staff && (
          <div className="ws-row-acts">
            <button type="button" onClick={() => onRemove(row.id)}>삭제</button>
          </div>
        )}
      </div>
      <p className="ws-flow-title">{row['제목']}</p>
      {row['내용'] && <p className="ws-flow-body">{row['내용']}</p>}
    </li>
  )
}

// 운영진 인라인 등록 폼 — 흐름은 가벼운 기록이라 운영 탭 왕복 없이 이 자리에서 쓴다.
function FlowForm({ store, onSaved }) {
  const [form, setForm] = useState({ 주차: '', 시작일: '', 제목: '', 내용: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function save(e) {
    e.preventDefault()
    if (!form['주차'].trim() || !form['시작일'] || !form['제목'].trim()) { setError('주차·시작일·제목 필수'); return }
    setBusy(true)
    setError('')
    try {
      await store.flow.save(form)
      setForm({ 주차: '', 시작일: '', 제목: '', 내용: '' })
      onSaved?.()
    } catch (err) {
      setError(err?.message || '저장 실패 — 마이그레이션 0008 적용 여부 확인')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="ws-form ws-form-wide ws-flow-form" onSubmit={save}>
      <h3 className="ws-h3">주차 기록 추가 (운영진)</h3>
      <div className="ws-field-row">
        <label className="ws-field"><span>주차 표기</span><input value={form['주차']} placeholder="9월 2주" onChange={set('주차')} /></label>
        <label className="ws-field"><span>시작일(월요일)</span><input type="date" value={form['시작일']} onChange={set('시작일')} /></label>
      </div>
      <label className="ws-field"><span>그 주의 한 줄</span><input value={form['제목']} placeholder="킥오프 — 개인 주제 확정" onChange={set('제목')} /></label>
      <label className="ws-field"><span>세부(선택 — 줄바꿈 유지)</span><textarea className="ws-textarea" rows={3} value={form['내용']} onChange={set('내용')} /></label>
      {error && <p className="ws-error" role="alert">{error}</p>}
      <div className="ws-form-acts">
        <button type="submit" className="ws-submit" disabled={busy}>{busy ? '저장 중' : '기록 추가'}</button>
      </div>
    </form>
  )
}

export default function Flow({ store, staff }) {
  const todayKey = useMemo(() => toKey(new Date()), [])
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const load = useCallback(() => store.flow.list()
    .then((r) => { setRows(r || []); setStatus('ready') })
    .catch((e) => { setError(e?.message || '불러오기 실패'); setStatus('error') }), [store])

  useEffect(() => { load() }, [load])

  async function remove(id) {
    try {
      await store.flow.remove(id)
      await load()
    } catch (e) {
      setError(e?.message || '삭제 실패')
    }
  }

  return (
    <div className="ws-flow">
      <section className="ws-block">
        <h2 className="ws-h2">스터디 흐름 <span className="ws-count">{rows.length}</span></h2>
        <p className="ws-note">주 단위 진행 기록 — 지난 주에 한 것·이번 주에 하는 것·다음 주에 할 것.</p>
        {status === 'loading' && <div className="ws-skel" aria-label="불러오는 중"><span /><span /></div>}
        {error && <p className="ws-error" role="alert">{error}</p>}
        {status === 'ready' && rows.length === 0 && <p className="ws-note">기록 0건 — 운영진이 주차 기록을 추가하면 여기 쌓임.</p>}
        <ul className="ws-list ws-flow-list">
          {rows.map((r) => <WeekCard key={r.id} row={r} todayKey={todayKey} staff={staff} onRemove={remove} />)}
        </ul>
      </section>
      {staff && <FlowForm store={store} onSaved={load} />}
    </div>
  )
}
