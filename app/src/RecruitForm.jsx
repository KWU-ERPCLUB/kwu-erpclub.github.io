// /recruit 신청 폼(온사이트 접수 — 오너 보류 해제 2026-08-05 · 2026-08-18 전면 개편 + 같은 날 2차 손질).
// 2차(오너 2026-08-18): 학번 = 숫자 10자리 엄격 + 전화번호 예시 + AI 목록 2026-08-18 기준 갱신 +
// 기타 = 체크 그룹 안으로 통합(별도 필드 폐지) + 주제 = "관심 있는 주제"(+기타 자유 입력) +
// 마지막 칸 = 지원 계기(최대 500자) + 설명 = 제목 아래 블록(.rc-desc) + 제출 버튼 중앙.
// 체크값은 기존 text 컬럼(써본ai·관심주제)에 합성 문자열로 저장(apply-source compose*), 지원계기 = 0017 컬럼.
// env 미설정 = 폼 미표시 + 제출 불가 안내(목 폴백으로 성공하는 척 금지 — 오너 확정).
// 3차(오너 2026-08-21 — 진입장벽 완화): AI 활용 수준 설문 2문항 신설(빈도 단일 + 해본 것 다중, 둘 다 선택 항목,
// 써본ai 컬럼에 합성 저장 = 스키마 무변경) + 마지막 칸 = 지원 계기 → "AI를 왜 배우고 싶은가"(형식적 지원 동기 폐기).
// 입력 위젯 3종·선택지 상수 = recruit-form-parts.jsx(300줄 규격 분리).
// 5차(오너 2026-09-04 — "제출이 안 된다" 신고 수리): 검증 실패가 화면 밖에서만 표시돼(학번 오류 ↔ 제출 버튼 1,876px)
//   버튼을 눌러도 아무 일도 안 일어나는 것처럼 보였다. 수리 = ① 버튼 옆 요약(어느 칸이 걸렸는지 이름으로)
//   ② 첫 오류 칸으로 포커스+스크롤 복귀 ③ 학번 예시 게재(2026-08-18 '예시 미게재' 규칙을 오너가 이 필드만 해제).
//   학번 자릿수(숫자 10자리)는 유지 — 오너 확정.
import { useState } from 'react'
import {
  EMPTY_APPLICATION, APPLY_NOTE, applyPhase, isBackendReady, REASON_MAX, isValidHakbeon, formatPhone,
  validateApplication, submitApplication, composeAiText, composeTopicText, composeMajorText,
  composeAiProfile,
} from './pages/apply-source.js'
import { localYmd } from './home-logic.js'
import {
  CONTACT, CONTACT_MAILTO, PRIVACY_NOTE, RECRUIT_TOPICS, KWU_MAJORS,
  AI_USAGE_LEVELS, AI_SKILLS,
} from './data/recruit.js'
import { Req, ETC, AI_GROUPS, CheckGroup, RadioGroup } from './recruit-form-parts.jsx'

// 검증 실패 복귀 표 — 순서 = 폼에 놓인 순서(첫 오류로 되돌아간다), 라벨 = 화면 문구와 동일,
// 입력 id = 포커스 대상. 전공은 '기타(직접 입력)' 모드면 select가 아니라 직접 입력 칸으로 돌려보낸다.
const FIELD_ORDER = ['이름', '학번', '전공', '전화번호', '지원계기']
const FIELD_LABEL = { 이름: '이름', 학번: '학번', 전공: '학부/전공', 전화번호: '전화번호', 지원계기: '지원 계기' }
const FIELD_INPUT = { 이름: 'ap-이름', 학번: 'ap-학번', 전공: 'ap-전공', 전화번호: 'ap-전화번호', 지원계기: 'ap-지원계기' }

// 첫 오류 칸으로 복귀 — 오류 문구가 DOM에 붙은 뒤(setTimeout 0 = React 커밋 이후)에 움직인다.
// 커밋 전에 움직이면 스크롤 앵커링이 이를 취소한다: 화면 위쪽 필드에 .rc-field-error가 삽입되면
// 브라우저가 스크롤 위치를 보정하는데, 그 보정이 진행 중인 스크롤을 끊는다(2026-09-04 실측 — 1,531px 미달로 멈춤).
// rAF 금지 — 배경 탭에서는 콜백이 아예 실행되지 않는다(같은 날 실측: 프레임 콜백 미발화로 복귀 자체가 무산).
// behavior도 smooth(html 전역) 대신 instant — 애니메이션 도중 재보정·사용자 스크롤에 끊기지 않아야 한다.
function focusField(key, majorEtcOn) {
  if (typeof document === 'undefined') return
  const id = key === '전공' && majorEtcOn ? 'ap-전공-기타' : FIELD_INPUT[key]
  setTimeout(() => {
    const el = document.getElementById(id)
    if (!el) return
    el.focus({ preventScroll: true })
    el.scrollIntoView({ block: 'center', behavior: 'instant' })
  }, 0)
}

