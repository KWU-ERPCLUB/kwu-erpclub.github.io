// 운영 탭 공통 폼(M3 ②) — "목록 + 등록/수정" 한 벌. 공지·세션·자료·과제가 같은 뼈대를 쓴다.
// 필드 정의 = [키, 타입]. 타입 = text·textarea·number·date·datetime·check·session.
// 권한 판정은 서버 RLS(*_write_staff) — 이 컴포넌트는 운영 탭 안에서만 렌더된다(화면 차단은 Workspace).
import { useState } from 'react'

const EMPTY_VALUE = { check: false, number: '', session: '' }

function initial(fields) {
  return Object.fromEntries(fields.map(([key, type]) => [key, EMPTY_VALUE[type] ?? '']))
}

// DB로 보낼 값 정리 — 빈 문자열은 null(not null 컬럼은 서버 제약이 잡는다), 숫자는 Number.
function normalize(fields, draft) {
  const out = {}
  for (const [key, type] of fields) {
    const v = draft[key]
    if (type === 'check') out[key] = Boolean(v)
    else if (type === 'number') out[key] = v === '' ? null : Number(v)
    else out[key] = String(v ?? '').trim() === '' ? null : v
  }
  return out
}

function Field({ spec, value, onChange, sessions }) {
  const [key, type] = spec
  const set = (v) => onChange(key, v)
  if (type === 'check') {
    return (
      <label className="ws-check">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => set(e.target.checked)} />
        <span>{key}</span>
      </label>
    )
  }
  if (type === 'session') {
    return (
      <label className="ws-field">
        <span>세션</span>
        <select value={value || ''} onChange={(e) => set(e.target.value)}>
          <option value="">(선택 없음)</option>
          {sessions.map((s) => <option key={s.id} value={s.id}>{s['회차']}회차 · {s['제목']}</option>)}
        </select>
      </label>
    )
  }
  return (
    <label className="ws-field">
      <span>{key}</span>
      {type === 'textarea'
        ? <textarea className="ws-textarea" rows={5} value={value || ''} onChange={(e) => set(e.target.value)} />
        : (
          <input
            type={type === 'datetime' ? 'datetime-local' : type}
            value={value ?? ''}
            onChange={(e) => set(e.target.value)}
          />
        )}
    </label>
  )
}

export default function AdminForm({ title, fields, rows, sessions = [], labelOf, onSave }) {
  const [draft, setDraft] = useState(() => initial(fields))
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key, v) => setDraft((d) => ({ ...d, [key]: v }))

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await onSave({ ...normalize(fields, draft), ...(draft.id ? { id: draft.id } : {}) })
      setMsg(draft.id ? '수정 반영됨' : '등록됨')
      setDraft(initial(fields))
    } catch (err) {
      setError(err?.message || '저장 실패')
    } finally {
      setBusy(false)
    }
  }

  function edit(row) {
    const next = initial(fields)
    for (const [key, type] of fields) {
      const v = row[key]
      next[key] = type === 'check' ? Boolean(v) : (v ?? '')
    }
    setDraft({ ...next, id: row.id })
    setMsg('')
  }

  return (
    <section className="ws-block">
      <h3 className="ws-h3">{title} <span className="ws-count">{rows.length}</span></h3>
      <ul className="ws-list">
        {rows.map((row) => (
          <li key={row.id} className="ws-scrap">
            <span className="ws-scrap-url">{labelOf(row)}</span>
            <div className="ws-row-acts">
              <button type="button" onClick={() => edit(row)}>수정</button>
            </div>
          </li>
        ))}
      </ul>
      <form className="ws-form ws-form-wide" onSubmit={save}>
        {fields.map((spec) => (
          <Field key={spec[0]} spec={spec} value={draft[spec[0]]} onChange={set} sessions={sessions} />
        ))}
        {error && <p className="ws-error" role="alert">{error}</p>}
        {msg && <p className="ws-ok" role="status">{msg}</p>}
        <div className="ws-form-acts">
          <button type="submit" className="ws-submit" disabled={busy}>{draft.id ? '수정 저장' : '등록'}</button>
          {draft.id && (
            <button type="button" className="ws-signout" onClick={() => setDraft(initial(fields))}>새로 작성</button>
          )}
        </div>
      </form>
    </section>
  )
}
