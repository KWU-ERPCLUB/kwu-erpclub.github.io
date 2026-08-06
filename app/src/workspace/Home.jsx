// 홈 탭(2026-08-06 개편) — 첫 화면 = 대형 월 캘린더 + 다가오는 업무. 아래로 과제 제출·공지·세션 흡수(구 제출·스터디 탭).
// 데이터 = 운영 일정(events, 0007) + 과제 마감 자동 + 세션 날짜 자동. 계산은 calendar-logic.js(순수)만 쓴다.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { monthGrid, buildAgenda, itemsOn, upcoming, dday, toKey, WEEKLY_CONTRIB, weeklyContribItems } from './calendar-logic.js'
import Assignments from './Assignments.jsx'
import Notices from './Notices.jsx'
import Sessions from './Sessions.jsx'

const KIND_CLASS = { 일정: 'ev', 세미나: 'sem', 모집: 'rec', 마감: 'due', 과제: 'due', 세션: 'sem' }
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// 월 캘린더 — 셀 클릭 = 그날 상세 선택. export = 단위 테스트용.
export function MonthCalendar({ year, month, items, todayKey, selected, onSelect, onMove }) {
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
      <div className="ws-cal-grid" role="grid">
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
            <button type="button" key={cell.key} className={classes.join(' ')} onClick={() => onSelect(cell.key)}>
              <span className="ws-cal-day">{cell.day}</span>
              {dayItems.slice(0, 3).map((it) => (
                <span key={`${it.source}-${it.id}`} className={`ws-cal-chip ${KIND_CLASS[it['종류']] || 'ev'}`}>{it['제목']}</span>
              ))}
              {dayItems.length > 3 && <span className="ws-cal-more">+{dayItems.length - 3}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// 다가오는 업무 — 오늘 이후 마감·일정 순 목록. export = 단위 테스트용.
export function UpcomingTasks({ items, todayKey, onSelect }) {
  const rows = upcoming(items, todayKey, 6)
  return (
    <aside className="ws-upcoming" aria-label="다가오는 업무">
      <h2 className="ws-h2">다가오는 업무</h2>
      {rows.length === 0 && <p className="ws-note">예정된 업무 0건.</p>}
      <ul className="ws-list">
        {rows.map((it) => (
          <li key={`${it.source}-${it.id}`}>
            <button type="button" className="ws-up-item" onClick={() => onSelect(it.date)}>
              <span className={`ws-cal-dot ${KIND_CLASS[it['종류']] || 'ev'}`} aria-hidden="true" />
              <span className="ws-up-title">{it['제목']}</span>
              <span className="ws-up-when">{it.date.slice(5).replace('-', '/')} · {dday(todayKey, it.date)}</span>
            </button>
          </li>
        ))}
      </ul>
      {WEEKLY_CONTRIB.dueDay === null && (
        <p className="ws-note">{WEEKLY_CONTRIB.label} — 마감 요일 확정 전(기고 탭에서 제출).</p>
      )}
    </aside>
  )
}

// 선택일 상세 — 캘린더 아래 그날 항목 풀어 보기.
export function DayDetail({ items, selected }) {
  if (!selected) return null
  const rows = itemsOn(items, selected)
  return (
    <section className="ws-block ws-daydetail">
      <h3 className="ws-h3">{selected}</h3>
      {rows.length === 0 && <p className="ws-note">이날 등록된 일정·업무 0건.</p>}
      <ul className="ws-list">
        {rows.map((it) => (
          <li key={`${it.source}-${it.id}`} className="ws-scrap">
            <span className="ws-scrap-url">{it['제목']}</span>
            <span className="ws-mark-meta">{it['종류']}{it['시간'] ? ` · ${it['시간']}` : ''}</span>
            {it['설명'] && <p className="ws-scrap-memo">{it['설명']}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Home({ store }) {
  const todayKey = useMemo(() => toKey(new Date()), [])
  const [ym, setYm] = useState(() => ({ y: Number(todayKey.slice(0, 4)), m: Number(todayKey.slice(5, 7)) }))
  const [selected, setSelected] = useState(todayKey)
  const [raw, setRaw] = useState({ events: [], assignments: [], sessions: [] })
  const [error, setError] = useState('')

  const load = useCallback(() => Promise.all([
    store.events.list(),
    store.assignments.list(),
    store.sessions.list(),
  ]).then(([events, assignments, sessions]) => {
    setRaw({ events: events || [], assignments: assignments || [], sessions: sessions || [] })
  }).catch((e) => setError(e?.message || '불러오기 실패')), [store])

  useEffect(() => { load() }, [load])

  const items = useMemo(
    () => buildAgenda(raw).concat(weeklyContribItems(todayKey)),
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

  return (
    <div className="ws-home">
      {error && <p className="ws-error" role="alert">{error}</p>}
      {/* 상단 = 캘린더(대) + 우측 레일(다가오는 업무·선택일 상세) — 상세를 세로 흐름에서 빼 페이지 길이 축소 */}
      <div className="ws-home-top">
        <MonthCalendar
          year={ym.y} month={ym.m} items={items} todayKey={todayKey}
          selected={selected} onSelect={setSelected} onMove={move}
        />
        <div className="ws-home-rail">
          <UpcomingTasks items={items} todayKey={todayKey} onSelect={setSelected} />
          <DayDetail items={items} selected={selected} />
        </div>
      </div>
      {/* 하단 = 데스크톱 2열(과제·세션 | 공지·운영 기록) — 전폭 세로 나열 금지 */}
      <div className="ws-home-bottom">
        <div>
          <Assignments store={store} />
          <Sessions store={store} />
        </div>
        <div>
          <Notices store={store} />
        </div>
      </div>
    </div>
  )
}
