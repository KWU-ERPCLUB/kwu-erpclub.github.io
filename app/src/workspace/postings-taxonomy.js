// 공고 세부 분류 레지스트리 + 구독 매칭(spec 2026-08-18 공고 구독·개인화) — 화면 없는 값·계산만. 테스트 대상.
// 세부 분류 값의 유일 원천: DB는 text라 여기 목록이 표기를 고정한다(등록 폼 = 선택만 — 표기 drift 차단).
// 값 개명 금지(기존 DB 행과 어긋남) — 은퇴 값은 retired:true로 남긴다(등록 폼에서만 숨김, 필터·구독 매칭은 유지).
// 신규 값 추가 = 이 파일 1곳(마이그레이션 불필요).

export const TAXONOMY = {
  자격시험: [
    { id: 'ADsP' }, { id: 'SQLD' }, { id: '컴활' }, { id: 'SAP' }, { id: '정보처리기사' }, { id: '기타' },
  ],
  채용: [
    { id: '대기업' }, { id: '중견중소' }, { id: '공기업공공' }, { id: '스타트업' }, { id: '기타' },
  ],
  공모전: [
    { id: '정부공공' }, { id: '기업' }, { id: '학회대학' }, { id: '기타' },
  ],
  대외활동: [
    { id: '서포터즈' }, { id: '교육부트캠프' }, { id: '기타' },
  ],
}

// 등록 폼 선택지(은퇴 값 제외). 종류에 세부가 없으면 빈 배열.
export const taxonomyOptions = (kind) => (TAXONOMY[kind] || []).filter((t) => !t.retired).map((t) => t.id)

// 캘린더 구독 카테고리 = 공고 4종 + 일정 2종(학사·AIM). AIM = events 기존 4종(일정·세미나·모집·마감)의 묶음 해석.
export const CAL_CATEGORIES = ['공모전', '채용', '자격시험', '대외활동', '학사', 'AIM']

// 기본 구독(오너 확정 2026-08-18) — 학사+AIM만. 공고류는 opt-in(캘린더 오염의 근본 해소).
export const DEFAULT_SUBS = [
  { 종류: '학사', 분류: '' },
  { 종류: 'AIM', 분류: '' },
]

// 구독 행 0건 = 기본 구독으로 해석. null(0014 미적용 강등) = null 그대로(호출부가 "전체 켜짐" 처리).
export const effectiveSubs = (rows) => {
  if (rows === null || rows === undefined) return null
  return rows.length > 0 ? rows : DEFAULT_SUBS
}

// 매칭(spec §1) — 구독에 걸림 ⇔ ∃행: 종류 일치 ∧ (분류 '' = 전체 ∨ 분류 일치).
export const subMatches = (subs, kind, sub = '') =>
  (subs || []).some((s) => s['종류'] === kind && (s['분류'] === '' || s['분류'] === (sub || '')))

// 정확히 이 (종류, 분류) 행이 있는가 — 구독 토글 버튼의 on/off 표시용(전체 구독이 세부를 덮는 경우와 구분).
export const hasSubRow = (subs, kind, sub = '') =>
  (subs || []).some((s) => s['종류'] === kind && s['분류'] === (sub || ''))

// event 행 → 구독 카테고리('학사' 종류만 학사, 나머지 전부 AIM).
export const eventCategory = (row) => (row?.['종류'] === '학사' ? '학사' : 'AIM')

// 홈 캘린더 항목 필터(spec §4) — subs null = 강등(전부 통과). 과제·세션·주간 기고 = 구독 무관 상시 통과.
// posting 항목 = 공고종류·분류(postingAgendaItems가 실어줌), event 항목 = 종류에서 학사/AIM 파생.
export function filterAgendaBySubs(items, subsRows) {
  const subs = effectiveSubs(subsRows)
  if (subs === null) return items
  return (items || []).filter((it) => {
    if (it.source === 'posting') return subMatches(subs, it['공고종류'], it['분류'])
    if (it.source === 'event') return subMatches(subs, it['종류'] === '학사' ? '학사' : 'AIM')
    return true   // assignment·session·weekly = 스터디 의무(구독 대상 아님)
  })
}

// 토글 계획(첫 변경 실체화 포함) — 저장할 행 목록을 계산한다(쓰기는 호출부·저장소가 수행).
// 반환 = { writes: [{종류,분류,on}] }: 행 0건 상태의 첫 변경이면 기본 구독을 먼저 실체화한 뒤 요청을 적용.
export function planToggle(rows, kind, sub, on) {
  const writes = []
  if ((rows || []).length === 0) {
    for (const d of DEFAULT_SUBS) {
      if (!(d['종류'] === kind && d['분류'] === (sub || ''))) writes.push({ ...d, on: true })
    }
  }
  writes.push({ 종류: kind, 분류: sub || '', on })
  return { writes }
}
