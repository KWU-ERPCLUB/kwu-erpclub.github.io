// 공고 열람 기록(2026-08-20 오너 — "공고가 많아지면 뭘 봤는지 헷갈린다") — 인사이트 seen-store와 동형.
// 규칙: N 배지 = 등록(created_at) 7일 이내 ∧ 이 기기에서 원문을 연 적 없음. 열람한 행 = 제목 흐림(본 공고 표기).
// 브라우저 localStorage(기기 로컬·계정 무관). 저장 차단(사생활 모드)·SSR = 빈 집합 강등 — 배지가 안 뜰 뿐 기능 정상.

const KEY = 'erpclub.postings.seen'
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

export function markSeen(id, storage = box()) {
  const seen = loadSeen(storage)
  if (!id || seen.has(id)) return seen
  seen.add(id)
  try {
    storage?.setItem(KEY, JSON.stringify([...seen]))
  } catch {
    /* 저장 차단 = 배지만 다시 뜸 — 치명 아님 */
  }
  return seen
}

// 순수 판정 — 등록 7일 이내 && 미열람. created_at = timestamptz 문자열(날짜부만 사용), todayKey = 'YYYY-MM-DD'.
export function isNewPosting(row, seen, todayKey) {
  if (!row?.created_at || seen.has(row.id)) return false
  const created = String(row.created_at).slice(0, 10)
  const diff = Math.round((new Date(`${todayKey}T12:00:00`) - new Date(`${created}T12:00:00`)) / 86400000)
  return diff >= 0 && diff < 7
}
