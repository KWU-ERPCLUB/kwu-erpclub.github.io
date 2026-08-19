// 운영 > 일정(0007) — 홈 캘린더에 뜨는 운영 일정 등록·삭제(운영진 전용, RLS events_write_staff).
// 테이블 미적용(마이그레이션 0007 전)이면 저장이 실패한다 — 오류를 그대로 보여 적용 필요를 알린다.
import { useCallback, useEffect, useState } from 'react'

// 캘린더 색 = 두 갈래로만 갈린다(2026-08-19): '학사'만 학사일정, 나머지 전부 AIM 색.
// 'AIM' = 세부 구분이 필요 없을 때 쓰는 값(마이그레이션 0020 적용 후 저장 가능 — 미적용이면 저장 실패 오류가 뜬다).
const KINDS = ['AIM', '세미나', '모집', '마감', '일정', '학사']

export default function AdminEvents({ store }) {
  const EMPTY = { 제목: '', 날짜: '', 시간: '', 설명: '', 종류: '일정', 중요: false }
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => store.events.list()
    .then((r) => setRows(r || []))
    .catch((e) => setError(e?.message || '불러오기 실패')), [store])

  useEffect(() => { load() }, [load])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function save(e) {
    e.preventDefault()
    if (!form['제목'].trim() || !form['날짜']) { setError('제목·날짜 필수'); return }
    setBusy(true)
    setError('')
    try {
      await store.events.save(form)
      setMsg('일정 등록됨')
      setForm(EMPTY)
      await load()
    } catch (err) {
      setError(err?.message || '저장 실패 — 마이그레이션 0007 적용 여부 확인')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id) {
    // 삭제 confirm 게이트(2026-08-14 검수)
    const row = rows.find((r) => r.id === id)
    if (!window.confirm(`「${row?.['제목'] || '일정'}」 삭제?`)) return
    setError('')
    try {
      await store.events.remove(id)
      await load()
    } catch (err) {
      setError(err?.message || '삭제 실패')
    }
  }

  return (
    <section className="ws-block">
      <h3 className="ws-h3">일정 <span className="ws-count">{rows.length}</span></h3>
      <form className="ws-form ws-form-wide" onSubmit={save}>
        <div className="ws-field-row">
          <label className="ws-field"><span>제목</span><input value={form['제목']} onChange={set('제목')} /></label>
          <label className="ws-field"><span>날짜</span><input type="date" value={form['날짜']} onChange={set('날짜')} /></label>
          <label className="ws-field"><span>시간(선택)</span><input value={form['시간']} placeholder="19:00" onChange={set('시간')} /></label>
          <label className="ws-field">
            <span>종류</span>
            <select value={form['종류']} onChange={set('종류')}>
              {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </label>
        </div>
        <label className="ws-field"><span>설명(선택)</span><input value={form['설명']} onChange={set('설명')} /></label>
        {/* ★(0010) — 다가오는 업무는 지정 항목만 노출(전량 노출 = 소음, 오너 2026-08-07) */}
        <label className="ws-check">
          <input type="checkbox" checked={form['중요']} onChange={set('중요')} /> ★ 중요 — 다가오는 업무에 표시
        </label>
        {error && <p className="ws-error" role="alert">{error}</p>}
        {msg && <p className="ws-ok" role="status">{msg}</p>}
        <div className="ws-form-acts">
          <button type="submit" className="ws-submit" disabled={busy}>{busy ? '저장 중' : '일정 등록'}</button>
        </div>
      </form>
      <ul className="ws-list">
        {rows.map((r) => (
          <li key={r.id} className="ws-scrap">
            <span className="ws-scrap-url">{r['중요'] ? '★ ' : ''}{r['제목']}</span>
            <span className="ws-mark-meta">{r['날짜']}{r['시간'] ? ` ${r['시간']}` : ''} · {r['종류']}</span>
            <div className="ws-row-acts">
              <button type="button" onClick={() => remove(r.id)}>삭제</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
