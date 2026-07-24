// 메인(/) 순수 로직 — 마퀴 트랙·스탯 파싱·카운트업 프레임. 부수효과 0(테스트 대상).
// UI(App.jsx)가 IntersectionObserver·rAF로 이 순수 함수를 구동. reduced-motion = 즉시 최종값.

// 히어로 하단 키워드 마퀴 띠 — 다루는 주제(현업 용어=영문 정책 승계, 한글 주제 병기).
export const MARQUEE_KEYWORDS = [
  'AI 에이전트', '업무 자동화', 'MIS', '경영 데이터',
  '프롬프트', '노코드', '데이터 분석', '생성형 AI',
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
