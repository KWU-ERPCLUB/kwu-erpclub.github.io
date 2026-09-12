// 과제 양식 레지스트리 — 폼형·체크리스트형 과제가 그릴 입력 칸의 단일원천(2026-09-13 과제 탭 신설).
// 오너 픽: 양식은 코드가 원천이고, 운영 탭은 목록에서 고르기만 한다(칸 편집기 = 버린 대안).
// assignments.양식키(0025) → 이 표의 키. 새 양식 = 여기 객체 하나 추가.
//
// 체크리스트형은 준비물 가이드(prep-guides.js)에서 파생한다 — 항목 이름·묶음이 두 곳으로 갈라지지 않게.
// 폼형 「재료 4가지」도 같은 가이드의 재료 카드에서 파생한다(예시 문구까지 한 벌).
import { PREP_GUIDES, guideHref } from './prep-guides.js'

// 준비물 가이드 → 체크리스트 양식. 항목 = { key, label, group, 하는법 }.
function checklistFrom(guide) {
  return {
    종류: '체크리스트',
    이름: guide.title,
    가이드: guideHref(guide),
    groups: guide.groups.map((g) => g.label),
    items: guide.groups.flatMap((g) => g.items.map((it) => ({
      key: it.id,
      label: it.title,
      group: g.label,
      하는법: `${guideHref(guide)}#item-${it.id}`,
    }))),
  }
}

// 준비물 가이드의 재료 카드 → 폼 양식. 칸 = { key, label, hint, multiline }.
function materialsFrom(guide) {
  const item = guide.groups.flatMap((g) => g.items).find((it) => it.cards?.length > 0)
  if (!item) return null
  return {
    종류: '폼',
    이름: '회차 2 재료 4가지',
    가이드: `${guideHref(guide)}#item-${item.id}`,
    fields: item.cards.map((c, i) => ({
      key: `q${i + 1}`,
      label: c.title,
      hint: `예: ${c.example}`,
      multiline: i === 0 || i === 3,
    })),
  }
}

const OT = PREP_GUIDES[0]

export const ASSIGNMENT_FORMS = {
  ...Object.fromEntries(PREP_GUIDES.map((g) => [`prep-${g.id}`, checklistFrom(g)])),
  ...(materialsFrom(OT) ? { 'materials-4': materialsFrom(OT) } : {}),
}

// 운영 탭 선택지 — [{ key, 종류, 이름 }].
export const FORM_OPTIONS = Object.entries(ASSIGNMENT_FORMS)
  .map(([key, f]) => ({ key, 종류: f.종류, 이름: f.이름 }))

export const KINDS = ['링크', '폼', '체크리스트']

// 과제 행 → 실제로 그릴 종류. 0025 미적용이거나 양식키가 표에 없으면 링크형으로 강등한다
// (다른 강등 규칙과 같은 태도 — 화면이 죽지 않고 지금까지의 방식으로 돌아간다).
export function kindOf(assignment) {
  const kind = assignment?.['종류']
  if (kind !== '폼' && kind !== '체크리스트') return '링크'
  return ASSIGNMENT_FORMS[assignment?.['양식키']] ? kind : '링크'
}

export function formOf(assignment) {
  if (kindOf(assignment) === '링크') return null
  return ASSIGNMENT_FORMS[assignment['양식키']] || null
}
