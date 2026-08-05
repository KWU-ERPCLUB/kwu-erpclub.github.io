// AIM 모집 데이터 — 기수·모집 창·활동 일정의 유일 원천(값 원천 = erp-club docs/specs/2026-07-27-aim-운영틀.md §2·§3·§7).
// 국면 전환(home-logic recruitPhase)·메인 모집 밴드·FAQ·모집 페이지 문구가 전부 여기서 파생 →
// 다음 기수 전환·기간 변경 = 이 파일 1곳 수정(표시 문자열 중복 0).
export const RECRUIT = {
  study: 'AIM',
  cohort: '1기',
  term: '2학기',
  window: { start: '2026-08-25', end: '2026-09-08' }, // 모집 창(경계일 포함)
  활동기간: '2026-09 ~ 12 (2학기)',
  일정: {
    전반: { 기간: '9월 ~ 10월 초', 회차: 5 },
    휴지: { 라벨: '10월 중순', start: '2026-10-06', end: '2026-10-26' },
    후반: { 기간: '10월 말 ~ 12월' },
  },
}

// 1차·2차 프로젝트 일정 — 명명 = 운영틀 「개정 이력 추가(2026-08-05)」(전반부→1차 프로젝트/후반부→2차 프로젝트, 대외 표기).
// 날짜 = 운영틀 §2 시즌 캘린더 산출값만(주간 앵커 = 해당 주 시작일). 최종 발표 주간 = [미정] — 여기에 두지 않는다(게재 금지).
export const PHASES = {
  p1: {
    라벨: '1차 프로젝트',
    형태: '개인 산출물',
    킥오프주간: '2026-09-07',   // §2 킥오프(개강 2주차)
    쇼케이스주간: '2026-10-05', // §2 전반부 마지막 회 = 중간 쇼케이스
    회차: RECRUIT.일정.전반.회차,
  },
  휴지: {
    start: RECRUIT.일정.휴지.start,
    end: RECRUIT.일정.휴지.end,
    중간고사: { start: '2026-10-20', end: '2026-10-26' }, // §2 학사일정(사실)
  },
  p2: {
    라벨: '2차 프로젝트',
    형태: '팀',
    개시주간: '2026-10-27',     // §2 후반부 개시(주제 발표·팀 편성)
    상한주간: '2026-11-23',     // 기말(12-08) 2주 전 활동 중지 → 상한
    기말고사: { start: '2026-12-08', end: '2026-12-14' }, // §2 학사일정(사실)
  },
}

// 학사일정 연동 원칙(운영틀 개정 2026-08-05 명문화) — 활동 안내 공용 1줄(사실 서술·개조식).
export const ACADEMIC_RULE = '광운대 학사일정 연동 — 시험(중간·기말) 2주 전부터 활동 중지'

// 'AIM 1기' — 기수 전체 표기(밴드·로그·모집 페이지 공용).
export const COHORT_LABEL = `${RECRUIT.study} ${RECRUIT.cohort}`

// 'YYYY-MM-DD' → 'MM-DD'(같은 해 두 번째 날짜·짧은 표기용).
export function shortDate(ymd) {
  return String(ymd).slice(5)
}

// '2026-08-25 ~ 2026-09-08' — 요강 등 전체 표기.
export function formatWindow(win = RECRUIT.window) {
  return `${win.start} ~ ${win.end}`
}

// '2026-08-25 ~ 09-08' — 한 줄 문구용 짧은 표기.
export function formatWindowShort(win = RECRUIT.window) {
  return `${win.start} ~ ${shortDate(win.end)}`
}
