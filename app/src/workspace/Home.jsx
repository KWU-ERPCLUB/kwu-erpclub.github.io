// 홈 탭(2026-08-06 개편) — 첫 화면 = 대형 월 캘린더 + 다가오는 업무. 아래로 과제 제출·공지·세션 흡수(구 제출·스터디 탭).
// 데이터 = 운영 일정(events, 0007) + 과제 마감 자동 + 세션 날짜 자동. 계산은 calendar-logic.js(순수)만 쓴다.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { monthGrid, buildAgenda, itemsOn, upcoming, dday, daysBetween, toKey, weeklyContribItems } from './calendar-logic.js'
import { postingAgendaItems } from './postings-logic.js'
import { filterAgendaBySubs, SUBS_CHANGED } from './postings-taxonomy.js'
import Assignments from './Assignments.jsx'
import { NoticeTitles } from './Notices.jsx'

const KIND_CLASS = { 일정: 'ev', 세미나: 'sem', 모집: 'rec', 마감: 'due', 과제: 'due', 세션: 'sem', 공고: 'post', 학사: 'ac' }
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// 항목 세부 팝업(2026-08-07 오너) — 새 창 대신 작은 둥근 팝업. 캘린더 칩·선택일 목록 어디서든 연다.
// 접근성(2026-08-14 검수): Escape 닫기 + 열릴 때 닫기 버튼 포커스 + 닫힐 때 연 버튼으로 복귀.
export function ItemPopup({ item, onClose }) {
  const closeRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useEffect(() => {
    if (!item) return undefined
    const opener = typeof document !== 'undefined' ? document.activeElement : null
    closeRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current?.() }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (opener && typeof opener.focus === 'function') opener.focus()
    }
  }, [item])
  if (!item) return null
  return (
    <div className="ws-modal" role="presentation" onClick={onClose}>
      <div
        className="ws-modal-card" role="dialog" aria-modal="true" aria-label={item['제목']}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ws-row-top">
          <span className={`ws-cal-dot ${KIND_CLASS[item['종류']] || 'ev'}`} aria-hidden="true" />
          <span className="ws-mark-meta">{item['종류']}</span>
          <button type="button" ref={closeRef} className="ws-modal-x" onClick={onClose} aria-label="닫기">×</button>
        </div>
        <h3 className="ws-modal-title">{item['제목']}</h3>
        <p className="ws-mark-meta">{item.date}{item['시간'] ? ` · ${item['시간']}` : ''}</p>
        {item['주최'] && <p className="ws-mark-meta">{item['주최']}</p>}
        {item['설명'] && <p className="ws-modal-desc">{item['설명']}</p>}
        {item.url && (
          <a className="ws-modal-link" href={item.url} target="_blank" rel="noreferrer">원문 보기 ↗</a>
        )}
      </div>
    </div>
  )
}

