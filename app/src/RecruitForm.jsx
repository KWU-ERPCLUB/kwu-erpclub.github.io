// /recruit 신청 폼(온사이트 접수 — 오너 보류 해제 2026-08-05 · 2026-08-18 전면 개편 + 같은 날 2차 손질).
// 2차(오너 2026-08-18): 학번 = 숫자 10자리 엄격 + 전화번호 예시 + AI 목록 2026-08-18 기준 갱신 +
// 기타 = 체크 그룹 안으로 통합(별도 필드 폐지) + 주제 = "관심 있는 주제"(+기타 자유 입력) +
// 마지막 칸 = 지원 계기(최대 500자) + 설명 = 제목 아래 블록(.rc-desc) + 제출 버튼 중앙.
// 체크값은 기존 text 컬럼(써본ai·관심주제)에 합성 문자열로 저장(apply-source compose*), 지원계기 = 0017 컬럼.
// env 미설정 = 폼 미표시 + 제출 불가 안내(목 폴백으로 성공하는 척 금지 — 오너 확정).
import { useState } from 'react'
import {
  EMPTY_APPLICATION, APPLY_NOTE, applyPhase, isBackendReady, REASON_MAX,
  validateApplication, submitApplication, composeAiText, composeTopicText,
} from './pages/apply-source.js'
import { localYmd } from './home-logic.js'
import { CONTACT, CONTACT_MAILTO, PRIVACY_NOTE, RECRUIT_TOPICS } from './data/recruit.js'

// [키, 라벨, 보조 설명] — 필수 4(세로 1열). 설명은 라벨 아래 블록으로 렌더.
const REQUIRED_FIELDS = [
  ['이름', '이름', ''],
  ['학번', '학번', '숫자 10자리 (예: 2021508001)'],
  ['전공', '학부/전공', ''],
  ['전화번호', '전화번호', '하이픈 포함 (예: 010-1234-5678)'],
]

// 써본 AI 체크 선택지 — 2026-08-18 기준 목록(오너 지시: 클로드 코드·코덱스 등 누락분 보강).
// '없음'도 유효한 답(초심자 환영이 모집 방침). 목록 밖 도구 = 기타 체크(CheckGroup 내장 입력).
const AI_OPTIONS = [
  'ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'Claude Code', 'Codex',
  'Cursor', 'Copilot', 'NotebookLM', 'Grok', 'DeepSeek', '뤼튼', '없음',
]

// 기타 체크값 — 합성 시 제외하고 입력 텍스트만 쓴다(compose* 호출부에서 필터).
export const ETC = '기타'

// 체크 그룹 공용 — fieldset + 체크박스 목록(구글폼 문법). checked = 배열 상태.
// desc = 제목(legend) 아래 블록 설명. etc 3종 주면 '기타' 체크 + 체크 시 텍스트 입력 노출.
function CheckGroup({ legend, desc, options, checked, onToggle, etcValue, onEtcChange, etcPlaceholder }) {
  const hasEtc = onEtcChange !== undefined
  const etcOn = checked.includes(ETC)
  return (
    <fieldset className="rc-field rc-checkset">
      <legend>{legend}</legend>
      {desc && <p className="rc-desc">{desc}</p>}
      <div className="rc-checks">
        {options.map((opt) => (
          <label key={opt} className="rc-check">
            <input type="checkbox" checked={checked.includes(opt)} onChange={() => onToggle(opt)} />
            {opt}
          </label>
        ))}
        {hasEtc && (
          <label className="rc-check">
            <input type="checkbox" checked={etcOn} onChange={() => onToggle(ETC)} />
            {ETC}
          </label>
        )}
      </div>
      {hasEtc && etcOn && (
        <input
          className="rc-etc-input" type="text" value={etcValue} onChange={onEtcChange}
          placeholder={etcPlaceholder} aria-label={`${legend} — 기타 직접 입력`}
        />
      )}
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
        써본ai: composeAiText(aiChecks.filter((v) => v !== ETC), aiChecks.includes(ETC) ? aiEtc : ''),
        관심주제: composeTopicText(topicChecks.filter((v) => v !== ETC), topicChecks.includes(ETC) ? form['관심주제'] : ''),
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
          </label>
          {hint && <span className="rc-desc">{hint}</span>}
          <input
            id={`ap-${key}`} type={key === '전화번호' ? 'tel' : 'text'} value={form[key]}
            onChange={set(key)} aria-invalid={Boolean(errors[key])}
          />
          {errors[key] && <span className="rc-field-error" role="alert">{errors[key]}</span>}
        </p>
      ))}

      <CheckGroup
        legend="지금까지 써본 AI" desc="중복 선택 가능"
        options={AI_OPTIONS} checked={aiChecks} onToggle={toggleOf(setAiChecks)}
        etcValue={aiEtc} onEtcChange={(e) => setAiEtc(e.target.value)}
        etcPlaceholder="목록에 없는 도구 이름"
      />

      <CheckGroup
        legend="관심 있는 주제" desc="추후 프로젝트 구성 시 참조. 중복 선택 가능"
        options={RECRUIT_TOPICS} checked={topicChecks} onToggle={toggleOf(setTopicChecks)}
        etcValue={form['관심주제']} onEtcChange={set('관심주제')}
        etcPlaceholder="그 외 다루고 싶은 주제"
      />

      <p className="rc-field">
        <label htmlFor="ap-지원계기">지원 계기</label>
        <span className="rc-desc">이 스터디에 지원하게 된 계기 (최대 {REASON_MAX}자)</span>
        <textarea
          id="ap-지원계기" rows={5} maxLength={REASON_MAX}
          value={form['지원계기']} onChange={set('지원계기')}
        />
        {errors['지원계기'] && <span className="rc-field-error" role="alert">{errors['지원계기']}</span>}
      </p>

      <p className="rc-form-privacy">{PRIVACY_NOTE}</p>
      {failure && <p className="rc-field-error" role="alert">{failure}</p>}
      <button className="rc-cta-xl rc-form-submit" type="submit" disabled={phase === 'busy'}>
        {phase === 'busy' ? '제출 중' : '신청 제출'}
      </button>
    </form>
  )
}
