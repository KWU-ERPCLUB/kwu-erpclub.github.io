// 공고 탭 순수 로직(2026-08-07 공고 탭 신설) — 화면 없는 계산만. 테스트 대상.
// 원칙(리서치 2026-08-07): 모집중/마감은 저장하지 않고 접수마감에서 파생 — 죽은 공고가 쌓이는 게시판형 문제를 구조로 차단.
// 공고 행 계약: { 제목, 종류('공모전'|'채용'|'자격증'|'대외활동'), 주최, url, 접수시작?, 접수마감?, 시험일?, 코멘트, 고정 }
// '자격시험' → '자격증' 개명(2026-08-18 오너) — DB 정합 = migration 0015(기존 행 update 포함).

export const POSTING_KINDS = ['공모전', '채용', '자격증', '대외활동']

// 상태 파생 — 접수마감 없음: 시험일 있으면 예정/마감(시험일 기준), 없으면 상시.
// 접수마감 있음: 마감 지남 = 마감 / 접수시작 전 = 접수전 / 그 외 = 접수중.
export function postingStatus(row, todayKey) {
  if (!row['접수마감']) {
    if (row['시험일']) return row['시험일'] < todayKey ? '마감' : '예정'
    return '상시'
  }
  if (row['접수마감'] < todayKey) return '마감'
  if (row['접수시작'] && row['접수시작'] > todayKey) return '접수전'
  return '접수중'
}

// 우선순위 2단(오너 2026-08-19 재판정): ★ 내 관심 → 전체. 같은 단 안에서는 임박순.
// interestIds = 로그인 사용자가 ★ 체크한 공고 id(posting_interests). 개인별로 달라지는 유일한 축.
// `고정`은 정렬에서 쓰지 않는다 — 오너가 설정한 적 없는 값이라 위계로 세우면 근거 없는 순서가 된다.
// 데이터·홈 캘린더 '다가오는 업무' 플래그로는 그대로 살아 있다(postingAgendaItems의 중요).
export const postingRank = (row, interestIds = []) => (interestIds.includes(row.id) ? 0 : 1)

// 목록 정렬 — 활성(접수중·접수전: 3단 우선순위 → 마감 임박순) → 상시(3단) → 마감(최근 마감 먼저).
// 반환 = { active, always, closed } 세 묶음(화면이 마감 묶음을 접어 렌더).
export function groupPostings(rows, todayKey, interestIds = []) {
  const active = []
  const always = []
  const closed = []
  for (const r of rows || []) {
    const s = postingStatus(r, todayKey)
    if (s === '마감') closed.push(r)
    else if (s === '상시') always.push(r)
    else active.push(r)
  }
  const byRank = (a, b) => postingRank(a, interestIds) - postingRank(b, interestIds)
  const keyOf = (r) => r['접수마감'] || r['시험일'] || ''   // 예정(접수 없는 시험) = 시험일이 임박 기준
  active.sort((a, b) => byRank(a, b) || (keyOf(a) < keyOf(b) ? -1 : keyOf(a) > keyOf(b) ? 1 : 0))
  always.sort(byRank)
  closed.sort((a, b) => (a['접수마감'] < b['접수마감'] ? 1 : a['접수마감'] > b['접수마감'] ? -1 : 0))
  return { active, always, closed }
}

// 섹션 분할(오너 2026-08-19) — 정렬된 목록을 라벨 묶음으로. 빈 묶음은 화면이 숨긴다.
// 상시 공고는 접수일이 없어 임박 정렬이 무의미 → 활성 묶음 뒤에 '상시' 한 섹션으로 붙인다.
export const SECTION_LABELS = ['★ 내 관심', '전체']

export function sectionPostings(active, always, interestIds = []) {
  const buckets = [[], []]
  for (const r of active) buckets[postingRank(r, interestIds)].push(r)
  const sections = buckets
    .map((items, i) => ({ key: SECTION_LABELS[i], label: SECTION_LABELS[i], items }))
    .filter((s) => s.items.length > 0)
  if (always.length > 0) sections.push({ key: '상시', label: '상시 모집', items: always })
  return sections
}

// 종류 필터 — '전체'는 통과. sub(세부 분류, 2026-08-18) = 값이 있으면 분류 일치만('전체'·빈 값 = 통과).
export const filterPostings = (rows, kind, sub) => {
  const byKind = !kind || kind === '전체' ? rows : rows.filter((r) => r['종류'] === kind)
  return !sub || sub === '전체' ? byKind : byKind.filter((r) => (r['분류'] || '') === sub)
}

// 홈 캘린더 합류 항목 — 접수마감·시험일을 캘린더 계약({ date, 제목, 종류:'공고', 중요, source, id })으로 변환.
// 마감 지난 날짜도 그대로 둔다(캘린더는 과거 달 조회가 정상 동작). 중요(★) = 고정 겸용(다가오는 업무 노출).
// 공고종류·분류 = 구독 필터(postings-taxonomy.js filterAgendaBySubs)가 소비(2026-08-18 구독 개인화).
export function postingAgendaItems(rows) {
  const items = []
  for (const r of rows || []) {
    const 중요 = Boolean(r['고정'])
    const base = { 종류: '공고', 시간: '', 설명: r['코멘트'] || '', 중요, url: r.url || '', 주최: r['주최'] || '', 공고종류: r['종류'], 분류: r['분류'] || '', posting_id: r.id, source: 'posting' }
    if (r['접수마감']) items.push({ ...base, date: r['접수마감'], 제목: `접수 마감 — ${r['제목']}`, id: `${r.id}-due` })
    if (r['시험일']) items.push({ ...base, date: r['시험일'], 제목: `시험일 — ${r['제목']}`, id: `${r.id}-exam` })
  }
  return items
}