// 렌더 3분기 = 모집 창 국면(before·open·after) → 창 안이면 백엔드 연결 여부.
// today·configured = 테스트 주입구(기본 = 실제 오늘·env 판정).
export default function RecruitForm({ configured, repos, today = localYmd() }) {
  const window국면 = applyPhase(today)
  const open = configured === undefined ? isBackendReady() : configured
  const [form, setForm] = useState(EMPTY_APPLICATION)
  const [aiChecks, setAiChecks] = useState([])
  const [aiEtc, setAiEtc] = useState('')
  const [aiLevel, setAiLevel] = useState('')            // AI 사용 빈도(단일·선택)
  const [aiSkills, setAiSkills] = useState([])          // 해본 것(다중·선택)
  const [topicChecks, setTopicChecks] = useState([])
  const [majorEtcOn, setMajorEtcOn] = useState(false)   // 전공 = 목록 밖 직접 입력 모드
  const [subType, setSubType] = useState('')            // '' | 부전공 | 복수전공(오너 3차)
  const [subMajor, setSubMajor] = useState('')
  const [subEtcOn, setSubEtcOn] = useState(false)
  const [errors, setErrors] = useState({})
  const [phase, setPhase] = useState('idle')      // idle | busy | done
  const [failure, setFailure] = useState('')
  const [summary, setSummary] = useState('')   // 제출 버튼 옆 요약 — 어느 칸이 걸렸는지

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

  // 학번 라이브 검증(오너 2026-08-18 2차) — 입력 중 10자리 미충족 = 즉시 빨간 표시(설명·예시 미게재).
  const hakbeonBad = form['학번'] !== '' && !isValidHakbeon(form['학번'])

  // 전공 토글 — 목록 값 선택 = 그대로 저장 / '기타' = 직접 입력 모드(입력값이 전공이 된다).
  const onMajorSel = (e) => {
    const v = e.target.value
    if (v === ETC) { setMajorEtcOn(true); setForm((f) => ({ ...f, 전공: '' })) }
    else { setMajorEtcOn(false); setForm((f) => ({ ...f, 전공: v })) }
  }
  const onSubSel = (e) => {
    const v = e.target.value
    if (v === ETC) { setSubEtcOn(true); setSubMajor('') }
    else { setSubEtcOn(false); setSubMajor(v) }
  }
  const onSubType = (e) => {
    const v = e.target.value
    setSubType(v)
    if (!v) { setSubMajor(''); setSubEtcOn(false) }
  }

  async function onSubmit(e) {
    e.preventDefault()
    // 전공 = 주전공 + (있으면) 부/복수전공 합성 문자열 — 검증·저장 둘 다 합성값 기준.
    const merged = { ...form, 전공: composeMajorText(form['전공'], subType, subMajor) }
    const found = validateApplication(merged)
    setErrors(found)
    // 걸린 칸을 이름으로 알려주고(요약) 첫 칸으로 되돌려보낸다 — 예전엔 조용히 return만 해서
    // 화면 밖 빨간 글씨 외에는 아무 신호가 없었다(오너 2026-09-04).
    const stuck = FIELD_ORDER.filter((k) => found[k])
    if (stuck.length > 0) {
      setSummary(`${stuck.map((k) => FIELD_LABEL[k]).join(' · ')} — 확인이 필요합니다. 해당 칸으로 이동했습니다.`)
      focusField(stuck[0], majorEtcOn)
      return
    }
    setSummary('')
    setPhase('busy')
    setFailure('')
    try {
      await submitApplication({
        ...merged,
        써본ai: composeAiProfile(
          composeAiText(aiChecks.filter((v) => v !== ETC), aiChecks.includes(ETC) ? aiEtc : ''),
          aiLevel, aiSkills,
        ),
        관심주제: composeTopicText(topicChecks.filter((v) => v !== ETC), topicChecks.includes(ETC) ? form['관심주제'] : ''),
      }, { repos, configured: open })
      setPhase('done')
    } catch (err) {
      setPhase('idle')
      setFailure(err?.message || '제출 실패 — 다시 시도')
    }
  }

  // 학부/전공 select 공용 옵션(주전공·부/복수전공 동일 목록)
  const majorOptions = (
    <>
      <option value="">선택</option>
      {KWU_MAJORS.map(([college, majors]) => (
        <optgroup key={college} label={college}>
          {majors.map((m) => <option key={m} value={m}>{m}</option>)}
        </optgroup>
      ))}
      <option value={ETC}>기타(직접 입력)</option>
    </>
  )

  return (
    <form className="rc-form" onSubmit={onSubmit} noValidate>
      <p className="rc-field">
        <label htmlFor="ap-이름">이름 <Req /></label>
        <input id="ap-이름" type="text" value={form['이름']} onChange={set('이름')} aria-invalid={Boolean(errors['이름'])} />
        {errors['이름'] && <span className="rc-field-error" role="alert">{errors['이름']}</span>}
      </p>

      <p className="rc-field">
        <label htmlFor="ap-학번">학번 <Req /></label>
        <span className="rc-desc">예: 2026500000</span>
        <input
          id="ap-학번" type="text" inputMode="numeric" value={form['학번']} onChange={set('학번')}
          aria-invalid={hakbeonBad || Boolean(errors['학번'])}
        />
        {(hakbeonBad || errors['학번']) && <span className="rc-field-error" role="alert">학번 확인 필요</span>}
      </p>

      <p className="rc-field">
        <label htmlFor="ap-전공">학부/전공 <Req /></label>
        <select
          id="ap-전공" value={majorEtcOn ? ETC : form['전공']} onChange={onMajorSel}
          aria-invalid={Boolean(errors['전공'])}
        >
          {majorOptions}
        </select>
        {majorEtcOn && (
          <input
            id="ap-전공-기타"
            className="rc-etc-input" type="text" value={form['전공']} onChange={set('전공')}
            placeholder="학부/전공 직접 입력" aria-label="학부/전공 직접 입력"
          />
        )}
        <span className="rc-desc rc-desc-mid">부전공·복수전공이 있으면 함께 표기</span>
        <span className="rc-subrow">
          <select value={subType} onChange={onSubType} aria-label="부·복수전공 구분">
            <option value="">없음</option>
            <option value="부전공">부전공</option>
            <option value="복수전공">복수전공</option>
          </select>
          {subType && (
            <select value={subEtcOn ? ETC : subMajor} onChange={onSubSel} aria-label="부·복수전공 학부/전공">
              {majorOptions}
            </select>
          )}
        </span>
        {subType && subEtcOn && (
          <input
            className="rc-etc-input" type="text" value={subMajor} onChange={(e) => setSubMajor(e.target.value)}
            placeholder={`${subType} 직접 입력`} aria-label={`${subType} 직접 입력`}
          />
        )}
        {errors['전공'] && <span className="rc-field-error" role="alert">{errors['전공']}</span>}
      </p>

      <p className="rc-field">
        <label htmlFor="ap-전화번호">전화번호 <Req /></label>
        <span className="rc-desc">숫자만 입력 — 하이픈 자동 (예: 010-1234-5678)</span>
        <input
          id="ap-전화번호" type="tel" inputMode="numeric" value={form['전화번호']}
          onChange={(e) => setForm((f) => ({ ...f, 전화번호: formatPhone(e.target.value) }))}
          aria-invalid={Boolean(errors['전화번호'])}
        />
        {errors['전화번호'] && <span className="rc-field-error" role="alert">{errors['전화번호']}</span>}
      </p>

      <CheckGroup
        legend="지금까지 써본 AI" desc="중복 선택 가능"
        groups={AI_GROUPS} checked={aiChecks} onToggle={toggleOf(setAiChecks)}
        etcValue={aiEtc} onEtcChange={(e) => setAiEtc(e.target.value)}
        etcPlaceholder="목록에 없는 도구 이름"
      />

      <RadioGroup
        legend="AI를 얼마나 쓰시나요" desc="선택 항목 — 수준 확인용이 아니라 진행 속도를 맞추는 데 씁니다"
        options={AI_USAGE_LEVELS} value={aiLevel} onPick={setAiLevel}
      />

      <CheckGroup
        legend="이 중 해본 것" desc="해당하는 것 모두 선택 — 하나도 안 골라도 됩니다"
        options={AI_SKILLS} checked={aiSkills} onToggle={toggleOf(setAiSkills)} stack
      />

      <CheckGroup
        legend="관심 있는 주제" desc="추후 프로젝트 구성 시 참조. 중복 선택 가능"
        options={RECRUIT_TOPICS} checked={topicChecks} onToggle={toggleOf(setTopicChecks)}
        etcValue={form['관심주제']} onEtcChange={set('관심주제')}
        etcPlaceholder="그 외 다루고 싶은 주제"
      />

      <p className="rc-field">
        <label htmlFor="ap-지원계기">AI를 왜 배우고 싶으신가요</label>
        <span className="rc-desc">
          업무·사업·학업·취업 어느 쪽이든, 그냥 재밌어 보여서도 좋습니다.
          편하게 적어주세요. (최대 {REASON_MAX}자)
        </span>
        <textarea
          id="ap-지원계기" rows={5} maxLength={REASON_MAX}
          value={form['지원계기']} onChange={set('지원계기')}
        />
        {errors['지원계기'] && <span className="rc-field-error" role="alert">{errors['지원계기']}</span>}
      </p>

      <div className="rc-form-foot">
        <p className="rc-form-privacy">{PRIVACY_NOTE}</p>
        {summary && <p className="rc-form-summary" role="alert">{summary}</p>}
        {failure && <p className="rc-field-error" role="alert">{failure}</p>}
        <button className="rc-cta-xl rc-form-submit" type="submit" disabled={phase === 'busy'}>
          {phase === 'busy' ? '제출 중' : '신청 제출'}
        </button>
      </div>
    </form>
  )
}
