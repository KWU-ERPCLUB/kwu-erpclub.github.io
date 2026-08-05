// 메인(/) 순수 로직 — 마퀴 트랙·스탯 파싱·카운트업 프레임. 부수효과 0(테스트 대상).
// UI(App.jsx)가 IntersectionObserver·rAF로 이 순수 함수를 구동. reduced-motion = 즉시 최종값.
import { RECRUIT } from './data/recruit.js'
import { isUpcoming } from './pages/seminars-logic.js'

// 히어로 하단 키워드 마퀴 띠 — 다루는 주제(현업 용어=영문 정책 승계, 한글 주제 병기).
export const MARQUEE_KEYWORDS = [
  'AI 에이전트', '업무 자동화', 'MIS', '경영 데이터',
  '프롬프트', '노코드', '데이터 분석', '생성형 AI',
  'LLM', 'RAG', 'ADsP', 'SQLD', 'ERP', 'SAP',
]

// 무한 마퀴 = 트랙을 2배 복제해 이음매 없이 순환(CSS translateX -50%로 되돌아와 반복).
export function marqueeTrack(items) {
  return [...items, ...items]
}

// 스탯 문자열 파싱 — '69.2%' → { prefix:'', value:69.2, decimals:1, suffix:'%' }.
// 숫자 앞뒤 텍스트(접두·접미)와 소수 자릿수를 분리해 카운트업이 형식을 보존.
export function parseStat(s) {
  const m = String(s).match(/^(\D*)(\d+(?:\.(\d+))?)(.*)$/s)
  if (!m) return { prefix: '', value: 0, decimals: 0, suffix: String(s) }
  return { prefix: m[1] || '', value: parseFloat(m[2]), decimals: m[3] ? m[3].length : 0, suffix: m[4] || '' }
}

// 로컬 기준 오늘을 YYYY-MM-DD로 — 문자열 비교로 시간대 함정 회피.
export function localYmd(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// 모집 국면 — before(예정) / open(모집 중, 경계일 포함) / after(다음 기수 안내. SPEC §4 전환 규칙).
// 창의 유일 원천 = data/recruit.js RECRUIT.window(주입 가능).
export function recruitPhase(ymd, win = RECRUIT.window) {
  if (ymd < win.start) return 'before'
  if (ymd > win.end) return 'after'
  return 'open'
}

// ── RECORD 밴드 파생 집계(정직성 수정 2026-08-05) ──
// 구현: 세미나 건수를 loadContent 길이 그대로 썼더니 "예정"(일정미정) 1건이 기록 1로 집계됐다.
// 규칙 = 개최 완료만 기록 — 예정 판정의 유일 원천 = seminars-logic.isUpcoming(목록 배지와 같은 규칙).
export function heldSeminars(all, ymd) {
  return (all || []).filter((s) => !isUpcoming(s, ymd))
}

// ADsP 1기 시험일 — 이 날짜 이후 "진행 중"은 허위가 된다(시험 종료 = 기수 완주).
export const ADSP_EXAM_YMD = '2026-08-08'

// RECORD 4번째 셀 [수치, 라벨, 출처] — 시험일 경계로 진행 중 → 완주 전환.
export function studyCell(ymd) {
  return ymd <= ADSP_EXAM_YMD
    ? ['1', '진행 중 스터디', 'ADsP 1기 — 진도 보드 운영']
    : ['1', '완주 스터디', 'ADsP 1기 — 진도 보드 운영 완료']
}

// ease-out cubic — 카운트업 감속(끝에서 부드럽게 멈춤).
export function easeOutCubic(t) {
  const p = Math.max(0, Math.min(1, t))
  return 1 - Math.pow(1 - p, 3)
}

// 진행도(0~1)에서의 카운트업 표시 문자열. progress=0 → 0, progress=1 → 원본값 복원.
export function countupFrame(stat, progress) {
  const v = stat.value * easeOutCubic(progress)
  return `${stat.prefix}${v.toFixed(stat.decimals)}${stat.suffix}`
}
