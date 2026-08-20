// 메인(/) 순수 로직 — 스탯 파싱·카운트업 프레임·모집 국면. 부수효과 0(테스트 대상).
// UI(App.jsx)가 IntersectionObserver·rAF로 이 순수 함수를 구동. reduced-motion = 즉시 최종값.
// (구 히어로 키워드 마퀴 MARQUEE_KEYWORDS·marqueeTrack = 2026-08-20 삭제 — 화면에서 걷힌 뒤 참조 0으로 남아 있던 잔재.)
import { RECRUIT } from './data/recruit.js'

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

// ── RECORD 밴드 파생 집계 ──
// 세미나 셀 = 밴드에서 제거(2026-08-05 오너 — 신생 스터디 원칙: 0건 지표 미게재. 개최 시작 후 재도입 검토).

// ADsP 1기 시험일 — 이 날짜 이후 "진행 중"은 허위가 된다(시험 종료 = 기수 완주).
const ADSP_EXAM_YMD = '2026-08-08'

// RECORD 3번째 셀 [수치, 라벨, 출처] — 라벨 = 기수명 고정(오너 2026-08-15), 진행/완주 구분은 출처 줄이 진다.
export function studyCell(ymd) {
  return ymd <= ADSP_EXAM_YMD
    ? ['1', 'ADsP 1기', '진도 보드 운영 중']
    : ['1', 'ADsP 1기', '6주 운영 완주']
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
