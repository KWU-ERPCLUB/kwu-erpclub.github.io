// 신청 폼 데이터 출처(/recruit) — 공개면이 data/index.js에 닿는 화이트리스트 어댑터(insights-source.js 전례).
// 규칙(오너 확정 2026-08-05):
//   env 2종 설정됨 → applications 테이블 insert(RLS = 익명 insert만).
//   env 미설정     → 제출 경로 자체가 없다 — 폼 대신 "제출 불가" 안내(목 폴백으로 성공하는 척 금지).
import { getRepositories, isBackendConfigured, isHakbeon } from '../data/index.js'
import { RECRUIT } from '../data/recruit.js'
import { localYmd, recruitPhase } from '../home-logic.js'

export const EMPTY_APPLICATION = { 이름: '', 학번: '', 전공: '', 전화번호: '', 써본ai: '', 관심주제: '' }

// 접수 국면 = 모집 창 파생 + **사전 접수 개방**(오너 2026-08-18: "미리 받아도 문제없다" — before도 폼 개방).
// 창의 유일 원천 = data/recruit.js RECRUIT.window(home-logic.recruitPhase 재사용) — 모집 밴드 국면 전환은 그대로.
// 마감 후(after)만 폼을 닫는다. 개발용 오버라이드 = VITE_APPLY_FORCE_OPEN=1(로컬 폼 점검 — 프로덕션 미설정).
export function applyPhase(today = localYmd(), env = import.meta.env) {
  if (env && String(env.VITE_APPLY_FORCE_OPEN) === '1') return 'open'
  const phase = recruitPhase(today)
  return phase === 'before' ? 'open' : phase
}

// 창 시작 전인지(사전 접수 구간) — 폼 위 안내 한 줄에 쓴다.
export const isEarlyApply = (today = localYmd()) => recruitPhase(today) === 'before'

// 국면별 안내 문구(개조식) — after만 폼 대신 렌더. EARLY = 사전 접수 구간에 폼 위에 붙는 한 줄.
export const APPLY_NOTE = {
  after: '모집 마감 — 다음 기수는 메인·모집 페이지에 공지.',
}
export const APPLY_EARLY_NOTE = `정식 모집 ${RECRUIT.window.start} ~ ${RECRUIT.window.end} — 지금 제출해도 접수분으로 인정.`

// 접수 가능 = 모집 창 open ∧ 백엔드 연결. 둘은 별개 축이라 안내 문구도 각각 다르다(RecruitForm 분기).
export function isApplyOpen(env, today = localYmd()) {
  return applyPhase(today, env) === 'open' && isBackendConfigured(env)
}

// 백엔드 연결 여부만 — 화면(RecruitForm)이 data/index.js를 직접 import 하지 않도록 어댑터가 재수출(경계 P4).
export function isBackendReady(env) {
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
