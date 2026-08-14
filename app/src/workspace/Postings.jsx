// 공고 탭(2026-08-07 신설) — 공모전·채용·자격시험·대외활동을 운영진이 스크랩해 전원과 공유하는 보드.
// 개인 스크랩(내정보 > 북마크)과 별개. 등록·삭제 = 운영 탭 > 공고(운영진 전용). 마감·시험일은 홈 캘린더에 합류.
// 문법 근거(리서치 2026-08-07): 카드형 + 종류 필터 + 마감 파생 상태 — 제목 나열식 게시판(마감 안 보임·죽은 공고 쌓임) 반면교사.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toKey, dday } from './calendar-logic.js'
import { POSTING_KINDS, postingStatus, groupPostings, filterPostings } from './postings-logic.js'

// 카드 1장 — 종류 배지 + 제목(원문 링크) + 주최 + 접수·시험 일정 + 큐레이션 코멘트(필수 필드).
// 관심 ★(2026-08-14 오너) — 체크한 공고는 내정보 상단 "관심 공고"에 모인다(0013 posting_interests).
export function PostingCard({ row, todayKey, interested = false, onToggleInterest }) {
  const status = postingStatus(row, todayKey)
  const closed = status === '마감'
  return (
    <li className={`ws-posting${closed ? ' closed' : ''}${row['고정'] ? ' pinned' : ''}`}>
      <div className="ws-row-top">
        <span className={`ws-post-kind k-${POSTING_KINDS.indexOf(row['종류'])}`}>{row['종류']}</span>
        {row['고정'] && !closed && <span className="ws-post-pin">고정</span>}
        <span className={`ws-post-status s-${status}`}>
          {status === '접수중' && `접수중 · ${dday(todayKey, row['접수마감'])}`}
          {status === '예정' && `시험 ${dday(todayKey, row['시험일'])}`}
          {status !== '접수중' && status !== '예정' && status}
        </span>
        {onToggleInterest && (
          <button
            type="button" className={`ws-post-star${interested ? ' on' : ''}`}
            aria-pressed={interested} aria-label={interested ? '관심 해제' : '관심 공고로 체크'}
            title={interested ? '관심 해제' : '관심 공고로 체크 — 내정보에 모인다'}
            onClick={() => onToggleInterest(row.id, !interested)}
          >
            ★
          </button>
        )}
      </div>
      <a className="ws-post-title" href={row.url} target="_blank" rel="noreferrer">{row['제목']}</a>
      <p className="ws-mark-meta">
        {[
          row['주최'],
          row['접수마감'] ? `접수 ${row['접수시작'] ? `${row['접수시작']} ~ ` : '~ '}${row['접수마감']}` : (!row['시험일'] && '상시'),
          row['시험일'] && `시험일 ${row['시험일']}`,
        ].filter(Boolean).join(' · ')}
      </p>
      <p className="ws-post-comment">{row['코멘트']}</p>
    </li>
  )
}

export default function Postings({ store }) {
  const todayKey = useMemo(() => toKey(new Date()), [])
  const [rows, setRows] = useState([])
  const [interests, setInterests] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [starNote, setStarNote] = useState('')   // ★ 저장 실패 한 줄 안내(2026-08-14 검수 — 3초 후 소거)
  const [kind, setKind] = useState('전체')

  const load = useCallback(() => Promise.all([store.postings.list(), store.postings.listInterests()])
    .then(([r, ids]) => { setRows(r || []); setInterests(ids || []); setStatus('ready') })
    .catch((e) => { setError(e?.message || '불러오기 실패'); setStatus('error') }), [store])

  useEffect(() => { load() }, [load])

  // 낙관적 토글 — 실패 시 원복(0013 미적용 환경 포함) + 한 줄 안내(무언 원복은 유령 동작으로 보임).
  const toggleInterest = useCallback((postingId, on) => {
    setInterests((prev) => (on ? [...prev, postingId] : prev.filter((id) => id !== postingId)))
    store.postings.toggleInterest(postingId, on)
      .catch(() => {
        setInterests((prev) => (on ? prev.filter((id) => id !== postingId) : [...prev, postingId]))
        setStarNote('관심 저장 실패 — 잠시 후 다시')
        setTimeout(() => setStarNote(''), 3000)
      })
  }, [store])

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
          {starNote && <p className="ws-error" role="status">{starNote}</p>}
          {status === 'ready' && open.length === 0 && (
            <p className="ws-note">진행 중 공고 0건 — 운영진이 등록하면 여기에 뜬다.</p>
          )}
          <ul className="ws-list ws-post-grid">
            {open.map((r) => (
              <PostingCard key={r.id} row={r} todayKey={todayKey} interested={interests.includes(r.id)} onToggleInterest={toggleInterest} />
            ))}
          </ul>
          {closed.length > 0 && (
            <details className="ws-fold">
              <summary>마감된 공고 {closed.length}건</summary>
              <ul className="ws-list ws-post-grid">
                {closed.map((r) => (
                  <PostingCard key={r.id} row={r} todayKey={todayKey} interested={interests.includes(r.id)} onToggleInterest={toggleInterest} />
                ))}
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
            {active.slice(0, 5).map((r) => {
              const due = r['접수마감'] || r['시험일']   // 예정(접수 없는 시험) = 시험일 기준
              return (
                <li key={r.id} className="ws-mark">
                  <a href={r.url} target="_blank" rel="noreferrer">{r['제목']}</a>
                  <span className="ws-mark-meta">{due.slice(5).replace('-', '/')} · {dday(todayKey, due)}</span>
                </li>
              )
            })}
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
