// 공지 탭(M3 ③) — 내부 공지 열람. 작성·수정은 운영 탭(운영진 전용).
// notices_select_member: 내부여부=true 행은 멤버에게만 보인다.
import { useCallback, useEffect, useState } from 'react'
import Markdown from '../pages/Markdown.jsx'

export default function Notices({ store }) {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const load = useCallback(() => store.notices.listInternal()
    .then((r) => { setRows(r || []); setStatus('ready') })
    .catch((e) => { setError(e?.message || '불러오기 실패'); setStatus('error') }), [store])

  useEffect(() => { load() }, [load])

  return (
    <section className="ws-block">
      <h2 className="ws-h2">공지 <span className="ws-count">{rows.length}</span></h2>
      {status === 'loading' && <p className="ws-note">불러오는 중</p>}
      {error && <p className="ws-error" role="alert">{error}</p>}
      {status === 'ready' && rows.length === 0 && <p className="ws-note">공지 0건.</p>}
      <ul className="ws-list">
        {rows.map((n) => (
          <li key={n.id} className="ws-scrap">
            <span className="ws-scrap-url">{n['제목']}</span>
            <span className="ws-mark-meta">{n['내부여부'] === false ? '공개' : '내부'}</span>
            <div className="ws-preview">
              <Markdown body={n['본문'] || ''} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
