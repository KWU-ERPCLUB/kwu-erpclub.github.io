// 공지(2026-08-18 오너 개편 — 전용 탭 승격): 기본 export = 공지 탭 본문(제목·날짜·본문 카드),
// NoticeTitles = 홈 레일용 제목만 목록(클릭 = 공지 탭 이동). 작성·수정은 운영 탭(운영진 전용).
// 운영 기록(OpsLog, 구 /log 내부화)은 2026-08-18 운영 탭으로 이동(오너 — 스터디원이 볼 필요 없음). export만 여기 유지.
// notices_select_member: 내부여부=true 행은 멤버에게만 보인다.
// 운영 기록 = 읽기 전용 렌더 — 데이터 원천 = src/data/log.js(기록 추가 = 데이터 1줄 추가).
import { useCallback, useEffect, useState, useRef } from 'react'
import Markdown from '../pages/Markdown.jsx'
import { readChecks } from './PrepNotice.jsx'
import { PREP_GUIDES, guideHref, guideItems } from '../data/prep-guides.js'
import { loadSeen, markSeen, isNew } from '../pages/seen-store.js'
import { toKey, dday } from './calendar-logic.js'
import { nextSessionNo, findByNo } from './Roadmap.jsx'
import { AIM_TIMELINE } from '../data/aim-roadmap.js'
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
      <p className="ws-note">운영 이력 기록(읽기 전용).</p>
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
      <h2 className="ws-h2">공지 <span className="ws-count">{rows.length + PREP_GUIDES.length}</span></h2>
      {status === 'loading' && <div className="ws-skel" aria-label="불러오는 중"><span /><span /></div>}
      {error && <p className="ws-error" role="alert">{error}</p>}
      {status === 'ready' && rows.length === 0 && <p className="ws-note">공지 0건. 운영진 안내가 여기 쌓임.</p>}
      <ul className="ws-list">
        {/* 고정 공지(회차 준비물, 코드 원천) = 맨 위 — 클릭 = 그 공지로 딥링크 */}
        {PREP_GUIDES.filter((g) => g.notice).map((g) => (
          <li key={g.id}>
            <button type="button" className="ws-up-item" onClick={onOpen}>
              <span className="ws-up-title">{g.notice.title}</span>
              <span className="ws-up-when">{g.notice.date}</span>
            </button>
          </li>
        ))}
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

// 공지 본문 — 서식 하나(2026-09-13 통일): 문단 · `::: 정보`(표) · `::: 링크`(카드). 단계·체크박스·버튼 칩은 공지에 두지 않는다(방법 = 가이드, 할 일 = 과제).
function NoticeBody({ body }) {
  return <div className="ws-notice-body"><Markdown body={body} /></div>
}

