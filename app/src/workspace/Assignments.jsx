// 과제 탭(2026-09-13 신설 — 오너 "공지는 알림, 해야 할 것은 과제"). 구 홈 안 섹션에서 전용 탭으로 승격.
// 골격 = 다른 탭과 같은 2열(ws-cols): 본문 = 종류 라벨 카드 목록 / 레일 = 이번 주 + 내는 법.
// 카드 부품은 공지 탭(ws-ncard)·공고 탭(ws-prow)과 맞췄다 — 종류 라벨 · 요약 항상 · 마감 D-day · 상태 pill.
// 3종(링크·폼·체크리스트) 분기 = AssignmentForms.jsx, 판정 = assignments-logic.js(순수).
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toKey, dday, daysBetween } from './calendar-logic.js'
import { kindOf, formOf } from '../data/assignment-forms.js'
import {
  dueLabel, dueKeyOf, ddayLabel, statusOf, progressOf,
  sortAssignments, openAssignments, filterAssignments, FILTERS,
} from './assignments-logic.js'
import { LinkForm, FieldForm, ChecklistForm, HowLink } from './AssignmentForms.jsx'

export { dueLabel }

const KIND_HINT = {
  링크: '문서 링크를 붙여 넣어 제출',
  폼: '칸을 채워 제출',
  체크리스트: '항목을 체크하면 바로 저장',
}

// 카드 요약 줄 — 설명이 있으면 설명, 없으면 그 종류를 어떻게 내는지. 빈 줄은 만들지 않는다.
function summaryOf(row, form, sub) {
  const kind = kindOf(row)
  if (kind === '체크리스트') {
    const { done, total } = progressOf(form, sub)
    return `${total}가지 중 ${done}가지 완료`
  }
  const desc = String(row['설명'] || '').trim()
  return desc || KIND_HINT[kind]
}

function AssignmentCard({ row, sub, todayKey, onSubmit }) {
  const kind = kindOf(row)
  const form = formOf(row)
  const status = statusOf(row, sub)
  const left = ddayLabel(row, todayKey)
  const key = dueKeyOf(row)
  return (
    <li className={`ws-acard s-${status}`}>
      <details open={status === '미제출'}>
        <summary className="ws-acard-sum">
          <span className="ws-acard-head">
            <span className="ws-akind">{kind}</span>
            <span className="ws-acard-title">{row['제목']}</span>
            <span className={`ws-astatus s-${status}`}>{status}</span>
            {key && <span className="ws-acard-when">{key.slice(5).replace('-', '/')}</span>}
            {left && status === '미제출' && (
              <span className={`ws-adday${daysBetween(todayKey, key) <= 7 ? ' soon' : ''}`}>{left}</span>
            )}
          </span>
          <span className="ws-acard-sum-line">{summaryOf(row, form, sub)}</span>
        </summary>
        <div className="ws-acard-body">
          <p className="ws-anote">{dueLabel(row['마감'])}</p>
          {kind === '링크' && <LinkForm row={row} mine={sub} onSubmit={onSubmit} />}
          {kind === '폼' && <FieldForm row={row} form={form} mine={sub} onSubmit={onSubmit} />}
          {kind === '체크리스트' && <ChecklistForm row={row} form={form} mine={sub} onSubmit={onSubmit} />}
        </div>
      </details>
    </li>
  )
}

// 우측 레일 — 「이번 주」(가장 가까운 마감) + 「내는 법」. 공지 탭 레일과 같은 문법(항목 3줄 상한).
function AssignmentRail({ rows, subs, todayKey }) {
  const open = openAssignments(rows, subs)
  const next = open.find((r) => dueKeyOf(r))
  return (
    <>
      <section className="ws-block">
        <h2 className="ws-h2">이번 주</h2>
        <ul className="ws-list ws-nrail">
          {next && (
            <li>
              <span className="ws-nrail-k">가장 가까운 마감</span>
              <span className="ws-nrail-v">{next['제목']}</span>
              <span className="ws-nrail-d">{dueKeyOf(next).slice(5)} · {dday(todayKey, dueKeyOf(next))}</span>
            </li>
          )}
          <li>
            <span className="ws-nrail-k">남은 과제</span>
            <span className="ws-nrail-v">{open.length}건</span>
          </li>
          {open.length === 0 && <li className="ws-note">낼 것이 없다</li>}
        </ul>
      </section>
      <section className="ws-block">
        <h2 className="ws-h2">내는 법</h2>
        <ul className="ws-guide-lines">
          <li>카드를 누르면 제출 칸이 열린다</li>
          <li>낸 뒤에도 마감 전까지 고칠 수 있다</li>
          <li>답은 나와 운영진만 본다</li>
        </ul>
      </section>
    </>
  )
}

