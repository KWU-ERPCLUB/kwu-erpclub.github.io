// /recruit 신청 폼(온사이트 접수 — 오너 보류 해제 2026-08-05 · 2026-08-18 전면 개편).
// 개편(오너 2026-08-18): 전 항목 세로 1열 + 폼 중앙 정렬 + 필수 = 빨간 *(구글폼 문법) +
// 써본 AI = 체크형(+기타 입력) + 팀 프로젝트 주제 관심 체크(원천 = data/recruit.js RECRUIT_TOPICS).
// 체크값은 기존 text 컬럼(써본ai·관심주제)에 합성 문자열로 저장(스키마 무변경 — apply-source compose*).
// env 미설정 = 폼 미표시 + 제출 불가 안내(목 폴백으로 성공하는 척 금지 — 오너 확정).
import { useState } from 'react'
import {
  EMPTY_APPLICATION, APPLY_NOTE, applyPhase, isBackendReady,
  validateApplication, submitApplication, composeAiText, composeTopicText,
} from './pages/apply-source.js'
import { localYmd } from './home-logic.js'
import { CONTACT, CONTACT_MAILTO, PRIVACY_NOTE, RECRUIT_TOPICS } from './data/recruit.js'

// [키, 라벨, 보조 설명] — 필수 4(세로 1열)
const REQUIRED_FIELDS = [
  ['이름', '이름', ''],
  ['학번', '학번', '숫자 4~12자리'],
  ['전공', '학부/전공', ''],
  ['전화번호', '전화번호', '숫자·하이픈'],
]

// 써본 AI 체크 선택지 — 흔한 도구 6 + 기타(직접 입력). '없음'도 유효한 답(초심자 환영이 모집 방침).
const AI_OPTIONS = ['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Perplexity', '없음']

// 체크 그룹 공용 — fieldset + 체크박스 목록(구글폼 문법). checked = 배열 상태.
function CheckGroup({ legend, hint, options, checked, onToggle }) {
  return (
    <fieldset className="rc-field rc-checkset">
      <legend>{legend}<span className="rc-hint">{hint}</span></legend>
      <div className="rc-checks">
        {options.map((opt) => (
          <label key={opt} className="rc-check">
            <input type="checkbox" checked={checked.includes(opt)} onChange={() => onToggle(opt)} />
            {opt}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

// 렌더 3분기 = 모집 창 국면(before·open·after) → 창 안이면 백엔드 연결 여부.
// today·configured = 테스트 주입구(기본 = 실제 오늘·env 판정).
export default function RecruitForm({ configured, repos, today = localYmd() }) {
  const window국면 = applyPhase(today)
  const open = configured === undefined ? isBackendReady() : configured
  const [form, setForm] = useState(EMPTY_APPLICATION)
  const [aiChecks, setAiChecks] = useState([])
  const [aiEtc, setAiEtc] = useState('')
  const [topicChecks, setTopicChecks] = useState([])
  const [errors, setErrors] = useState({})
  const [phase, setPhase] = useState('idle')      // idle | busy | done
  const [failure, setFailure] = useState('')

  if (window국면 !== 'open') {
    return <p className="rc-callout">{APPLY_NOTE[window국면]}</p>
  }
  if (!open) {
    return (
      <p className="rc-callout">
        현재 온라인 접수를 받을 수 없습니다.
        참여 문의 = <a href={CONTACT_MAILTO}>{CONTACT.email}</a>
        {' '}· <a href="/#faq">자주 묻는 질문</a>.
      </p>
    )
  }
  if (phase === 'done') {
    return <p className="rc-form-done" role="status">신청 접수 완료. 모집 기간 내 개별 연락드립니다.</p>
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const toggleOf = (setter) => (opt) => setter((prev) => (prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt]))

  async function onSubmit(e) {
    e.preventDefault()
    const found = validateApplication(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setPhase('busy')
    setFailure('')
    try {
      await submitApplication({
        ...form,
        써본ai: composeAiText(aiChecks, aiEtc),
        관심주제: composeTopicText(topicChecks, form['관심주제']),
      }, { repos, configured: open })
      setPhase('done')
    } catch (err) {
      setPhase('idle')
      setFailure(err?.message || '제출 실패 — 다시 시도')
    }
  }

  return (
    <form className="rc-form" onSubmit={onSubmit} noValidate>
      {REQUIRED_FIELDS.map(([key, label, hint]) => (
        <p className="rc-field" key={key}>
          <label htmlFor={`ap-${key}`}>
            {label} <span className="rc-req" aria-label="필수">*</span>
            {hint && <span className="rc-hint">{hint}</span>}
          </label>
          <input
            id={`ap-${key}`} type={key === '전화번호' ? 'tel' : 'text'} value={form[key]}
            onChange={set(key)} aria-invalid={Boolean(errors[key])}
          />
          {errors[key] && <span className="rc-field-error" role="alert">{errors[key]}</span>}
        </p>
      ))}

      <CheckGroup
        legend="지금까지 써본 AI" hint="해당하는 것 모두 체크(선택)"
        options={AI_OPTIONS} checked={aiChecks} onToggle={toggleOf(setAiChecks)}
      />
      <p className="rc-field rc-etc">
        <label htmlFor="ap-ai-etc">기타 도구<span className="rc-hint">목록에 없는 도구 이름(선택)</span></label>
        <input id="ap-ai-etc" type="text" value={aiEtc} onChange={(e) => setAiEtc(e.target.value)} />
      </p>

      <CheckGroup
        legend="팀 프로젝트 주제 — 관심 있는 것" hint="2차 구간 팀 주제 후보. 관심 가는 것 모두 체크(선택)"
        options={RECRUIT_TOPICS} checked={topicChecks} onToggle={toggleOf(setTopicChecks)}
      />

      <p className="rc-field">
        <label htmlFor="ap-관심주제">그 외 다루고 싶은 주제<span className="rc-hint">자유 서술(선택)</span></label>
        <textarea id="ap-관심주제" rows={3} value={form['관심주제']} onChange={set('관심주제')} />
      </p>

      <p className="rc-form-privacy">{PRIVACY_NOTE}</p>
      {failure && <p className="rc-field-error" role="alert">{failure}</p>}
      <button className="rc-cta-xl rc-form-submit" type="submit" disabled={phase === 'busy'}>
        {phase === 'busy' ? '제출 중' : '신청 제출'}
      </button>
    </form>
  )
}
