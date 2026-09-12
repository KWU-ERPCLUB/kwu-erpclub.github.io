// 과제 탭 계산 — 순수 함수만(화면 없음). 마감·상태·진행·정렬을 여기 한 곳에서 판정한다.
// 2026-09-13 과제 탭 신설: 구 Assignments.jsx(홈 안 섹션)의 dueLabel을 옮겨 오고, 3종 과제의 상태 판정을 붙였다.
import { toKey, dday } from './calendar-logic.js'
import { kindOf, formOf } from '../data/assignment-forms.js'

// 마감 상태 — 지난 마감이면 '마감됨'. 서버가 제출을 막지는 않는다(지각 제출 허용, 표시만).
// 표시는 로컬(KST) 시각 — 구 toISOString은 UTC라 마감시간이 9시간 어긋나 보였다(2026-08-06 수정).
export function dueLabel(due, now = new Date()) {
  if (!due) return '마감 없음'
  const at = new Date(due)
  if (Number.isNaN(at.getTime())) return '마감 없음'
  const p = (n) => String(n).padStart(2, '0')
  const text = `${toKey(at)} ${p(at.getHours())}:${p(at.getMinutes())}`   // 날짜 부분 = calendar-logic toKey 단일원천
  return at < now ? `마감됨 ${text}` : `마감 ${text}`
}

// 마감 날짜(YYYY-MM-DD) — D-day 계산·정렬에 쓰는 날짜만. 마감 없으면 null.
export const dueKeyOf = (row) => {
  const raw = row?.['마감']
  if (!raw) return null
  const at = new Date(raw)
  return Number.isNaN(at.getTime()) ? null : toKey(at)
}

// 남은 날 표기 — 마감 없으면 빈 문자열. 오늘 이전이면 표기하지 않는다(상태 pill이 '마감됨'을 말한다).
export function ddayLabel(row, todayKey) {
  const key = dueKeyOf(row)
  if (!key || key < todayKey) return ''
  return dday(todayKey, key)
}

export const isClosed = (row, now = new Date()) => {
  const raw = row?.['마감']
  if (!raw) return false
  const at = new Date(raw)
  return !Number.isNaN(at.getTime()) && at < now
}

// 체크리스트 진행 — 저장된 답변에서 true인 항목 수. 답변 없으면 0.
export function progressOf(form, sub) {
  const items = form?.items || []
  const answer = sub?.['답변'] || {}
  return { done: items.filter((it) => answer[it.key] === true).length, total: items.length }
}

// 제출로 인정하는가 — 링크형 = url 존재, 폼형 = 한 칸이라도 채움, 체크리스트형 = 전 항목 체크.
// 체크리스트를 "전부 체크"로 잡는 이유: 준비물은 하나라도 빠지면 OT에서 막힌다.
export function isSubmitted(row, sub) {
  if (!sub) return false
  const kind = kindOf(row)
  if (kind === '링크') return Boolean(sub.url)
  if (kind === '폼') return Object.values(sub['답변'] || {}).some((v) => String(v ?? '').trim() !== '')
  const { done, total } = progressOf(formOf(row), sub)
  return total > 0 && done === total
}

// 카드에 찍는 상태 — 3값. '제출함' > '마감됨' > '미제출'(제출했으면 늦었어도 제출함).
export function statusOf(row, sub, now = new Date()) {
  if (isSubmitted(row, sub)) return '제출함'
  return isClosed(row, now) ? '마감됨' : '미제출'
}

// 정렬 — ①미제출·마감 안 지난 것(마감 가까운 순) ②마감 없는 것 ③끝난 것(제출함·마감됨, 최근 마감 순).
export function sortAssignments(rows, subs = [], now = new Date()) {
  const subOf = (r) => subs.find((s) => s.assignment_id === r.id) || null
  const rank = (r) => (statusOf(r, subOf(r), now) === '미제출' ? (dueKeyOf(r) ? 0 : 1) : 2)
  return [...rows].sort((a, b) => {
    const ra = rank(a)
    const rb = rank(b)
    if (ra !== rb) return ra - rb
    const ka = dueKeyOf(a) || ''
    const kb = dueKeyOf(b) || ''
    if (ka !== kb) return ra === 2 ? (ka < kb ? 1 : -1) : (ka < kb ? -1 : 1)
    return String(a['제목']).localeCompare(String(b['제목']), 'ko')
  })
}

// 홈 요약·레일용 — 아직 낼 것이 남은 과제만(마감 지난 것 제외), 마감 가까운 순.
export function openAssignments(rows, subs = [], now = new Date()) {
  return sortAssignments(rows, subs, now).filter((r) => statusOf(r, subs.find((s) => s.assignment_id === r.id) || null, now) === '미제출')
}

export const FILTERS = ['전체', '남은 것', '제출함']

export function filterAssignments(rows, subs, filter, now = new Date()) {
  if (filter === '남은 것') return rows.filter((r) => statusOf(r, subs.find((s) => s.assignment_id === r.id) || null, now) !== '제출함')
  if (filter === '제출함') return rows.filter((r) => statusOf(r, subs.find((s) => s.assignment_id === r.id) || null, now) === '제출함')
  return rows
}
