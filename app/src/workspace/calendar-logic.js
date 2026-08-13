// 홈 캘린더 순수 로직(2026-08-06 워크스페이스 홈 개편) — 화면 없는 계산만. 테스트 대상.
// 업무 항목 계약: { date:'YYYY-MM-DD', 제목, 종류('일정'|'세미나'|'모집'|'마감'|'과제'|'세션'), source }

const pad = (n) => String(n).padStart(2, '0')
export const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// 달력 격자 — 일요일 시작, 앞뒤 이웃달 채움 포함 5~6주. 셀 = { key, day, inMonth }
export function monthGrid(year, month /* 1~12 */) {
  const first = new Date(year, month - 1, 1)
  const start = new Date(year, month - 1, 1 - first.getDay())
  const weeks = []
  const cur = new Date(start)
  while (cur <= new Date(year, month - 1 + 1, 0) || cur.getDay() !== 0) {
    if (cur.getDay() === 0) weeks.push([])
    weeks[weeks.length - 1].push({ key: toKey(cur), day: cur.getDate(), inMonth: cur.getMonth() === month - 1 })
    cur.setDate(cur.getDate() + 1)
  }
  return weeks
}

// 날짜 문자열 정규화 — 'YYYY-MM-DD…' 앞 10자만 취함. 형식이 아니면 null(캘린더 미표시).
const dateKey = (v) => {
  const s = String(v || '').slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null
}

// 세 원천(운영 일정·과제 마감·세션)을 캘린더 항목 하나의 배열로 합친다.
// 중요(★, 2026-08-07 오너) — "다가오는 업무" 노출 플래그: 운영 일정은 events.중요(0010), 과제·세션 자동 항목 = false.
export function buildAgenda({ events = [], assignments = [], sessions = [] } = {}) {
  const items = []
  for (const e of events) {
    const date = dateKey(e['날짜'])
    if (date) items.push({ date, 제목: e['제목'], 종류: e['종류'] || '일정', 시간: e['시간'] || '', 설명: e['설명'] || '', 중요: Boolean(e['중요']), source: 'event', id: e.id })
  }
  for (const a of assignments) {
    const date = dateKey(a['마감'])
    if (date) items.push({ date, 제목: `과제 마감 — ${a['제목']}`, 종류: '과제', 시간: '', 설명: a['설명'] || '', 중요: false, source: 'assignment', id: a.id })
  }
  for (const s of sessions) {
    const date = dateKey(s['날짜'])
    if (date) items.push({ date, 제목: `${s['회차']}회차 · ${s['제목']}`, 종류: '세션', 시간: '', 설명: s['설명'] || '', 중요: false, source: 'session', id: s.id })
  }
  return items.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}

export const itemsOn = (items, key) => items.filter((i) => i.date === key)

// 주 판정(흐름 탭 공용 — 2026-08-13 Flow에서 이동) — 시작일~+6일 안에 오늘이 있으면 '이번 주',
// 지났으면 '지난', 아니면 '예정'. 순수 함수(테스트 대상).
export function weekStatus(startKey, todayKey) {
  const start = new Date(`${startKey}T12:00:00`)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const endKey = toKey(end)
  if (todayKey < startKey) return '예정'
  if (todayKey > endKey) return '지난'
  return '이번 주'
}

// 다가오는 업무 — ★ 지정 항목만(2026-08-07 오너: 전량 노출은 소음), 오늘 포함 이후 날짜순 상위 n건.
// 캘린더(itemsOn)는 전 항목 유지 — 필터는 이 리스트에만 적용된다.
export function upcoming(items, todayKey, n = 6) {
  return items.filter((i) => i['중요'] && i.date >= todayKey).slice(0, n)
}

// 주간 기고 과제(상시 주 1건 — 기고 투트랙 spec) — 마감 요일은 오너 확정 대기([미정]).
// dueDay(0=일~6=토)가 정해지면 그 요일마다 캘린더에 핀 — null인 동안은 상시 항목으로만 표시.
export const WEEKLY_CONTRIB = { label: '주간 기고 — 주 1건 상시 과제', dueDay: null }

// dueDay가 정해졌을 때: 기준일 이후 n주치 반복 항목 생성. null이면 빈 배열.
export function weeklyContribItems(todayKey, n = 4, dueDay = WEEKLY_CONTRIB.dueDay) {
  if (dueDay === null || dueDay === undefined) return []
  const base = new Date(`${todayKey}T12:00:00`)
  const first = new Date(base)
  first.setDate(base.getDate() + ((dueDay - base.getDay() + 7) % 7))
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(first)
    d.setDate(first.getDate() + i * 7)
    return { date: toKey(d), 제목: WEEKLY_CONTRIB.label, 종류: '과제', 시간: '', 설명: '', 중요: false, source: 'weekly', id: `weekly-${i}` }
  })
}

// D-day 라벨 — 캘린더 키 문자열끼리의 날짜 차이(시간대 영향 없게 정오 고정).
export function dday(fromKey, toKey2) {
  const diff = Math.round((new Date(`${toKey2}T12:00:00`) - new Date(`${fromKey}T12:00:00`)) / 86400000)
  if (diff === 0) return '오늘'
  return diff > 0 ? `D-${diff}` : `D+${-diff}`
}
