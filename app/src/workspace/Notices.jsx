// 공지 섹션(스터디 탭 조립부 — 2026-08-05 4탭 개편) — 내부 공지 열람 + 운영 기록(구 /log 페이지 내부화, IA 4차 2026-08-05). 작성·수정은 운영 탭(운영진 전용).
// notices_select_member: 내부여부=true 행은 멤버에게만 보인다.
// 운영 기록 = 읽기 전용 렌더 — 데이터 원천 = src/data/log.js(기록 추가 = 데이터 1줄 추가).
import { useCallback, useEffect, useState } from 'react'
import Markdown from '../pages/Markdown.jsx'
import { ROADMAP, HISTORY, STATS, STATS_BASIS } from '../data/log.js'

// 구 Log.jsx splitEntry 이식 — 기록 텍스트를 '제목 — 설명' 경계(' — ')로 분리(날조 없음). 경계 없으면 전체가 제목.
export function splitEntry(text) {
  const t = (text || '').trim()
  const i = t.indexOf(' — ')
  if (i === -1) return { title: t, desc: '' }
  return { title: t.slice(0, i).trim(), desc: t.slice(i + 3).trim() }
}

// 운영 기록 — 로드맵·체인지로그(역시간순)·성과. 스타일 = workspace.css 전용(공개면 CSS 공유 금지).
export function OpsLog() {
  return (
    <section className="ws-block ws-oplog">
      <h2 className="ws-h2">운영 기록</h2>
      <p className="ws-note">구 /log 페이지 내부화(2026-08-05) — 읽기 전용. 기록 추가 = src/data/log.js.</p>

      <h3 className="ws-h3">로드맵</h3>
      <ol className="ws-oplog-list">
        {ROADMAP.map(([num, label, , statusLabel]) => (
          <li key={num}>
            <span className="ws-oplog-no">{num}</span> {label} <span className="ws-mark-meta">{statusLabel}</span>
          </li>
        ))}
      </ol>

      <h3 className="ws-h3">체인지로그</h3>
      {HISTORY.map(([date, items]) => (
        <div className="ws-oplog-group" key={date}>
          <span className="ws-oplog-date">{date}</span>
          <ul className="ws-oplog-list">
            {items.map(([, badgeLabel, text]) => {
              const { title, desc } = splitEntry(text)
              return (
                <li key={text}>
                  <span className="ws-mark-meta">{badgeLabel}</span> <strong>{title}</strong>
                  {desc && <span className="ws-oplog-desc"> — {desc}</span>}
                </li>
              )
            })}
          </ul>
        </div>
      ))}

      <h3 className="ws-h3">성과</h3>
      <ul className="ws-oplog-list">
        {STATS.map(([num, label, detail]) => (
          <li key={label}><strong>{num}</strong> {label} — {detail}</li>
        ))}
      </ul>
      <p className="ws-note">{STATS_BASIS}</p>
    </section>
  )
}

export default function Notices({ store }) {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const load = useCallback(() => store.notices.listInternal()
    .then((r) => { setRows(r || []); setStatus('ready') })
    .catch((e) => { setError(e?.message || '불러오기 실패'); setStatus('error') }), [store])

  useEffect(() => { load() }, [load])

  return (
    <>
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
      <OpsLog />
    </>
  )
}
