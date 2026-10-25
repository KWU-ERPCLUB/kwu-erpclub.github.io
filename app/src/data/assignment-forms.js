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

// 1기 에이전트 과제(2026-10-26 발주) — 지시문 전문을 칸에 붙여 넣어 제출(오너 픽: 파일 업로드 대신).
// 자료 = public/files/aim-agent/(원본 = 워크스페이스 erp-club/docs/aim-에이전트-과제/, 고치면 다시 복사).
const AGENT_FILES = '/files/aim-agent'
const AGENT_ORDER = {
  종류: '폼',
  이름: '1기 에이전트 과제(발주서 A · B · C 중 하나)',
  자료: [
    { label: '과제 파일 한 번에 받기(zip)', href: `${AGENT_FILES}/aim-agent-orders.zip`, 파일명: 'AIM-에이전트-과제-파일.zip' },
    { label: '발주서 A · 공고 고르기', href: `${AGENT_FILES}/order-a.md`, 파일명: '발주서-A-기회공고수집.md' },
    { label: 'A 입력 예시', href: `${AGENT_FILES}/order-a-examples.md`, 파일명: '발주서-A-입력예시.md' },
    { label: '발주서 B · 분야 AI 브리핑', href: `${AGENT_FILES}/order-b.md`, 파일명: '발주서-B-분야브리핑.md' },
    { label: 'B 입력 예시', href: `${AGENT_FILES}/order-b-examples.md`, 파일명: '발주서-B-입력예시.md' },
    { label: '발주서 C · 공고 탭 점검', href: `${AGENT_FILES}/order-c.md`, 파일명: '발주서-C-공고보드점검.md' },
  ],
  fields: [
    { key: 'order', label: '고른 발주서', hint: 'A · B · C 중 하나' },
    {
      key: 'agent', label: '에이전트 지시문 전문', wide: true, rows: 14, count: true,
      hint: '제출할 텍스트 파일 내용을 그대로 붙여 넣기 · A 5,000자 · B · C 4,000자 이내',
    },
  ],
}

export const ASSIGNMENT_FORMS = {
  ...Object.fromEntries(PREP_GUIDES.map((g) => [`prep-${g.id}`, checklistFrom(g)])),
  ...(materialsFrom(OT) ? { 'materials-4': materialsFrom(OT) } : {}),
  'agent-order': AGENT_ORDER,
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
