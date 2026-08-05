// 공개 헤더 전용 — "로그인 세션이 있느냐"만 동기로 답한다(M3 §4 로그인 상태 동적 표시).
// 규칙: 네트워크 호출 0 · 토큰 해석 0 · 저장소 접근 1회. 공개 페이지의 정적성·성능을 훼손하지 않기 위함.
// 판정 정확도는 목적이 아니다 — 만료 세션이 남아 있으면 링크만 보이고, 진입 시 로그인 폼이 받는다.
import { SESSION_KEY } from './session-key.js'

export function hasWorkspaceSession(storage) {
  const box = storage !== undefined
    ? storage
    : (typeof localStorage !== 'undefined' ? localStorage : null)
  if (!box) return false
  try {
    return Boolean(box.getItem(SESSION_KEY))
  } catch {
    return false   // 저장소 차단(사생활 보호 모드) = 비로그인 취급
  }
}
