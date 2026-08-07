// 공고 탭(2026-08-07 신설) — 공모전·채용·자격시험·대외활동을 운영진이 스크랩해 전원과 공유하는 보드.
// 개인 스크랩(북마크 탭)과 별개. 등록·삭제 = 운영 탭 > 공고(운영진 전용). 마감·시험일은 홈 캘린더에 합류.
// 문법 근거(리서치 2026-08-07): 카드형 + 종류 필터 + 마감 파생 상태 — 제목 나열식 게시판(마감 안 보임·죽은 공고 쌓임) 반면교사.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toKey, dday } from './calendar-logic.js'
import { POSTING_KINDS, postingStatus, groupPostings, filterPostings } from './postings-logic.js'

// 카드 1장 — 종류 배지 + 제목(원문 링크) + 주최 + 접수·시험 일정 + 큐레이션 코멘트(필수 필드).
export function PostingCard({ row, todayKey }) {
  const status = postingStatus(row, todayKey)
  const closed = status === '마감'
  return (
    <li className={`ws-posting${closed ? ' closed' : ''}${row['고정'] ? ' pinned' : ''}`}>
      <div className="ws-row-top">
        <span className={`ws-post-kind k-${POSTING_KINDS.indexOf(row['종류'])}`}>{row['종류']}</span>
        {row['고정'] && !closed && <span className="ws-post-pin">고정</span>}
        <span className={`ws-post-status s-${status}`}>
          {status === '접수중' ? `접수중 · ${dday(todayKey, row['접수마감'])}` : status}
        </span>
      </div>
      <a className="ws-post-title" href={row.url} target="_blank" rel="noreferrer">{row['제목']}</a>
      <p className="ws-mark-meta">
        {row['주최'] && <>{row['주최']} · </>}
        {row['접수마감'] ? `접수 ${row['접수시작'] ? `${row['접수시작']} ~ ` : '~ '}${row['접수마감']}` : '상시'}
        {row['시험일'] && ` · 시험일 ${row['시험일']}`}
      </p>
      <p className="ws-post-comment">{row['코멘트']}</p>
    </li>
  )
}

export default function Postings({ store }) {
  const todayKey = useMemo(() => toKey(new Date()), [])
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [kind, setKind] = useState('전체')

  const load = useCallback(() => store.postings.list()
    .then((r) => { setRows(r || []); setStatus('ready') })
    .catch((e) => { setError(e?.message || '불러오기 실패'); setStatus('error') }), [store])

  useEffect(() => { load() }, [load])

  const { active, always, closed } = useMemo(
    () => groupPostings(filterPostings(rows, kind), todayKey),
    [rows, kind, todayKey],
  )
  const open = active.concat(always)

  // 공통 프레임(ws-cols): 본문 = 필터 + 진행 중 카드 + 마감 접힘 / 레일 = 접수 임박 + 보드 안내.
  return (
    <div className="ws-postings ws-cols">
      <div className="ws-cmain">
        <section className="ws-block">
          <nav className="ws-tabbar ws-subbar" aria-label="공고 종류">
            {['전체', ...POSTING_KINDS].map((k) => (
              <button
                key={k} type="button" aria-pressed={kind === k}
                className={`ws-tabbtn${kind === k ? ' on' : ''}`} onClick={() => setKind(k)}
              >
                {k}
              </button>
            ))}
          </nav>
          {status === 'loading' && <div className="ws-skel" aria-label="불러오는 중"><span /><span /></div>}
          {error && <p className="ws-error" role="alert">{error}</p>}
          {status === 'ready' && open.length === 0 && (
            <p className="ws-note">진행 중 공고 0건 — 운영진이 등록하면 여기에 뜬다.</p>
          )}
          <ul className="ws-list ws-post-grid">
            {open.map((r) => <PostingCard key={r.id} row={r} todayKey={todayKey} />)}
          </ul>
          {closed.length > 0 && (
            <details className="ws-fold">
              <summary>마감된 공고 {closed.length}건</summary>
              <ul className="ws-list ws-post-grid">
                {closed.map((r) => <PostingCard key={r.id} row={r} todayKey={todayKey} />)}
              </ul>
            </details>
          )}
        </section>
      </div>

      <aside className="ws-crail">
        <section className="ws-block">
          <h2 className="ws-h2">접수 임박</h2>
          {active.length === 0 && <p className="ws-note">접수 중 공고 0건.</p>}
          <ul className="ws-list">
            {active.slice(0, 5).map((r) => (
              <li key={r.id} className="ws-mark">
                <a href={r.url} target="_blank" rel="noreferrer">{r['제목']}</a>
                <span className="ws-mark-meta">{r['접수마감'].slice(5).replace('-', '/')} · {dday(todayKey, r['접수마감'])}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="ws-block">
          <h2 className="ws-h2">보드 안내</h2>
          <p className="ws-note">운영진이 선별해 올리는 외부 기회 스크랩 — 링크 모음이 아니라 "우리에게 왜 유효한가" 한 줄이 붙는다.</p>
          <p className="ws-note">접수 마감·시험일은 홈 캘린더·다가오는 업무에 함께 뜬다.</p>
        </section>
      </aside>
    </div>
  )
}