// 월 캘린더 — 셀 클릭 = 그날 상세 선택 / 칩 클릭 = 항목 팝업(2026-08-07). export = 단위 테스트용.
// 셀은 div+onClick(칩이 진짜 button이라 중첩 button 회피), 날짜 선택은 선택일 목록·키보드는 칩 포커스로 보완.
export function MonthCalendar({ year, month, items, todayKey, selected, onSelect, onMove, onOpenItem }) {
  const weeks = monthGrid(year, month)
  return (
    <div className="ws-cal">
      <div className="ws-cal-head">
        <h2 className="ws-h2">{year}. {month}</h2>
        <div className="ws-cal-nav">
          <button type="button" onClick={() => onMove(-1)} aria-label="이전 달">‹</button>
          <button type="button" onClick={() => onMove(0)}>오늘</button>
          <button type="button" onClick={() => onMove(1)} aria-label="다음 달">›</button>
        </div>
      </div>
      {/* 범례(2026-08-14 검수) — 점 색이 곧 종류: 기존 ws-cal-dot 색 재사용 */}
      <ul className="ws-cal-legend">
        {[['ev', '일정'], ['sem', '세미나'], ['rec', '모집'], ['due', '마감'], ['post', '공고'], ['ac', '학사']].map(([c, label]) => (
          <li key={c}><span className={`ws-cal-dot ${c}`} aria-hidden="true" />{label}</li>
        ))}
      </ul>
      {/* role=grid 제거(2026-08-14 검수) — grid 키보드 규약 미구현 상태의 거짓 선언 대신 단순 div */}
      <div className="ws-cal-grid">
        {WEEKDAYS.map((w, i) => (
          <span key={w} className={`ws-cal-wd${i === 0 ? ' sun' : ''}`}>{w}</span>
        ))}
        {weeks.flat().map((cell) => {
          const dayItems = itemsOn(items, cell.key)
          const classes = ['ws-cal-cell']
          if (dayItems.length > 0) classes.push('has-items')
          if (!cell.inMonth) classes.push('out')
          if (cell.key === todayKey) classes.push('today')
          if (cell.key === selected) classes.push('sel')
          return (
            <div
              key={cell.key} className={classes.join(' ')} tabIndex={0}
              onClick={() => onSelect(cell.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(cell.key) }
              }}
            >
              <span className="ws-cal-day">{cell.day}</span>
              {/* 폰 = 종류색 도트 최대 3개(모바일 spec §3-2 — Apple Compact 문법, 구 중립 도트 1개 폐지). 데스크탑 = display:none */}
              {dayItems.length > 0 && (
                <span className="ws-cal-dots" aria-hidden="true">
                  {dayItems.slice(0, 3).map((it) => (
                    <i key={`d-${it.source}-${it.id}`} className={`ws-cal-dot ${KIND_CLASS[it['종류']] || 'ev'}`} />
                  ))}
                </span>
              )}
              {dayItems.slice(0, 3).map((it) => (
                <button
                  type="button" key={`${it.source}-${it.id}`}
                  className={`ws-cal-chip ${KIND_CLASS[it['종류']] || 'ev'}`}
                  title={it['제목']}
                  onClick={(e) => { e.stopPropagation(); onSelect(cell.key); onOpenItem?.(it) }}
                >
                  {it['제목']}
                </button>
              ))}
              {dayItems.length > 3 && <span className="ws-cal-more">+{dayItems.length - 3}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 다가오는 업무(2026-08-18 개편) — 내 캘린더에 뜬 항목 전부, 2주 창(구 "★만" 폐기 — 캘린더 등록 개인화가 대신 거른다).
// ★(중요·고정)는 마커로만 남는다. export = 단위 테스트용.
export function UpcomingTasks({ items, todayKey, onSelect }) {
  const rows = upcoming(items, todayKey, 12, 14)
  // 폰 = 5건 + 펼침(모바일 spec §3-2 — progressive disclosure). 데스크탑은 CSS가 전량 노출(open 무관).
  const [open, setOpen] = useState(false)
  return (
    <aside className="ws-upcoming" aria-label="다가오는 업무">
      <h2 className="ws-h2">다가오는 업무 <span className="ws-count">{rows.length}</span></h2>
      {rows.length === 0 && <p className="ws-note">2주 내 일정 0건 — 공고 탭에서 분류를 캘린더에 등록하면 여기 모인다.</p>}
      <ul className={`ws-list ws-up-list${open ? ' open' : ''}`}>
        {rows.map((it) => (
          <li key={`${it.source}-${it.id}`}>
            <button type="button" className="ws-up-item" onClick={() => onSelect(it.date)}>
              <span className={`ws-cal-dot ${KIND_CLASS[it['종류']] || 'ev'}`} aria-hidden="true" />
              <span className="ws-up-title">{it['중요'] ? '★ ' : ''}{it['제목']}</span>
              <span className="ws-up-when">{it.date.slice(5).replace('-', '/')}</span>
              <span className={`ws-up-dday${daysBetween(todayKey, it.date) <= 7 ? ' soon' : ''}`}>{dday(todayKey, it.date)}</span>
            </button>
          </li>
        ))}
      </ul>
      {rows.length > 5 && (
        <button type="button" className="ws-up-more" onClick={() => setOpen((v) => !v)}>
          {open ? '접기' : `전체 ${rows.length}건 보기`}
        </button>
      )}
    </aside>
  )
}

// 선택일 상세 — 캘린더 아래 그날 항목 풀어 보기. 항목 클릭 = 세부 팝업(2026-08-07).
export function DayDetail({ items, selected, onOpenItem }) {
  if (!selected) return null
  const rows = itemsOn(items, selected)
  return (
    <section className="ws-block ws-daydetail">
      <h3 className="ws-h3">{selected}</h3>
      {rows.length === 0 && <p className="ws-note">이날 등록된 일정·업무 0건.</p>}
      <ul className="ws-list">
        {rows.map((it) => (
          <li key={`${it.source}-${it.id}`}>
            <button type="button" className="ws-up-item" onClick={() => onOpenItem?.(it)}>
              <span className={`ws-cal-dot ${KIND_CLASS[it['종류']] || 'ev'}`} aria-hidden="true" />
              <span className="ws-up-title">{it['제목']}</span>
              <span className="ws-up-when">{it['종류']}{it['시간'] ? ` · ${it['시간']}` : ''}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

// 상단 요약(Classroom '할 일' 문법) — 로그인 직후 "오늘 나는 뭘 해야 하나"에 한 줄로 답한다.
export function HomeSummary({ member, items, todayKey }) {
  const week = new Date(`${todayKey}T12:00:00`)
  week.setDate(week.getDate() + 7)
  const weekKey = toKey(week)
  const soon = items.filter((i) => i.date >= todayKey && i.date <= weekKey)
  const due = soon.filter((i) => i['종류'] === '과제' || i['종류'] === '마감').length
  return (
    <div className="ws-summary">
      <p className="ws-summary-hi">{member?.['이름'] || '스터디원'} —</p>
      <p className="ws-summary-line">
        7일 내 일정 <strong>{soon.length}건</strong>{due > 0 && <> · 마감 <strong className="due">{due}건</strong></>}
        {soon.length === 0 && ' — 예정된 일정 없음'}
      </p>
      {/* 온보딩 한 줄(2026-08-14 검수) — 일정 0건 첫 화면의 "다음에 뭘 하나" 안내(정적) */}
      {soon.length === 0 && (
        <p className="ws-note">처음이면: 내정보에서 비밀번호 변경 → 로드맵에서 커리큘럼 확인</p>
      )}
    </div>
  )
}

export default function Home({ store, member, onGoTab }) {
  const todayKey = useMemo(() => toKey(new Date()), [])
  const [ym, setYm] = useState(() => ({ y: Number(todayKey.slice(0, 4)), m: Number(todayKey.slice(5, 7)) }))
  const [selected, setSelected] = useState(todayKey)
  const [popup, setPopup] = useState(null)          // 세부 팝업 대상 항목(2026-08-07)
  const [raw, setRaw] = useState({ events: [], assignments: [], sessions: [], postings: [], subs: null, interests: [] })
  const [error, setError] = useState('')

  const load = useCallback(() => Promise.all([
    store.events.list(),
    store.assignments.list(),
    store.sessions.list(),
    store.postings.list(),
    store.postings.listSubscriptions(),
    store.postings.listInterests(),
  ]).then(([events, assignments, sessions, postings, subs, interests]) => {
    setRaw({ events: events || [], assignments: assignments || [], sessions: sessions || [], postings: postings || [], subs, interests: interests || [] })
  }).catch((e) => setError(e?.message || '불러오기 실패')), [store])

  useEffect(() => { load() }, [load])

  // 공고 탭·내정보의 등록·관심 ★ 토글 즉시 반영 — 탭이 hidden 보존이라 이벤트로 동기화(2026-08-18 오너).
  useEffect(() => {
    const sync = () => Promise.all([store.postings.listSubscriptions(), store.postings.listInterests()])
      .then(([subs, interests]) => setRaw((prev) => ({ ...prev, subs, interests: interests || [] })))
      .catch(() => {})
    window.addEventListener(SUBS_CHANGED, sync)
    return () => window.removeEventListener(SUBS_CHANGED, sync)
  }, [store])

  // 네 원천(운영 일정·과제·세션 + 공고 마감·시험일) + 주간 기고 반복 — 합친 뒤 날짜 재정렬(upcoming이 정렬 전제).
  // 구독 필터(2026-08-18) — 공고·운영 일정은 등록한 카테고리만 합류(행 0건 = 학사+AIM, null = 0014 미적용 강등: 전부).
  // 관심 ★ 공고는 분류 미등록이어도 개별 합류(오너: "특정 공고만 보고 싶을 때").
  const items = useMemo(
    () => filterAgendaBySubs(
      buildAgenda(raw).concat(postingAgendaItems(raw.postings), weeklyContribItems(todayKey)),
      raw.subs,
      raw.interests,
    ).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)),
    [raw, todayKey],
  )

  function move(step) {
    if (step === 0) {
      setYm({ y: Number(todayKey.slice(0, 4)), m: Number(todayKey.slice(5, 7)) })
      setSelected(todayKey)
      return
    }
    setYm(({ y, m }) => {
      const next = new Date(y, m - 1 + step, 1)
      return { y: next.getFullYear(), m: next.getMonth() + 1 }
    })
  }

  // 공통 프레임(ws-cols — 전 탭 동일 열 경계): 본문 = 요약·캘린더·과제·세션 / 레일 = 업무·선택일·공지.
  return (
    <div className="ws-home ws-cols">
      <div className="ws-cmain">
        {error && <p className="ws-error" role="alert">{error}</p>}
        <HomeSummary member={member} items={items} todayKey={todayKey} />
        <div className="ws-block">
          <MonthCalendar
            year={ym.y} month={ym.m} items={items} todayKey={todayKey}
            selected={selected} onSelect={setSelected} onMove={move} onOpenItem={setPopup}
          />
        </div>
        {/* 폰 적층(모바일 spec §3-2): 요약→캘린더→선택일→업무→과제→공지 — 레일 소속 2종을 캘린더 직하에 폰 전용 복제 */}
        <div className="ws-m-only">
          <DayDetail items={items} selected={selected} onOpenItem={setPopup} />
          <UpcomingTasks items={items} todayKey={todayKey} onSelect={setSelected} />
        </div>
        <Assignments store={store} />
        {/* 세션 섹션 = 로드맵 탭으로 편입(2026-08-18 오너 — 홈에선 제거, 자료·본문은 로드맵 차시 펼침이 담당) */}
      </div>
      <aside className="ws-crail">
        <div className="ws-d-only">
          <UpcomingTasks items={items} todayKey={todayKey} onSelect={setSelected} />
          <DayDetail items={items} selected={selected} onOpenItem={setPopup} />
        </div>
        {/* 공지 = 제목만(오너 2026-08-18 — 본문은 전용 공지 탭). 클릭 = 공지 탭 이동 */}
        <NoticeTitles store={store} onOpen={() => onGoTab?.('공지')} />
      </aside>
      <ItemPopup item={popup} onClose={() => setPopup(null)} />
    </div>
  )
}
