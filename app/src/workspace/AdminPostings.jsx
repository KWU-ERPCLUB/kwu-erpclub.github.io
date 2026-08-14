// 운영 > 공고(0009) — 공고 탭 보드에 뜨는 외부 기회(공모전·채용·자격시험·대외활동) 등록·삭제(운영진 전용, RLS postings_write_staff).
// 코멘트 = 필수(오너 확정 2026-08-07) — 빈 값은 폼에서 차단. 테이블 미적용(마이그레이션 0009 전)이면 오류를 그대로 보여준다.
import { useCallback, useEffect, useState } from 'react'
import { POSTING_KINDS } from './postings-logic.js'

const EMPTY = { 제목: '', 종류: POSTING_KINDS[0], 주최: '', url: '', 접수시작: '', 접수마감: '', 시험일: '', 코멘트: '', 고정: false }
const isUrl = (v) => /^https?:\/\/\S+$/.test(String(v || '').trim())

// date input 빈 문자열 → null(빈 문자열은 date 컬럼 insert 실패).
const toRow = (f) => ({
  ...f,
  url: f.url.trim(),
  접수시작: f['접수시작'] || null,
  접수마감: f['접수마감'] || null,
  시험일: f['시험일'] || null,
})

export default function AdminPostings({ store }) {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => store.postings.list()
    .then((r) => setRows(r || []))
    .catch((e) => setError(e?.message || '불러오기 실패')), [store])

  useEffect(() => { load() }, [load])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function save(e) {
    e.preventDefault()
    if (!form['제목'].trim()) { setError('제목 필수'); return }
    if (!isUrl(form.url)) { setError('원문 링크 = http(s) 주소 필수'); return }
    if (!form['코멘트'].trim()) { setError('코멘트 필수 — 우리에게 왜 유효한지 한 줄'); return }
    setBusy(true)
    setError('')
    try {
      await store.postings.save(toRow(form))
      setMsg('공고 등록됨')
      setForm(EMPTY)
      await load()
    } catch (err) {
      setError(err?.message || '저장 실패 — 마이그레이션 0009 적용 여부 확인')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id) {
    // 삭제 confirm 게이트(2026-08-14 검수)
    const row = rows.find((r) => r.id === id)
    if (!window.confirm(`「${row?.['제목'] || '공고'}」 삭제?`)) return
    setError('')
    try {
      await store.postings.remove(id)
      await load()
    } catch (err) {
      setError(err?.message || '삭제 실패')
    }
  }

  return (
    <section className="ws-block">
      <h3 className="ws-h3">공고 <span className="ws-count">{rows.length}</span></h3>
      <p className="ws-note">접수마감을 비우면 상시 항목. 마감·시험일은 홈 캘린더에 자동 합류.</p>
      <form className="ws-form ws-form-wide" onSubmit={save}>
        <div className="ws-field-row">
          <label className="ws-field"><span>제목</span><input value={form['제목']} onChange={set('제목')} /></label>
          <label className="ws-field">
            <span>종류</span>
            <select value={form['종류']} onChange={set('종류')}>
              {POSTING_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </label>
          <label className="ws-field"><span>주최(선택)</span><input value={form['주최']} placeholder="LG CNS, KPC…" onChange={set('주최')} /></label>
        </div>
        <label className="ws-field"><span>원문 링크</span><input value={form.url} placeholder="https://..." onChange={set('url')} /></label>
        <div className="ws-field-row">
          <label className="ws-field"><span>접수시작(선택)</span><input type="date" value={form['접수시작']} onChange={set('접수시작')} /></label>
          <label className="ws-field"><span>접수마감(선택)</span><input type="date" value={form['접수마감']} onChange={set('접수마감')} /></label>
          <label className="ws-field"><span>시험일(선택)</span><input type="date" value={form['시험일']} onChange={set('시험일')} /></label>
        </div>
        <label className="ws-field">
          <span>코멘트 — 우리에게 왜 유효한가</span>
          <input value={form['코멘트']} placeholder="예: 물류·생산 과목이 전공 수업과 겹쳐 준비 비용이 낮다" onChange={set('코멘트')} />
        </label>
        <label className="ws-check">
          <input type="checkbox" checked={form['고정']} onChange={set('고정')} /> ★ 고정 — 보드 상단 + 다가오는 업무에 표시
        </label>
        {error && <p className="ws-error" role="alert">{error}</p>}
        {msg && <p className="ws-ok" role="status">{msg}</p>}
        <div className="ws-form-acts">
          <button type="submit" className="ws-submit" disabled={busy}>{busy ? '저장 중' : '공고 등록'}</button>
        </div>
      </form>
      <ul className="ws-list">
        {rows.map((r) => (
          <li key={r.id} className="ws-scrap">
            <span className="ws-scrap-url">{r['제목']}</span>
            <span className="ws-mark-meta">{r['종류']} · {r['접수마감'] ? `~${r['접수마감']}` : '상시'}{r['고정'] ? ' · 고정' : ''}</span>
            <div className="ws-row-acts">
              <button type="button" onClick={() => remove(r.id)}>삭제</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
