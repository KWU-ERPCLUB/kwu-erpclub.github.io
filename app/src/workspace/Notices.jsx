// 공지(2026-08-18 오너 개편 — 전용 탭 승격): 기본 export = 공지 탭 본문(제목·날짜·본문 카드),
// NoticeTitles = 홈 레일용 제목만 목록(클릭 = 공지 탭 이동). 작성·수정은 운영 탭(운영진 전용).
// 운영 기록(OpsLog, 구 /log 내부화)은 2026-08-18 운영 탭으로 이동(오너 — 스터디원이 볼 필요 없음). export만 여기 유지.
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
      {/* 내부 경로 안내 줄(구 /log·src/data/log.js) = 오너 삭제 2026-08-15 — 저장소 구조는 화면에 쓰지 않는다. */}
      <p className="ws-note">지금까지의 운영 이력을 모아둔 읽기 전용 기록.</p>
      {/* 아카이브 = 접힘 기본(2026-08-06 재구성 — 일상 업무 화면에서 홈 길이만 늘이던 문제) */}
      <details className="ws-fold">
      <summary>전체 기록 펼치기</summary>

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
                  {desc && <span className="ws-oplog-desc">{desc}</span>}
                </li>
              )
            })}
          </ul>
        </div>
      ))}

      <h3 className="ws-h3">성과</h3>
      <ul className="ws-oplog-list">
        {STATS.map(([num, label, detail]) => (
          <li key={label}><strong>{num}</strong> {label} <span className="ws-oplog-desc">{detail}</span></li>
        ))}
      </ul>
      <p className="ws-note">{STATS_BASIS}</p>
      </details>
    </section>
  )
}

// 공지 로드 공용 훅 — 탭 본문·홈 제목 목록이 같은 원천을 쓴다.
function useNotices(store) {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const load = useCallback(() => store.notices.listInternal()
    .then((r) => { setRows(r || []); setStatus('ready') })
    .catch((e) => { setError(e?.message || '불러오기 실패'); setStatus('error') }), [store])

  useEffect(() => { load() }, [load])
  return { rows, status, error }
}

const ymd = (ts) => String(ts || '').slice(0, 10)

// 홈 레일용 — 제목·날짜만(오너 2026-08-18: 홈에서 본문 전체 노출 폐지). 클릭 = 공지 탭 이동.
export function NoticeTitles({ store, onOpen }) {
  const { rows, status, error } = useNotices(store)
  return (
    <section className="ws-block">
      <h2 className="ws-h2">공지 <span className="ws-count">{rows.length}</span></h2>
      {status === 'loading' && <div className="ws-skel" aria-label="불러오는 중"><span /><span /></div>}
      {error && <p className="ws-error" role="alert">{error}</p>}
      {status === 'ready' && rows.length === 0 && <p className="ws-note">공지 0건.</p>}
      <ul className="ws-list">
        {rows.map((n) => (
          <li key={n.id}>
            <button type="button" className="ws-up-item" onClick={onOpen}>
              <span className="ws-up-title">{n['제목']}</span>
              <span className="ws-up-when">{ymd(n.created_at)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

// 공지 탭 본문(2026-08-19 오너 개편) — 한 공지 = 접힌 한 줄. 제목·날짜만 보이고 클릭하면 본문이 펼쳐진다.
// 이유: 카드로 전문을 펼쳐 두면 공지가 쌓일수록 무엇이 있는지 한눈에 안 들어온다.
// 최신 1건만 기본 펼침 — 새 공지는 읽히라고 올리는 것이고, 나머지는 목록으로 남는다.
// 문법은 공고 탭의 행과 같다(details) — 접힘 상태에서도 본문이 DOM에 있어 브라우저 검색이 된다.
export default function Notices({ store }) {
  const { rows, status, error } = useNotices(store)
  return (
    <div className="ws-notices">
      {status === 'loading' && <div className="ws-skel" aria-label="불러오는 중"><span /><span /></div>}
      {error && <p className="ws-error" role="alert">{error}</p>}
      {status === 'ready' && rows.length === 0 && <p className="ws-note">공지 0건.</p>}
      {rows.length > 0 && (
        <ul className="ws-list ws-notice-list">
          {rows.map((n, i) => (
            <li key={n.id} className="ws-notice-row">
              <details open={i === 0}>
                <summary className="ws-notice-sum">
                  <span className="ws-notice-title">{n['제목']}</span>
                  <span className="ws-notice-when">{ymd(n.created_at)}</span>
                </summary>
                <div className="ws-notice-body">
                  <Markdown body={n['본문'] || ''} />
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
