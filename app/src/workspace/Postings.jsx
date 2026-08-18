// 공고 탭(2026-08-07 신설 → 2026-08-18 구독 개인화) — 공모전·채용·자격시험·대외활동 스크랩 + 학사·AIM 일정 열람.
// 개인 스크랩(내정보 > 북마크)과 별개. 등록·삭제 = 운영 탭(운영진 전용). 마감·시험일은 홈 캘린더에 합류.
// 구독(0014) = 카테고리·세부 단위 캘린더 필터 — 여기 필터 칩 자리에서 바로 토글(오너 확정 2026-08-18).
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toKey, dday } from './calendar-logic.js'
import { POSTING_KINDS, postingStatus, groupPostings, filterPostings } from './postings-logic.js'
import { taxonomyOptions, effectiveSubs, hasSubRow, subMatches, eventCategory, planToggle, SUBS_CHANGED } from './postings-taxonomy.js'

// 카드 1장 — 종류·세부 분류 배지 + 제목(원문 링크) + 주최 + 접수·시험 일정 + 큐레이션 코멘트(필수 필드).
// 관심 ★(0013) — 체크한 공고는 내정보 상단 "관심 공고"에 모인다(구독과 별개: ★=모음, 구독=캘린더).
export function PostingCard({ row, todayKey, interested = false, onToggleInterest }) {
  const status = postingStatus(row, todayKey)
  const closed = status === '마감'
  return (
    <li className={`ws-posting${closed ? ' closed' : ''}${row['고정'] ? ' pinned' : ''}`}>
      <div className="ws-row-top">
        <span className={`ws-post-kind k-${POSTING_KINDS.indexOf(row['종류'])}`}>{row['종류']}</span>
        {row['분류'] && <span className="ws-post-sub">{row['분류']}</span>}
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

// 학사·AIM 일정 목록(events) — 공고 카드와 계약이 달라 소형 리스트로. 지난 일정은 접힘.
export function EventList({ rows, todayKey }) {
  const coming = rows.filter((r) => r['날짜'] >= todayKey)
  const past = rows.filter((r) => r['날짜'] < todayKey).reverse()
  const line = (r) => (
    <li key={r.id} className="ws-mark">
      <span className="ws-row-title">{r['제목']}</span>
      <span className="ws-mark-meta">{r['날짜']}{r['시간'] ? ` ${r['시간']}` : ''}{r['설명'] ? ` · ${r['설명']}` : ''}</span>
    </li>
  )
  return (
    <>
      {coming.length === 0 && <p className="ws-note">예정 일정 0건.</p>}
      <ul className="ws-list">{coming.map(line)}</ul>
      {past.length > 0 && (
        <details className="ws-fold">
          <summary>지난 일정 {past.length}건</summary>
          <ul className="ws-list">{past.map(line)}</ul>
        </details>
      )}
    </>
  )
}

// 일정 카테고리(학사·AIM) 표시명 — 필터 칩 라벨(카테고리 키는 짧은 값 유지).
const CAT_LABEL = { 학사: '학사일정', AIM: 'AIM 일정' }

export default function Postings({ store }) {
  const todayKey = useMemo(() => toKey(new Date()), [])
  const [rows, setRows] = useState([])
  const [events, setEvents] = useState([])
  const [interests, setInterests] = useState([])
  const [subs, setSubs] = useState(null)          // null = 0014 미적용 강등(토글 숨김·캘린더 전체)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [note, setNote] = useState('')            // ★·구독 저장 실패 한 줄 안내(3초 후 소거)
  const [kind, setKind] = useState('전체')
  const [sub, setSub] = useState('전체')

  const load = useCallback(() => Promise.all([
    store.postings.list(), store.events.list(), store.postings.listInterests(), store.postings.listSubscriptions(),
  ]).then(([r, e, ids, s]) => {
    setRows(r || []); setEvents(e || []); setInterests(ids || []); setSubs(s); setStatus('ready')
  }).catch((e) => { setError(e?.message || '불러오기 실패'); setStatus('error') }), [store])

  useEffect(() => { load() }, [load])

  // 다른 탭(내정보)의 변경 즉시 반영 — 탭이 hidden 보존이라 이벤트로 동기화(2026-08-18).
  useEffect(() => {
    const sync = () => store.postings.listSubscriptions().then(setSubs).catch(() => {})
    window.addEventListener(SUBS_CHANGED, sync)
    return () => window.removeEventListener(SUBS_CHANGED, sync)
  }, [store])

  const flash = (msg) => { setNote(msg); setTimeout(() => setNote(''), 3000) }

  // 낙관적 토글 — 실패 시 원복(0013 미적용 환경 포함) + 한 줄 안내(무언 원복은 유령 동작으로 보임).
  const toggleInterest = useCallback((postingId, on) => {
    setInterests((prev) => (on ? [...prev, postingId] : prev.filter((id) => id !== postingId)))
    store.postings.toggleInterest(postingId, on)
      .catch(() => {
        setInterests((prev) => (on ? prev.filter((id) => id !== postingId) : [...prev, postingId]))
        flash('관심 저장 실패 — 잠시 후 다시')
      })
  }, [store])

  // 구독 토글 — planToggle이 첫 변경 시 기본 구독(학사+AIM)을 함께 실체화. 실패 = 재조회 원복.
  const toggleSub = useCallback(async (k, s, on) => {
    const { writes } = planToggle(subs || [], k, s, on)
    setSubs((prev) => {
      const kept = (prev || []).filter((r) => !writes.some((w) => !w.on && w['종류'] === r['종류'] && w['분류'] === r['분류']))
      const adds = writes.filter((w) => w.on && !kept.some((r) => r['종류'] === w['종류'] && r['분류'] === w['분류']))
      return kept.concat(adds.map(({ 종류, 분류 }) => ({ 종류, 분류 })))
    })
    try {
      for (const w of writes) await store.postings.toggleSubscription(w['종류'], w['분류'], w.on)
      window.dispatchEvent(new Event(SUBS_CHANGED))   // 홈 캘린더·내정보 즉시 반영
    } catch {
      flash('저장 실패 — 마이그레이션 0014 적용 여부 확인')
      store.postings.listSubscriptions().then(setSubs).catch(() => {})
    }
  }, [store, subs])

  const isEventCat = kind === '학사' || kind === 'AIM'
  const subOptions = !isEventCat && kind !== '전체' ? taxonomyOptions(kind) : []
  const selSub = sub === '전체' ? '' : sub
  const { active, always, closed } = useMemo(
    () => groupPostings(filterPostings(rows, isEventCat ? '전체' : kind, selSub), todayKey),
    [rows, kind, selSub, todayKey, isEventCat],
  )
  const open = active.concat(always)
  const catEvents = useMemo(
    () => events.filter((e) => eventCategory(e) === kind).sort((a, b) => (a['날짜'] < b['날짜'] ? -1 : 1)),
    [events, kind],
  )

  // 구독 버튼 상태 — on = 정확한 행 존재(행 0건 = 기본 학사+AIM 해석). 종류 전체 구독이 세부를 덮는 경우는 안내문으로 구분.
  const eff = effectiveSubs(subs)
  const subbed = eff !== null && hasSubRow(eff, kind, selSub)
  const coveredByKind = eff !== null && !subbed && Boolean(selSub) && subMatches(eff, kind, selSub)

  // 공통 프레임(ws-cols): 본문 = 필터 2줄 + 구독 토글 + 카드/일정 + 마감 접힘 / 레일 = 접수 임박 + 보드 안내.
  return (
    <div className="ws-postings ws-cols">
      <div className="ws-cmain">
        <section className="ws-block">
          <nav className="ws-tabbar ws-subbar" aria-label="공고 종류">
            {['전체', ...POSTING_KINDS, '학사', 'AIM'].map((k) => (
              <button
                key={k} type="button" aria-pressed={kind === k}
                className={`ws-tabbtn${kind === k ? ' on' : ''}`} onClick={() => { setKind(k); setSub('전체') }}
              >
                {CAT_LABEL[k] || k}
              </button>
            ))}
          </nav>
          {subOptions.length > 0 && (
            <nav className="ws-tabbar ws-subbar ws-subbar2" aria-label="세부 분류">
              {['전체', ...subOptions].map((s) => (
                <button
                  key={s} type="button" aria-pressed={sub === s}
                  className={`ws-tabbtn sm${sub === s ? ' on' : ''}`} onClick={() => setSub(s)}
                >
                  {s}
                </button>
              ))}
            </nav>
          )}
          {kind !== '전체' && subs !== null && (
            <div className="ws-subline">
              <button
                type="button" className={`ws-sub-toggle${subbed ? ' on' : ''}`} aria-pressed={subbed}
                onClick={() => toggleSub(kind, selSub, !subbed)}
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
                  {subbed && <path d="m8.5 14.5 2.5 2.5 4.5-4.5" />}
                </svg>
                {subbed ? '내 캘린더에 담김' : `${selSub || CAT_LABEL[kind] || kind} 캘린더에 담기`}
              </button>
              <span className="ws-note">
                {coveredByKind ? `${CAT_LABEL[kind] || kind} 전체가 이미 캘린더에 담겨 있다` : '담은 분류의 마감·일정만 홈 캘린더에 뜬다'}
              </span>
            </div>
          )}
          {status === 'loading' && <div className="ws-skel" aria-label="불러오는 중"><span /><span /></div>}
          {error && <p className="ws-error" role="alert">{error}</p>}
          {note && <p className="ws-error" role="status">{note}</p>}
          {isEventCat && status === 'ready' && <EventList rows={catEvents} todayKey={todayKey} />}
          {!isEventCat && (
            <>
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
            </>
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
          <p className="ws-note">홈 캘린더에는 내가 담은 분류의 마감·시험일만 뜬다(기본 = 학사일정+AIM 일정). 각 필터의 「캘린더에 담기」로 켜고 끈다.</p>
        </section>
      </aside>
    </div>
  )
}
