// /recruit 신청 폼(온사이트 접수 — 오너 보류 해제 2026-08-05). 데이터 출처 = pages/apply-source.js 어댑터만.
// 모집 창 밖 = 폼 미표시 + 국면 안내(before = 접수 시작일 / after = 다음 기수 공지) — 상시 접수 금지.
// env 미설정 = 폼 미표시 + 제출 불가 안내(목 폴백으로 성공하는 척 금지 — 오너 확정).
import { useState } from 'react'
import {
  EMPTY_APPLICATION, APPLY_NOTE, applyPhase, isBackendReady,
  validateApplication, submitApplication,
} from './pages/apply-source.js'
import { localYmd } from './home-logic.js'

// [키, 라벨, 보조 설명] — 필수 4 + 자유 서술 2(선택)
const REQUIRED_FIELDS = [
  ['이름', '이름', ''],
  ['학번', '학번', '숫자 4~12자리'],
  ['전공', '학부/전공', ''],
  ['전화번호', '전화번호', '숫자·하이픈'],
]
const FREE_FIELDS = [
  ['써본ai', '지금까지 써본 AI', '도구 이름·용도 자유 서술(선택)'],
  ['관심주제', '관심 있는 주제', '스터디에서 다루고 싶은 것 자유 서술(선택)'],
]

// 렌더 3분기(2026-08-05) = 모집 창 국면(before·open·after) → 창 안이면 백엔드 연결 여부.
// today·configured = 테스트 주입구(기본 = 실제 오늘·env 판정).
export default function RecruitForm({ configured, repos, today = localYmd() }) {
  const window국면 = applyPhase(today)
  const open = configured === undefined ? isBackendReady() : configured
  const [form, setForm] = useState(EMPTY_APPLICATION)
  const [errors, setErrors] = useState({})
  const [phase, setPhase] = useState('idle')      // idle | busy | done
  const [failure, setFailure] = useState('')

  if (window국면 !== 'open') {
    return <p className="rc-callout">{APPLY_NOTE[window국면]}</p>
  }
  if (!open) {
    return (
      <p className="rc-callout">
        온라인 접수 = 현재 서버 미연결 — 이 페이지에서 제출 불가.
        참여 문의 = 스터디 단톡방(<a href="/#faq">자주 묻는 질문</a> 참조).
      </p>
    )
  }
  if (phase === 'done') {
    return <p className="rc-form-done" role="status">신청 접수 완료 — 모집 기간 내 개별 연락.</p>
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    const found = validateApplication(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setPhase('busy')
    setFailure('')
    try {
      await submitApplication(form, { repos, configured: open })
      setPhase('done')
    } catch (err) {
      setPhase('idle')
      setFailure(err?.message || '제출 실패 — 다시 시도')
    }
  }

  return (
    <form className="rc-form" onSubmit={onSubmit} noValidate>
      <div className="rc-form-grid">
        {REQUIRED_FIELDS.map(([key, label, hint]) => (
          <p className="rc-field" key={key}>
            <label htmlFor={`ap-${key}`}>{label} <span className="rc-req">필수</span>{hint && <span className="rc-hint"> — {hint}</span>}</label>
            <input
              id={`ap-${key}`} type={key === '전화번호' ? 'tel' : 'text'} value={form[key]}
              onChange={set(key)} aria-invalid={Boolean(errors[key])}
            />
            {errors[key] && <span className="rc-field-error" role="alert">{errors[key]}</span>}
          </p>
        ))}
      </div>
      {FREE_FIELDS.map(([key, label, hint]) => (
        <p className="rc-field" key={key}>
          <label htmlFor={`ap-${key}`}>{label}<span className="rc-hint"> — {hint}</span></label>
          <textarea id={`ap-${key}`} rows={3} value={form[key]} onChange={set(key)} />
        </p>
      ))}
      <p className="rc-form-privacy">제출 정보 용도 = 모집 연락·기수 운영 — 그 외 사용 없음.</p>
      {failure && <p className="rc-field-error" role="alert">{failure}</p>}
      {/* v3.1(2026-08-05) — 제출 = 대형 CTA 승계(시각만 — 로직·상태 무변경) */}
      <button className="rc-cta-xl rc-form-submit" type="submit" disabled={phase === 'busy'}>
        {phase === 'busy' ? '제출 중' : '신청 제출'}
      </button>
    </form>
  )
}
