// 세미나(SEMINARS) 순수 로직 — 예정/과거 분리·NEXT 선정. 전부 순수 함수(부수효과 0)로 테스트 대상.
// date 비교는 today 문자열('YYYY-MM-DD')을 인자로 받아 시계에 의존하지 않음(컴포넌트가 today 주입).
export { excerpt } from './insights-logic.js'

// all(세미나 목록) → { upcoming, past }. upcoming = date ≥ today(오름차순·최근접 먼저), past = date < today(역시간순).
// 문자열 'YYYY-MM-DD' 사전순 = 시간순이므로 그대로 비교.
export function splitByDate(all, today) {
  const upcoming = []
  const past = []
  for (const s of all || []) {
    if ((s.date || '') >= today) upcoming.push(s)
    else past.push(s)
  }
  upcoming.sort((a, b) => (a.date || '').localeCompare(b.date || ''))
  past.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  return { upcoming, past }
}

// NEXT 히어로 = 예정 중 최근접 1건. 예정 0건이면 null.
export function nextSeminar(all, today) {
  return splitByDate(all, today).upcoming[0] || null
}

// 로컬 날짜 'YYYY-MM-DD'. Date 인자를 받아(기본 = 지금) 테스트 시 고정 시각 주입 가능.
export function todayString(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
