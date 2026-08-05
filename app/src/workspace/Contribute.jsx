// 기고 탭(SPEC §0-8) — 내부 초안(DB) → 승인대기 제출 → 운영진 승인 → 게재.
// md 커밋 경유 없음. 게재되면 공개 인사이트가 다음 페치에서 바로 집어간다(클라이언트 페치).
import { useCallback, useEffect, useState } from 'react'
import { NATURES, TOPICS } from '../content/schema.js'
// 승인 대기함(Review)은 M3에서 운영 탭으로 이관 — 기고 화면은 작성자 관점만 담는다.

const EMPTY = {
  제목: '', 성격: NATURES[0], 주제: TOPICS[0], 설명: '', 본문: '',
  source_url: '', source_name: '',
}

function required(draft) {
  const miss = []
  if (!draft['제목'].trim()) miss.push('제목')
  if (!draft['설명'].trim()) miss.push('설명')
  if (!draft['본문'].trim()) miss.push('본문')
  if (!/^https?:\/\/\S+$/.test(draft.source_url.trim())) miss.push('출처 링크')
  if (!draft.source_name.trim()) miss.push('출처 이름')
  return miss
}

// 내 초안 목록 — 상태 칩 + 이어쓰기.
function MyDrafts({ rows, onEdit }) {
  if (rows.length === 0) return <p className="ws-note">작성한 글 0건.</p>
  return (
    <ul className="ws-list">
      {rows.map((a) => (
        <li key={a.id} className="ws-scrap">
          <span className="ws-scrap-url">{a['제목']}</span>
          <span className={`status ${a['상태'] === '게재' ? 'done' : 'prep'}`}>{a['상태']}</span>
          <div className="ws-row-acts">
            {a['상태'] !== '게재' && <button type="button" onClick={() => onEdit(a)}>이어쓰기</button>}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function Contribute({ store }) {
  const [draft, setDraft] = useState(EMPTY)
  const [mine, setMine] = useState([])
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => store.articles.listMine()
    .then((rows) => setMine(rows || []))
    .catch((e) => setError(e?.message || '불러오기 실패')), [store])

  useEffect(() => { load() }, [load])

  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }))

  async function submit(상태) {
    const miss = required(draft)
    if (miss.length) { setError(`필수 항목 미입력: ${miss.join(', ')}`); return }
    setError('')
    setBusy(true)
    try {
      await store.articles.save({ ...draft, 상태 })
      setMsg(상태 === '승인대기' ? '제출 완료 — 운영진 승인 대기' : '초안 저장 완료')
      setDraft(EMPTY)
      await load()
    } catch (e) {
      setError(e?.message || '저장 실패')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="ws-contribute">
      <section className="ws-block">
        <h2 className="ws-h2">{draft.id ? '초안 수정' : '새 기고'}</h2>
        <form className="ws-form ws-form-wide" onSubmit={(e) => { e.preventDefault(); submit('승인대기') }}>
          <label className="ws-field">
            <span>제목</span>
            <input value={draft['제목']} onChange={set('제목')} />
          </label>
          <div className="ws-field-row">
            <label className="ws-field">
              <span>성격</span>
              <select value={draft['성격']} onChange={set('성격')}>
                {NATURES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
            <label className="ws-field">
              <span>주제</span>
              <select value={draft['주제']} onChange={set('주제')}>
                {TOPICS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
          </div>
          <label className="ws-field">
            <span>설명(카드 1줄)</span>
            <input value={draft['설명']} onChange={set('설명')} />
          </label>
          <div className="ws-field-row">
            <label className="ws-field">
              <span>출처 링크</span>
              <input value={draft.source_url} placeholder="https://..." onChange={set('source_url')} />
            </label>
            <label className="ws-field">
              <span>출처 이름</span>
              <input value={draft.source_name} onChange={set('source_name')} />
            </label>
          </div>
          <label className="ws-field">
            <span>본문(마크다운)</span>
            <textarea className="ws-textarea" rows={12} value={draft['본문']} onChange={set('본문')} />
          </label>
          {error && <p className="ws-error" role="alert">{error}</p>}
          {msg && <p className="ws-ok" role="status">{msg}</p>}
          <div className="ws-form-acts">
            <button type="button" className="ws-signout" disabled={busy} onClick={() => submit('초안')}>초안 저장</button>
            <button type="submit" className="ws-submit" disabled={busy}>승인 요청</button>
          </div>
        </form>
      </section>

      <section className="ws-block">
        <h2 className="ws-h2">내 글</h2>
        <MyDrafts rows={mine} onEdit={(a) => setDraft({ ...EMPTY, ...a })} />
      </section>
    </div>
  )
}
