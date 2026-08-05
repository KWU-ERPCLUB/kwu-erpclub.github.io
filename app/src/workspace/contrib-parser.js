// 기고 1트랙 붙여넣기 파서 — 키트 출력 통짜 텍스트를 폼 필드로 분배하는 순수 함수(부수효과 0).
// 형식 정의(구분자·필드·매핑) = contrib-format.js 단일원천. 폼 상태 주입은 Contribute.jsx 담당(spec §1-3).
import { FIELD_NAMES, FIELD_TO_DRAFT, delimOf } from './contrib-format.js'
import { NATURES, TOPICS } from '../content/schema.js'

// 반환 = { matched, values, notices }
//   matched = 인식한 구분자 수
//   values  = 폼 상태 키(제목·설명·성격·주제·source_url·source_name·본문)로 매핑된 값 — 유효한 것만 담는다
//   notices = 사용자 안내 목록(조용한 실패 금지)
// 규칙(spec §1-3 if-then):
//   구분자 0개        → values 비움 + 형식 안내만(전체를 본문에 넣지 않는다 — 오붙임 방지)
//   필드 누락·빈 값   → 해당 키 미포함(폼 빈칸 유지) + 누락 목록 안내(제출 차단은 required() 담당)
//   성격·주제 enum 밖 → 해당 키 미포함(기본값 유지) + 안내
export function parseContribution(text) {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n')
  const raw = {}
  let cur = null
  let matched = 0
  for (const line of lines) {
    const hit = FIELD_NAMES.find((n) => line.trim() === delimOf(n))
    if (hit) {
      matched += 1
      cur = hit
      if (!(cur in raw)) raw[cur] = []
      continue
    }
    if (cur) raw[cur].push(line)
  }

  if (matched === 0) {
    return {
      matched: 0,
      values: {},
      notices: [`구분자(${delimOf('필드명')}) 없음 — [프롬프트 복사]로 만든 AI 출력 전체를 붙여넣을 것`],
    }
  }

  const values = {}
  const notices = []
  const missing = []
  for (const name of FIELD_NAMES) {
    const v = (raw[name] || []).join('\n').trim()
    if (!v) {
      missing.push(name)
      continue
    }
    if (name === '성격' && !NATURES.includes(v)) {
      notices.push(`성격 '${v}' = 허용값 밖 — 기본값 유지, 폼에서 직접 선택`)
      continue
    }
    if (name === '주제' && !TOPICS.includes(v)) {
      notices.push(`주제 '${v}' = 허용값 밖 — 기본값 유지, 폼에서 직접 선택`)
      continue
    }
    values[FIELD_TO_DRAFT[name]] = v
  }
  if (missing.length) notices.push(`누락 필드: ${missing.join(', ')} — 폼에서 직접 입력`)
  return { matched, values, notices }
}
