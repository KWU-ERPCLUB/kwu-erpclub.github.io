// 과제 섹션(홈 탭 조립부 — 2026-08-06 홈 개편) — 과제 목록(마감 표시) + 링크 제출(§0-7). 본인 제출은 수정 가능(과제×멤버 1건).
import { useCallback, useEffect, useState } from 'react'
import { toKey } from './calendar-logic.js'

const isUrl = (v) => /^https?:\/\/\S+$/.test(String(v || '').trim())

// 마감 상태 — 지난 마감이면 '마감됨'. 서버가 제출을 막지는 않는다(지각 제출 허용, 표시만).
// 표시는 로컬(KST) 시각 — 구 toISOString은 UTC라 마감시간이 9시간 어긋나 보였다(2026-08-06 수정).
export function dueLabel(due, now = new Date()) {
  if (!due) return '마감 없음'
  const at = new Date(due)
  if (Number.isNaN(at.getTime())) return '마감 없음'
  const p = (n) => String(n).padStart(2, '0')
  const text = `${toKey(at)} ${p(at.getHours())}:${p(at.getMinutes())}`   // 날짜 부분 = calendar-logic toKey 단일원천
  return at < now ? `마감됨 ${text}` : `마감 ${text}`
}

function Row({ row, mine, onSubmit }) {
  const [url, setUrl] = useState(mine?.url || '')
  const [memo, setMemo] = useState(mine?.['메모'] || '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function send(e) {
    e.preventDefault()
    if (!isUrl(url)) { setError('http(s)로 시작하는 주소 입력'); return }
    setError('')
    setBusy(true)
    try {
      await onSubmit({ id: mine?.id, assignment_id: row.id, url: url.trim(), 메모: memo })
    } catch (err) {
      setError(err?.message || '제출 실패')
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="ws-scrap">
      {/* 1행 = 제목 + 상태 배지(우) / 2행 = 마감 — 앱 행 문법(2026-08-06 전환 안정화 개편) */}
      <div className="ws-row-top">
        <span className="ws-row-title">{row['제목']}</span>
        <span className={`status ${mine ? 'done' : 'prep'}`}>{mine ? '제출함' : '미제출'}</span>
      </div>
      <span className="ws-mark-meta">{dueLabel(row['마감'])}</span>
      {row['설명'] && <p className="ws-scrap-memo">{row['설명']}</p>}
      {/* 제출 폼 = 접힘(리스트+배지 스캔 우선, Classroom 문법 — 2026-08-06 재구성). 미제출은 펼침이 기본. */}
      <details className="ws-fold" open={!mine}>
        <summary>{mine ? '제출 링크 수정' : '링크 제출'}</summary>
        <form className="ws-scrap-form" onSubmit={send}>
          <input
            className="ws-inline" value={url} placeholder="https://..." aria-label={`${row['제목']} 제출 링크`}
            onChange={(e) => setUrl(e.target.value)}
          />
          <input
            className="ws-inline" value={memo} placeholder="메모(선택)" aria-label={`${row['제목']} 제출 메모`}
            onChange={(e) => setMemo(e.target.value)}
          />
          <button type="submit" className="ws-submit ws-submit-inline" disabled={busy}>
            {mine ? '제출 수정' : '제출'}
          </button>
        </form>
        {error && <p className="ws-error" role="alert">{error}</p>}
      </details>
    </li>
  )
}

export default function Assignments({ store }) {
  const [rows, setRows] = useState([])
  const [mine, setMine] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const load = useCallback(() => Promise.all([store.assignments.list(), store.submissions.listMine()])
    .then(([a, s]) => { setRows(a || []); setMine(s || []); setStatus('ready') })
    .catch((e) => { setError(e?.message || '불러오기 실패'); setStatus('error') }), [store])

  useEffect(() => { load() }, [load])

  async function submit(payload) {
    await store.submissions.submit(payload)
    setMsg('제출 반영됨')
    await load()
  }

  return (
    <section className="ws-block">
      <h2 className="ws-h2">과제 <span className="ws-count">{rows.length}</span></h2>
      {status === 'loading' && <div className="ws-skel" aria-label="불러오는 중"><span /><span /></div>}
      {error && <p className="ws-error" role="alert">{error}</p>}
      {msg && <p className="ws-ok" role="status">{msg}</p>}
      {status === 'ready' && rows.length === 0 && <p className="ws-note">등록된 과제 0건.</p>}
      <ul className="ws-list">
        {rows.map((a) => {
          const sub = mine.find((s) => s.assignment_id === a.id) || null
          // key에 제출 id 포함 = 첫 제출 직후 입력칸이 저장된 값으로 다시 잡힌다
          return <Row key={`${a.id}:${sub?.id || 'new'}`} row={a} mine={sub} onSubmit={submit} />
        })}
      </ul>
    </section>
  )
}
