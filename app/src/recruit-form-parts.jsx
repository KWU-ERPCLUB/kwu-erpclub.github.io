// /recruit 신청 폼 위젯 조각 — RecruitForm.jsx 300줄 규격 초과로 분리(2026-08-21, recruit-parts.jsx 전례).
// RecruitForm.jsx = 폼 상태·검증·제출 / 이 파일 = 입력 위젯 3종 + 선택지 상수(마크업·클래스 그대로 이관).

// 필수 표시 * — 구글폼 문법
export const Req = () => <span className="rc-req" aria-label="필수">*</span>

// 써본 AI 체크 선택지 — 2026-08-18 4차: 분류 틀로 구분(오너 — "주르르 나열은 선택 기준이 없다").
// [분류 라벨, [도구…]]. '없음'도 유효한 답(초심자 환영이 모집 방침). 목록 밖 = 마지막 그룹의 기타 체크.
export const AI_GROUPS = [
  ['대화형 AI (LLM 챗봇)', ['ChatGPT', 'Claude', 'Gemini', 'Grok', 'DeepSeek', '뤼튼']],
  ['코딩·에이전트 AI', ['Claude Code', 'Codex', 'Cursor', 'Copilot']],
  ['검색·리서치 AI', ['Perplexity', 'NotebookLM']],
  ['그 외', ['없음']],
]

// 기타 체크값 — 합성 시 제외하고 입력 텍스트만 쓴다(compose* 호출부에서 필터).
export const ETC = '기타'

// 체크 그룹 공용 — fieldset + 체크박스 칩(구글폼 문법). checked = 배열 상태.
// options = 평면 목록 / groups = [분류 라벨, 목록] 배열(써본 AI). etc 주면 마지막에 '기타' 체크 + 입력 노출.
// 목록 원소는 문자열 또는 [저장값, 화면 라벨] 쌍(2026-08-21 — 저장 키와 화면 문구를 분리한 AI_SKILLS용).
export function CheckGroup({ legend, desc, options, groups, checked, onToggle, etcValue, onEtcChange, etcPlaceholder, stack }) {
  const hasEtc = onEtcChange !== undefined
  const etcOn = checked.includes(ETC)
  const grouped = groups || [[null, options]]
  const chip = (opt) => {
    const [value, label] = Array.isArray(opt) ? opt : [opt, opt]
    return (
      <label key={value} className="rc-check">
        <input type="checkbox" checked={checked.includes(value)} onChange={() => onToggle(value)} />
        {label}
      </label>
    )
  }
  return (
    <fieldset className="rc-field rc-checkset">
      <legend>{legend}</legend>
      {desc && <p className="rc-desc">{desc}</p>}
      {grouped.map(([cat, opts], i) => (
        <div key={cat || 'flat'}>
          {cat && <span className="rc-check-cat">{cat}</span>}
          <div className={stack ? 'rc-checks rc-checks-stack' : 'rc-checks'}>
            {opts.map(chip)}
            {hasEtc && i === grouped.length - 1 && (
              <label className="rc-check">
                <input type="checkbox" checked={etcOn} onChange={() => onToggle(ETC)} />
                {ETC}
              </label>
            )}
          </div>
        </div>
      ))}
      {hasEtc && etcOn && (
        <input
          className="rc-etc-input" type="text" value={etcValue} onChange={onEtcChange}
          placeholder={etcPlaceholder} aria-label={`${legend} — 기타 직접 입력`}
        />
      )}
    </fieldset>
  )
}

// 단일 선택 그룹 — AI 사용 빈도(선택 항목: 고른 값을 다시 누르면 해제된다).
export function RadioGroup({ legend, desc, options, value, onPick, stack }) {
  return (
    <fieldset className="rc-field rc-checkset">
      <legend>{legend}</legend>
      {desc && <p className="rc-desc">{desc}</p>}
      <div className={stack ? 'rc-checks rc-checks-stack' : 'rc-checks'}>
        {options.map((opt) => (
          <label key={opt} className="rc-check">
            <input
              type="radio" name="ap-ai수준" checked={value === opt}
              onChange={() => onPick(opt)} onClick={() => value === opt && onPick('')}
            />
            {opt}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
