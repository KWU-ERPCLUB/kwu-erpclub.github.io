// 학번 로그인 매핑 — SPEC §0-4(개정 2026-08-05): 입력 UI는 학번만, 내부는 가상 이메일.
// 규칙 원천 = 이 파일 하나(마이그레이션 0003 주석이 같은 규칙을 참조).
//   숫자열 학번 "2021123456" → "s2021123456@member.erpclub"
//   '@' 포함 입력          → 그대로 이메일(오너·운영진 폴백)
// 도메인은 실존하지 않아도 된다 — 메일 발송 기능 없음(§7 킬 목록: 알림/메일 발송).

export const MEMBER_EMAIL_DOMAIN = 'member.erpclub'
const HAKBEON = /^[0-9]{4,12}$/

// 입력 정규화 — 앞뒤 공백·전각 공백 제거. 숫자 사이 공백·하이픈은 제거하지 않는다(오타를 삼키지 않기 위함).
export function normalizeLoginId(input) {
  return String(input ?? '').replace(/[\s　]/g, '')
}

export function isHakbeon(input) {
  return HAKBEON.test(normalizeLoginId(input))
}

// 로그인 식별자 → GoTrue에 보낼 이메일. 형식 위반이면 Error(폼이 메시지를 그대로 보여준다).
export function toLoginEmail(input) {
  const v = normalizeLoginId(input)
  if (!v) throw new Error('학번 입력 필요')
  if (v.includes('@')) return v
  if (!HAKBEON.test(v)) throw new Error('학번은 숫자만(4~12자리)')
  return `s${v}@${MEMBER_EMAIL_DOMAIN}`
}