// 과제 데이터 공용 훅 — 탭 본문·홈 요약이 같은 원천을 쓴다.
function useAssignments(store) {
  const [rows, setRows] = useState([])
  const [subs, setSubs] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const load = useCallback(() => Promise.all([store.assignments.list(), store.submissions.listMine()])
    .then(([a, s]) => { setRows(a || []); setSubs(s || []); setStatus('ready') })
    .catch((e) => { setError(e?.message || '불러오기 실패'); setStatus('error') }), [store])

  useEffect(() => { load() }, [load])
  return { rows, subs, status, error, load }
}

// 홈 요약(오너 픽 2026-09-13: 홈은 요약만, 제출은 과제 탭) — 마감 가까운 3건 + 과제 탭 이동.
export function AssignmentSummary({ store, onOpen }) {
  const { rows, subs, status } = useAssignments(store)
  const todayKey = useMemo(() => toKey(new Date()), [])
  const open = openAssignments(rows, subs).slice(0, 3)
  return (
    <section className="ws-block">
      <h2 className="ws-h2">과제 <span className="ws-count">{openAssignments(rows, subs).length}</span></h2>
      {status === 'loading' && <div className="ws-skel" aria-label="불러오는 중"><span /><span /></div>}
      {status === 'ready' && open.length === 0 && <p className="ws-note">낼 것이 없다. 새 과제가 올라오면 여기 뜬다.</p>}
      <ul className="ws-list">
        {open.map((r) => {
          const key = dueKeyOf(r)
          return (
            <li key={r.id}>
              <button type="button" className="ws-up-item" onClick={onOpen}>
                <span className="ws-akind sm">{kindOf(r)}</span>
                <span className="ws-up-title">{r['제목']}</span>
                {key && <span className="ws-up-when">{key.slice(5).replace('-', '/')}</span>}
                {key && <span className={`ws-up-dday${daysBetween(todayKey, key) <= 7 ? ' soon' : ''}`}>{dday(todayKey, key)}</span>}
              </button>
            </li>
          )
        })}
      </ul>
      {/* 전용 클래스 — 홈의 ws-up-more는 데스크탑에서 숨김 규칙이 걸려 있다(다가오는 업무 전용) */}
      {open.length > 0 && <button type="button" className="ws-agoto" onClick={onOpen}>과제 탭에서 제출 →</button>}
    </section>
  )
}

// 과제 탭 본문.
export default function Assignments({ store }) {
  const { rows, subs, status, error, load } = useAssignments(store)
  const [filter, setFilter] = useState('전체')
  const [msg, setMsg] = useState('')
  const todayKey = useMemo(() => toKey(new Date()), [])

  async function submit(payload) {
    await store.submissions.submit(payload)
    setMsg('제출 반영됨')
    await load()
  }

  const sorted = useMemo(() => sortAssignments(rows, subs), [rows, subs])
  const shown = useMemo(() => filterAssignments(sorted, subs, filter), [sorted, subs, filter])
  const subOf = (r) => subs.find((s) => s.assignment_id === r.id) || null

  // 공통 프레임(ws-cols) — 본문 = 필터 칩(5건 이상에서만) + 카드 목록 / 레일 = 이번 주 + 내는 법.
  return (
    <div className="ws-assignments ws-cols">
      <div className="ws-cmain">
        {rows.length >= 5 && (
          <div className="ws-chips ws-nchips" role="tablist" aria-label="과제 보기">
            {FILTERS.map((f) => (
              <button
                key={f} type="button" role="tab" aria-selected={filter === f}
                className={`ws-chip${filter === f ? ' is-on' : ''}`} onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        )}
        <p className="ws-count-line">전체 <span className="ws-count">{rows.length}</span></p>
        {status === 'loading' && <div className="ws-skel" aria-label="불러오는 중"><span /><span /></div>}
        {error && <p className="ws-error" role="alert">{error}</p>}
        {msg && <p className="ws-ok" role="status">{msg}</p>}
        {status === 'ready' && rows.length === 0 && <p className="ws-note">과제 0건. 운영진이 올리면 여기서 낸다.</p>}
        {shown.length > 0 && (
          <ul className="ws-list ws-acard-list">
            {shown.map((r) => (
              <AssignmentCard
                key={`${r.id}:${subOf(r)?.id || 'new'}`}
                row={r} sub={subOf(r)} todayKey={todayKey} onSubmit={submit}
              />
            ))}
          </ul>
        )}
      </div>
      <aside className="ws-crail">
        <AssignmentRail rows={rows} subs={subs} todayKey={todayKey} />
      </aside>
    </div>
  )
}

export { HowLink }
