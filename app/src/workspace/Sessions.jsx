// 세션 섹션(홈 탭 조립부 — 2026-08-06 홈 개편) — 회차·날짜·자료 링크 열람(스터디원 읽기 전용, RLS sessions_select_member).
// 자료 = 링크 기반. 파일 업로드(Storage 버킷)는 M4 범위 — 파일경로 행은 안내 문구로만 표시.
// 해금(0011): 멤버에겐 공개일 도래 전 행이 RLS에서 걸러짐. 미래 공개일 행이 보인다 = 운영진 화면 → 잠금 표시.
import { useCallback, useEffect, useState } from 'react'

const localToday = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export const isLockedMaterial = (m, today = localToday()) => Boolean(m['공개일'] && m['공개일'] > today)

export default function Sessions({ store }) {
  const [rows, setRows] = useState([])
  const [materials, setMaterials] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const load = useCallback(() => Promise.all([store.sessions.list(), store.materials.list()])
    .then(([s, m]) => { setRows(s || []); setMaterials(m || []); setStatus('ready') })
    .catch((e) => { setError(e?.message || '불러오기 실패'); setStatus('error') }), [store])

  useEffect(() => { load() }, [load])

  return (
    <section className="ws-block">
      <h2 className="ws-h2">세션 <span className="ws-count">{rows.length}</span></h2>
      {status === 'loading' && <div className="ws-skel" aria-label="불러오는 중"><span /><span /></div>}
      {error && <p className="ws-error" role="alert">{error}</p>}
      {status === 'ready' && rows.length === 0 && <p className="ws-note">등록된 세션 0건.</p>}
      <ul className="ws-list">
        {rows.map((s) => {
          const mine = materials.filter((m) => m.session_id === s.id)
          return (
            <li key={s.id} className="ws-scrap">
              <div className="ws-row-top">
                <span className="ws-row-title">{s['회차']}회차 · {s['제목']}</span>
                <span className="ws-mark-meta">{s['날짜'] || '일정 미정'}</span>
              </div>
              {s['설명'] && <p className="ws-scrap-memo">{s['설명']}</p>}
              <ul className="ws-sublist">
                {mine.length === 0 && <li className="ws-note">자료 0건</li>}
                {mine.map((m) => (
                  <li key={m.id}>
                    {isLockedMaterial(m)
                      ? <span className="ws-note">🔒 {m['제목']} — {m['공개일']} 공개(운영진에게만 보임)</span>
                      : m.url
                        ? <a href={m.url} target="_blank" rel="noreferrer">{m['제목']}</a>
                        : <span>{m['제목']} — 파일 자료(내려받기 = M4)</span>}
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
