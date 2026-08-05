// 신청 폼 데이터 출처(/recruit) — 공개면이 data/index.js에 닿는 화이트리스트 어댑터(insights-source.js 전례).
// 규칙(오너 확정 2026-08-05):
//   env 2종 설정됨 → applications 테이블 insert(RLS = 익명 insert만).
//   env 미설정     → 제출 경로 자체가 없다 — 폼 대신 "제출 불가" 안내(목 폴백으로 성공하는 척 금지).
import { getRepositories, isBackendConfigured, isHakbeon } from '../data/index.js'

export const EMPTY_APPLICATION = { 이름: '', 학번: '', 전공: '', 전화번호: '', 써본ai: '', 관심주제: '' }

// 접수 가능 여부 = 백엔드 연결 여부 그대로(모집 창 국면과 무관 — 창 표시는 data/recruit.js 소관).
export function isApplyOpen(env) {
  return isBackendConfigured(env)
}

// 전화번호 = 느슨한 형식(오너 확정): 숫자·하이픈만 + 숫자 9~11자리.
const PHONE_CHARS = /^[0-9-]+$/

// 반환 = { 필드명: 오류 문구 } — 비면 통과. 폼이 문구를 그대로 보여준다.
export function validateApplication(form) {
  const errors = {}
  if (!String(form['이름'] || '').trim()) errors['이름'] = '이름 입력 필요'
  if (!isHakbeon(form['학번'])) errors['학번'] = '학번은 숫자만(4~12자리)'
  if (!String(form['전공'] || '').trim()) errors['전공'] = '학부/전공 입력 필요'
  const phone = String(form['전화번호'] || '').trim()
  const digits = phone.replace(/-/g, '')
  if (!PHONE_CHARS.test(phone) || digits.length < 9 || digits.length > 11) {
    errors['전화번호'] = '전화번호는 숫자·하이픈으로(숫자 9~11자리)'
  }
  return errors
}

// repos·configured = 테스트 주입구(네트워크 없이 검증). 미연결이면 조용한 성공 대신 즉시 오류.
export async function submitApplication(form, { repos, configured } = {}) {
  const ready = configured === undefined ? isBackendConfigured() : configured
  if (!ready) throw new Error('접수 서버 미연결 — 현재 제출 불가')
  const store = repos || getRepositories()
  await store.applications.submit({
    이름: String(form['이름']).trim(),
    학번: String(form['학번']).trim(),
    전공: String(form['전공']).trim(),
    전화번호: String(form['전화번호']).trim(),
    써본ai: String(form['써본ai'] || '').trim(),
    관심주제: String(form['관심주제'] || '').trim(),
  })
  return true
}
