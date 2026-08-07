// 인사이트 열람 기록(2026-08-07 오너) — "안 본 글 N 배지"의 원천. 브라우저 localStorage(기기 로컬·계정 무관).
// 규칙: N 배지 = 게재일이 7일 이내 ∧ 이 기기에서 상세를 연 적 없음. 7일 지나면 자동 소멸(저장 불필요).
// 저장소 차단(사생활 모드)·SSR = 빈 집합으로 강등 — 배지가 안 뜰 뿐 기능은 정상.

const KEY = 'erpclub.insights.seen'
const box = () => (typeof localStorage !== 'undefined' ? localStorage : null)

export function loadSeen(storage = box()) {
  try {
    const raw = storage?.getItem(KEY)
    const list = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(list) ? list : [])
  } catch {
    return new Set()
  }
}

export function markSeen(slug, storage = box()) {
  const seen = loadSeen(storage)
  if (!slug || seen.has(slug)) return seen
  seen.add(slug)
  try {
    storage?.setItem(KEY, JSON.stringify([...seen]))
  } catch {
    /* 저장 차단 = 배지만 다시 뜸 — 치명 아님 */
  }
  return seen
}

// 순수 판정 — 게재 7일 이내 && 미열람. todayKey = 'YYYY-MM-DD'(주입 = 테스트 가능).
export function isNew(a, seen, todayKey) {
  if (!a?.date || seen.has(a.slug)) return false
  const diff = Math.round((new Date(`${todayKey}T12:00:00`) - new Date(`${a.date}T12:00:00`)) / 86400000)
  return diff >= 0 && diff < 7
}
