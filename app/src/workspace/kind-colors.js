// 분류 색 체계 단일원천(2026-08-19 오너) — 홈 캘린더(칩·점·범례·팝업)와 공고 보드 배지가 같은 분류를 쓴다.
// 이 파일 = "무엇이 어느 분류인가"(분류 → CSS 클래스 1:1). 색 값 자체 = styles/workspace-kinds.css 1곳.
// 배경: 공고가 종류와 무관하게 한 색(초록)으로 뭉쳐 캘린더에서 분간이 안 됐다 → 공고 탭 배지 색을 캘린더가 그대로 쓴다.
import { POSTING_KINDS } from './postings-logic.js'

// 분류 = 구독 카테고리와 같은 축(postings-taxonomy CAL_CATEGORIES) — AIM·학사 + 공고 4종.
// AIM = 가장 눈에 띄는 색(채움 pill). 세미나·모집·마감·과제·세션 = 전부 AIM 활동으로 편입(오너 2026-08-19).
export const KIND_CLASS = {
  AIM: 'k-aim',
  학사: 'k-ac',
  공모전: 'k-contest',
  채용: 'k-job',
  자격증: 'k-cert',
  교내활동: 'k-campus',
}

// 알 수 없는 분류(DB 신규 값·마이그레이션 미적용·은퇴 값) = 중립 회색 폴백. 프론트가 깨지지 않게 하는 지점.
export const FALLBACK_CLASS = 'k-etc'

export const kindClass = (category) => KIND_CLASS[category] || FALLBACK_CLASS

// 캘린더 항목 → 분류.
// 공고 항목 = 공고종류(공모전·채용·자격증·교내활동) / events '학사' = 학사 / 그 외 전부 = AIM.
// (과제·세션·주간 기고도 AIM 활동 — 종류 글자는 제목·메타가 계속 알려 준다.)
export function itemCategory(item) {
  if (!item) return ''
  if (item.source === 'posting') return item['공고종류'] || ''
  if (item['종류'] === '학사') return '학사'
  return 'AIM'
}

export const itemClass = (item) => kindClass(itemCategory(item))

// 표시명 — 분류 그대로 쓰되 일정 2종만 풀어 쓴다(공고 탭 칩 라벨과 동일 표기).
export const CATEGORY_LABEL = { 학사: '학사일정', AIM: 'AIM 일정' }
export const categoryLabel = (category) => CATEGORY_LABEL[category] || category

// 항목 메타 한 줄용 표시명 — 분류를 모르면(폴백) 원래 종류 글자를 그대로 보여 준다.
export function itemLabel(item) {
  const cat = itemCategory(item)
  if (!cat || !KIND_CLASS[cat]) return item?.['종류'] || ''
  return categoryLabel(cat)
}

// 캘린더 범례 = AIM·학사 + 공고 4종(공고 종류 원천 = postings-logic POSTING_KINDS — 여기에 나열하지 않는다).
export const LEGEND_CATEGORIES = ['AIM', '학사', ...POSTING_KINDS]
