// 운영진 승인 화면(SPEC §0-8·§3) — 승인대기 목록 → 미리보기 → 게재/반려.
// 게재 = 상태 '게재'(게재일 자동 채움) → 공개 인사이트가 다음 페치에서 노출.
// 반려 = 상태 '초안'(작성자가 이어서 고칠 수 있게 되돌림 — 삭제하지 않는다).
import { useCallback, useEffect, useState } from 'react'
import Markdown from '../pages/Markdown.jsx'

export default function Review({ store, onChanged }) {
  const [rows, setRows] = useState([])
  const [open, setOpen] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(() => store.articles.listPending()
    .then((r) => setRows(r || []))
    .catch((e) => setError(e?.message || '불러오기 실패')), [store])

  useEffect(() => { load() }, [load])

  async function decide(id, 상태) {
    try {
      await store.articles.setStatus(id, 상태)
      setOpen(null)
      await load()
      onChanged?.()
    } catch (e) {
      setError(e?.message || '처리 실패')
    }
  }

  return (
    <section className="ws-block ws-review">
      <h2 className="ws-h2">승인 대기 <span className="ws-count">{rows.length}</span></h2>
      {error && <p className="ws-error" role="alert">{error}</p>}
      {rows.length === 0 && <p className="ws-note">대기 0건.</p>}
      <ul className="ws-list">
        {rows.map((a) => (
          <li key={a.id} className="ws-scrap">
            <span className="ws-scrap-url">{a['제목']}</span>
            <span className="ws-mark-meta">{a['성격']} · {a['주제']}</span>
            <div className="ws-row-acts">
              <button type="button" onClick={() => setOpen(open === a.id ? null : a.id)}>
                {open === a.id ? '접기' : '미리보기'}
              </button>
              <button type="button" onClick={() => decide(a.id, '게재')}>게재</button>
              <button type="button" onClick={() => decide(a.id, '초안')}>반려</button>
            </div>
            {open === a.id && (
              <div className="ws-preview">
                <p className="ws-preview-desc">{a['설명']}</p>
                <Markdown body={a['본문'] || ''} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