// 본문 첫 문단 → 카드 요약(2026-09-13 공지 탭 재설계 — "요약을 보여 주고 본문만 접는다"). 제목·목록·구분선은 건너뛰고 마크다운 기호 제거. 순수(테스트 대상).
export function firstParagraph(md, max = 110) {
  const lines = String(md || '').split('\n').map((l) => l.trim())
  const line = lines.find((l) => l && !/^(#|>|[-*]\s|\d+\.\s|:::|\|)/.test(l)) || lines.find((l) => l && !/^(#|:::|\|)/.test(l)) || ''
  const plain = line.replace(/\*\*|__|`/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/^[-*>]\s*/, '').replace(/\s+/g, ' ').trim()
  return plain.length > max ? `${plain.slice(0, max - 1).trim()}…` : plain
}
const noticeKey = (id) => `notice:${id}`

// DB 공지 카드 — 종류 라벨(안내) · 제목 · 새 공지 N(7일 이내·미열람) · 날짜 · 요약 1~2줄. 누르면 본문이 카드 안에서 펼쳐진다.
function NoticeCard({ n, seen, onSee, kind = '안내' }) {
  const date = n.created_at ? ymd(n.created_at) : n.date
  const fresh = isNew({ slug: noticeKey(n.id), date }, seen, toKey(new Date()))
  return (
    <li className="ws-notice-row ws-ncard">
      <details onToggle={(e) => { if (e.currentTarget.open) onSee(noticeKey(n.id)) }}>
        <summary className="ws-notice-sum">
          <span className="ws-ncard-head">
            <span className="ws-nkind">{kind}</span>
            <span className="ws-notice-title">{n['제목']}</span>
            {fresh && <span className="ws-prow-new" aria-label="새 공지">N</span>}
            <span className="ws-notice-when">{date}</span>
          </span>
          <span className="ws-ncard-sum">{firstParagraph(n['본문'])}</span>
        </summary>
        <NoticeBody body={n['본문'] || ''} />
        <p className="ws-ncard-foot">문의: 운영진 신해원</p>
      </details>
    </li>
  )
}

// 우측 레일 — 「이번 주」(다음 회차 · 가장 가까운 과제 마감 · 준비물 진행) + 「읽는 법」. 홈과 같은 데이터, 새 입력 0.
function NoticeRail({ store, todayKey }) {
  const [sessions, setSessions] = useState([])
  const [assignments, setAssignments] = useState([])
  const [prepDone, setPrepDone] = useState(null)
  useEffect(() => {
    let on = true
    Promise.all([store.sessions.list(), store.assignments.list()])
      .then(([s, a]) => { if (on) { setSessions(s || []); setAssignments(a || []) } })
      .catch(() => { /* 레일은 보조 — 실패 시 빈 칸 */ })
    const g = PREP_GUIDES[0]
    if (g) { const n = guideItems(g).length; setPrepDone({ done: readChecks(g.id, n).filter(Boolean).length, n }) }
    return () => { on = false }
  }, [store])
  const nextNo = nextSessionNo(AIM_TIMELINE, sessions, todayKey)
  const nextItem = AIM_TIMELINE.find((it) => it.type !== 'phase' && it.no === nextNo)
  const nextSession = nextItem ? findByNo(sessions, nextItem.no) : null
  const due = assignments
    .filter((a) => a['마감'] && String(a['마감']).slice(0, 10) >= todayKey)
    .sort((a, b) => (a['마감'] < b['마감'] ? -1 : 1))[0]
  const dueKey = due ? String(due['마감']).slice(0, 10) : null
  return (
    <>
      <section className="ws-block">
        <h2 className="ws-h2">이번 주</h2>
        <ul className="ws-list ws-nrail">
          {nextItem && (
            <li><span className="ws-nrail-k">다음 회차</span><span className="ws-nrail-v">{nextItem.회차} · {nextItem.주제}</span>{nextSession?.['날짜'] && <span className="ws-nrail-d">{nextSession['날짜'].slice(5)} · {dday(todayKey, nextSession['날짜'])}</span>}</li>
          )}
          {due && (
            <li><span className="ws-nrail-k">과제 마감</span><span className="ws-nrail-v">{due['제목']}</span><span className="ws-nrail-d">{dueKey.slice(5)} · {dday(todayKey, dueKey)}</span></li>
          )}
          {prepDone && (
            <li><span className="ws-nrail-k">OT 준비물</span><a className="ws-nrail-v" href={guideHref(PREP_GUIDES[0])}>{prepDone.done} / {prepDone.n} 완료 · 가이드 열기</a><span className="ws-nrail-bar" aria-hidden="true"><span style={{ width: `${(prepDone.done / prepDone.n) * 100}%` }} /></span></li>
          )}
          {!nextItem && !due && !prepDone && <li className="ws-note">이번 주 항목 없음</li>}
        </ul>
      </section>
      <section className="ws-block">
        <h2 className="ws-h2">읽는 법</h2>
        <ul className="ws-guide-lines">
          <li>카드를 누르면 본문이 열린다</li>
          <li>하는 법은 가이드, 제출은 홈의 과제에서</li>
          <li>N = 7일 안에 올라온 안 읽은 공지</li>
        </ul>
      </section>
    </>
  )
}

const KINDS = ['전체', '준비물', '안내']

// 공지 탭(2026-09-13 재설계 — 오너: "홈·로드맵·공고에 비해 밀도가 낮고 투박하다"). 골격 = 다른 탭과 같은 2열(본문 + 레일).
// 본문 = 종류 라벨이 붙은 카드 목록(요약 포함, 본문만 접힘) — 구 "제목 한 줄 목록"은 공지 2건에서 빈 화면이 됐다.
// 필터 칩은 공지 5건 이상일 때만(2건에 칩은 과함). 기본 접힘 유지(오너 9/12) — 대신 요약이 보인다.
export default function Notices({ store }) {
  const { rows, status, error } = useNotices(store)
  const [seen, setSeen] = useState(() => new Set())
  const [kind, setKind] = useState('전체')
  const todayKey = toKey(new Date())
  useEffect(() => { setSeen(loadSeen()) }, [])
  const onSee = (key) => setSeen(new Set(markSeen(key)))
  const total = rows.length + PREP_GUIDES.filter((g) => g.notice).length
  const showPrep = kind === '전체' || kind === '준비물'
  const showDb = kind === '전체' || kind === '안내'
  return (
    <div className="ws-notices ws-cols">
      <div className="ws-cmain">
        {total >= 5 && (
          <div className="ws-chips ws-nchips" role="tablist" aria-label="공지 종류">
            {KINDS.map((k) => <button key={k} type="button" role="tab" aria-selected={kind === k} className={`ws-chip${kind === k ? ' is-on' : ''}`} onClick={() => setKind(k)}>{k}</button>)}
          </div>
        )}
        <p className="ws-count-line">전체 <span className="ws-count">{total}</span></p>
        {status === 'loading' && <div className="ws-skel" aria-label="불러오는 중"><span /><span /></div>}
        {error && <p className="ws-error" role="alert">{error}</p>}
        {status === 'ready' && total === 0 && <p className="ws-note">공지 0건. 운영진 안내가 여기 쌓임.</p>}
        {total > 0 && (
          <ul className="ws-list ws-notice-list">
            {showPrep && PREP_GUIDES.filter((g) => g.notice).map((g) => (
              <NoticeCard key={g.id} kind={g.notice.kind} n={{ id: g.id, date: g.notice.date, 제목: g.notice.title, 본문: g.notice.body }} seen={seen} onSee={onSee} />
            ))}
            {showDb && rows.map((n) => <NoticeCard key={n.id} n={n} seen={seen} onSee={onSee} />)}
          </ul>
        )}
      </div>
      <aside className="ws-crail">
        <NoticeRail store={store} todayKey={todayKey} />
      </aside>
    </div>
  )
}
