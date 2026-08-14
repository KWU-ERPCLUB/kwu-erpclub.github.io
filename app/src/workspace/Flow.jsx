// 로드맵 탭(구 흐름 탭 — 2026-08-06 오너 확정 · 2026-08-13 로드맵 진입점 개편 · 2026-08-14 개명) — 로드맵의 차시를 고르면 세부·자료·세미나로 이어진다.
// 구성 = 1기 로드맵(클릭형 — 구 「차시 진행」 흡수, Roadmap.jsx) → 주차 기록(flow_weeks 유지).
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toKey, weekStatus } from './calendar-logic.js'
import RoadmapSection, { STATUS_CLASS } from './Roadmap.jsx'

export { weekStatus }   // 테스트·외부 소비 호환(정의는 calendar-logic.js로 이동 — 2026-08-13)

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

  // 공통 프레임(ws-cols): 본문 = 주차 카드 목록 / 레일 = 운영진 기록 폼(멤버는 안내).
  return (
    <div className="ws-flow ws-cols">
      <div className="ws-cmain">
        <RoadmapSection store={store} todayKey={todayKey} />
        <section className="ws-block">
          <h2 className="ws-h2">주차 기록 <span className="ws-count">{rows.length}</span></h2>
          <p className="ws-note">주 단위 진행 기록 — 지난 주에 한 것·이번 주에 하는 것·다음 주에 할 것.</p>
          {status === 'loading' && <div className="ws-skel" aria-label="불러오는 중"><span /><span /></div>}
          {error && <p className="ws-error" role="alert">{error}</p>}
          {status === 'ready' && rows.length === 0 && <p className="ws-note">기록 0건 — 운영진이 주차 기록을 추가하면 여기 쌓임.</p>}
          <ul className="ws-list ws-flow-list">
            {rows.map((r) => <WeekCard key={r.id} row={r} todayKey={todayKey} staff={staff} onRemove={remove} />)}
          </ul>
        </section>
      </div>
      <aside className="ws-crail">
        {staff
          ? <FlowForm store={store} onSaved={load} />
          : <p className="ws-note">기록 작성 = 운영진 — 열람 전용.</p>}
      </aside>
    </div>
  )
}
